create table IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  name VARCHAR(40) UNIQUE,
  password VARCHAR(40),
  api_key VARCHAR(40)
);

create table IF NOT EXISTS channels (
    id INTEGER PRIMARY KEY,
    name VARCHAR(40)
);

create table IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  channel_id INTEGER,
  body TEXT,
  post_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  num_replies INTEGER DEFAULT 0,
  replies_to INTEGER DEFAULT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(channel_id) REFERENCES channels(id)
  FOREIGN KEY(replies_to) REFERENCES messages(id)
);

create table IF NOT EXISTS reactions (
    emoji VARCHAR(40),
    msg_id INTEGER,
    user_id INTEGER,
    FOREIGN KEY(msg_id) REFERENCES messages(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
);