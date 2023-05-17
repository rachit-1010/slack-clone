import string
import random
from datetime import datetime
from flask import *
from functools import wraps
import sqlite3


app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.config['DB_NAME'] = 'db/belaydb.sqlite3'

def get_db():
    db = getattr(g, '_database', None)

    if db is None:
        db = g._database = sqlite3.connect(app.config['DB_NAME'])
        db.row_factory = sqlite3.Row
        setattr(g, '_database', db)
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def query_db(query, args=(), one=False):
    db = get_db()
    cursor = db.execute(query, args)
    rows = cursor.fetchall()
    db.commit()
    cursor.close()
    if rows:
        if one: 
            return rows[0]
        return rows
    return None


@app.route('/')
@app.route('/login')
@app.route('/channel/<int:channel_id>')
@app.route('/thread/<int:msg_id>')
@app.route('/profile')
def index(channel_id=None, msg_id=None):
    return app.send_static_file('index.html')

# APIs

@app.route('/api/login', methods=['POST'])
def login():
    body = request.get_json()
    if body and 'username' in body and 'password' in body:
        user = query_db('select * from users where name = ? and password = ?', (body['username'], body['password']), one=True)
        if user:
            resp = {
                'username': user['name'],
                'api_key': user['api_key']
            }
            return jsonify(resp)
        else:
            return jsonify({'error': 'Invalid username or password'}), 401


@app.route('/api/signup', methods=['POST'])
def signup():
    body = request.get_json()
    if body and 'username' in body and 'password' in body:
        api_key = ''.join(random.choices(string.ascii_lowercase + string.digits, k=40))
        u = query_db('insert into users (name, password, api_key) ' + 
        'values (?, ?, ?) returning id, name, password, api_key',
        (body['username'], body['password'], api_key),
        one=True)
        resp = {
            'username': u['name'],
            'api_key': u['api_key']
        }
        return jsonify(resp)
    else:
        return jsonify({'error': 'Invalid request'}), 401


@app.route('/api/getchannels', methods=['GET'])
def getchannels():
    print("inside getchannels")
    api_key = request.headers.get('api_key')
    user = query_db('select * from users where api_key = ?', (api_key,), one=True)
    if user:
        channels = query_db('select * from channels')
        resp = []
        for channel in channels:
            resp.append({
                'id': channel['id'],
                'name': channel['name']
            })
        print(jsonify(resp))
        return jsonify(resp)
    else:
        return jsonify({'error': 'Invalid User'}), 401


@app.route('/api/getmsgs/<int:channel_id>', methods=['GET'])
def getmsgs(channel_id):
    api_key = request.headers.get('api_key')
    user = query_db('select * from users where api_key = ?', (api_key,), one=True)
    if user:
        msgs = query_db('select messages.id, messages.body, users.name, messages.post_time, messages.num_replies from messages left join users on users.id=messages.user_id where channel_id = ?', [channel_id])
        resp = []
        if msgs != None:
            for msg in msgs:
                resp.append({
                    'msgId': msg['id'],
                    'username': msg['name'],
                    'text': msg['body'],
                    'time': msg['post_time'],
                    'num_replies': msg['num_replies'],
                })
        return jsonify(resp)
    else:
        return jsonify({'error': 'Invalid User'}), 401


@app.route('/api/getreplies/<int:msg_id>', methods=['GET'])
def getreplies(msg_id):
    api_key = request.headers.get('api_key')
    user = query_db('select * from users where api_key = ?', (api_key,), one=True)
    if user:
        replies = query_db('select messages.id, messages.body, users.name, messages.post_time from messages left join users on users.id=messages.user_id where messages.replies_to = ?', [msg_id])
        replies_to = query_db('select messages.id, messages.body, users.name, messages.post_time from messages left join users on users.id=messages.user_id where messages.id = ?', [msg_id], one=True)
        print(replies_to)
        resp = []
        if replies_to != None:
            resp.append({
                'msgId': replies_to['id'],
                'username': replies_to['name'],
                'text': replies_to['body'],
                'time': replies_to['post_time']
            })
        if replies != None:
            for reply in replies:
                resp.append({
                    'msgId': reply['id'],
                    'username': reply['name'],
                    'text': reply['body'],
                    'time': reply['post_time']
                })
        return jsonify(resp)
    else:
        return jsonify({'error': 'Invalid User'}), 401


@app.route('/api/postmsg', methods=['POST'])
def postmsg():
    api_key = request.headers.get('api_key')
    user = query_db('select * from users where api_key = ?', (api_key,), one=True)
    if user:
        body = request.get_json()
        if body and 'channel_id' in body and 'text' in body:
            msg = query_db('insert into messages (user_id, channel_id, body) ' + 
            'values (?, ?, ?) returning id, user_id, channel_id, body, post_time',
            (user['id'], body['channel_id'], body['text']),
            one=True)
            resp = {
                'msgId': msg['id'],
                'username': user['name'],
                'text': msg['body'],
                'time': msg['post_time']
            }
            return jsonify(resp)
        else:
            return jsonify({'error': 'Invalid request'}), 404
    else:
        return jsonify({'error': 'Invalid User'}), 401
    

@app.route('/api/postreply', methods=['POST'])
def postreply():
    api_key = request.headers.get('api_key')
    user = query_db('select * from users where api_key = ?', (api_key,), one=True)
    if user:
        body = request.get_json()
        if body and 'msg_id' in body and 'text' in body:
            msg = query_db('insert into messages (user_id, body, replies_to) ' + 
            'values (?, ?, ?) returning id, user_id, body, post_time',
            (user['id'], body['text'], body['msg_id']),
            one=True)

            query_db('update messages set num_replies = num_replies + 1 where id = ?', [body['msg_id']])

            resp = {
                'msgId': msg['id'],
                'username': user['name'],
                'text': msg['body'],
                'time': msg['post_time']
            }
            return jsonify(resp)
        else:
            return jsonify({'error': 'Invalid request'}), 404
    else:
        return jsonify({'error': 'Invalid User'}), 401
    

@app.route('/api/changeusername', methods=['POST'])
def changeusername():
    api_key = request.headers.get('api_key')
    user = query_db('select * from users where api_key = ?', (api_key,), one=True)
    if user:
        body = request.get_json()
        if body and 'username' in body:
            query_db('update users set name = ? where id = ?', (body['username'], user['id']))
            return jsonify({'success': 'Username changed'})
        else:
            return jsonify({'error': 'Invalid request'}), 401
    else:
        return jsonify({'error': 'Invalid User'}), 401

@app.route('/api/changepassword', methods=['POST'])
def changepassword():
    api_key = request.headers.get('api_key')
    user = query_db('select * from users where api_key = ?', (api_key,), one=True)
    if user:
        body = request.get_json()
        if body and 'password' in body:
            query_db('update users set password = ? where id = ?', (body['password'], user['id']))
            return jsonify({'success': 'Password changed'})
        else:
            return jsonify({'error': 'Invalid request'}), 401
    else:
        return jsonify({'error': 'Invalid User'}), 401
    

@app.route('/api/addchannel', methods=['POST'])
def addchannel():
    api_key = request.headers.get('api_key')
    user = query_db('select * from users where api_key = ?', (api_key,), one=True)
    if user:
        body = request.get_json()
        channel_name = 'New Channel #5432'
        if body and 'channelname' in body:
            channel_name = body['channelname']

        r = query_db('insert into channels (name) values (?) returning id, name', [channel_name], one=True)
        resp = {
            'id': r['id'],
            'name': r['name']
        }
        return jsonify(resp)
    else:
        return jsonify({'error': 'Invalid User'}), 401
