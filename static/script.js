// --------------------------------------------------------------
// Starting of left panel
// --------------------------------------------------------------


class Channel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            channelId: props.channelId,
            channelname: props.channelname,
            changeChannelFn: props.changeChannelFn,
            changeURLPathFn: props.changeURLPathFn,
            active: props.active,
            changeSmallWindowState: props.changeSmallWindowState,
        }
    }

    componentDidUpdate(prevProps) {
        if (this.state.active != this.props.active ) {
            this.setState({
                active: this.props.active
            })
        }
    }

    render() {
        return (
            <div className={`channel ${this.state.active ? "active" : ""}`} onClick={()=>{
                this.state.changeChannelFn(this.state.channelId)
                this.state.changeURLPathFn("/channel/" + this.state.channelId)
                this.state.changeSmallWindowState(2)
            }}>
                <div className="hash">#</div>
                
                <div className={`channelname ${this.state.active ? "active" : ""}`}>{this.state.channelname}</div>
            </div>
        )
    }
}


class LeftPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            channels: [],
            changeChannelFn: props.changeChannelFn,
            changeURLPathFn: props.changeURLPathFn,
            channelId: props.channelId,
            changeSmallWindowState: props.changeSmallWindowState,
        }
        this.getChannels();

        // Bind state to addChannel function
        this.addChannel = this.addChannel.bind(this);

        // Bind state to getChannels function
        this.getChannels = this.getChannels.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (this.state.channelId != this.props.channelId) {
            this.setState({
                channelId: this.props.channelId
            })
        }
    }


    getChannels () {
        console.log("getChannels() called");
        let api_key = window.localStorage.getItem("shahrm_belay_auth_key");
        
        fetch("/api/getchannels", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "api_key": api_key,
            }
        }).then((response) => {
            // console.log(response);
            return response.json();
        })
        .then(data => {
            console.log("inside then data");
            console.log(data);
            this.setState({
                channels: data
            })
        })
    }

    addChannel () {
        let channelname = document.getElementById("addChannelInput").value;
        console.log(channelname);
        let api_key = window.localStorage.getItem("shahrm_belay_auth_key");
        fetch("/api/addchannel", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api_key": api_key,
            },
            body: JSON.stringify({
                "channelname": channelname
            })
        }).then((response) => {
            // console.log(response);
            return response.json();
        }
        ).then(data => {
            console.log("inside then data");
            console.log(data);
            this.getChannels();
        }
        )
    }

    render() {
        
        // let channels = getChannels();
        console.log("leftpanel render", this.state.channels)
        console.log();
        return(
            <div id="leftpanelcontainer">
                <div id="channelsheader">Channels</div>

                <div className="channels">
                    {this.state.channels && this.state.channels.map((channel) => (<Channel key={channel.id} channelname={channel.name} channelId={channel.id} changeChannelFn={this.state.changeChannelFn} changeURLPathFn={this.state.changeURLPathFn} active={channel.id==this.state.channelId ? true : false} changeSmallWindowState={this.state.changeSmallWindowState}/>))}
                    
                </div>
                <div className="channels">
                    <div className="channel" id="addchannels">
                        <div className="hash"><span id="plus">+</span></div>
                        <div className="channelname">Add channels</div>
                    </div>
                    <div id="addChannelBox">
                        <div>
                            <input type="text" id="addChannelInput" placeholder="Enter channel name"></input>
                        </div>
                        <div>
                            <button id="addChannelBtn" onClick={this.addChannel}>Add</button>
                        </div>
                    </div>

                </div>
                
            </div>
        )
    }
}


// --------------------------------------------------------------
// Starting of middle panel
// --------------------------------------------------------------

class AddEmojis extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            toggleEmojiPanel: false,
            selectedEmoji: ""
        }
        // bind state to addEmoji function
        this.addEmoji = this.addEmoji.bind(this);
    }

    handleBtnClick = () => {
        this.setState({
            toggleEmojiPanel: !this.state.toggleEmojiPanel
        })
    }

    addEmoji(e) {
        if (this.state.selectedEmoji === e.target.innerHTML){
            this.setState({
                selectedEmoji: ""
            })
        }
        else {
            this.setState({
                selectedEmoji: e.target.innerHTML
            })

        }
    }

    emojiPanel = (props) => {
        if (this.state.toggleEmojiPanel) {
            return (
                <div className="emojipanel">
                    <button className="emojilist" onClick={this.addEmoji}>&#128512;</button>
                    <button className="emojilist" onClick={this.addEmoji}>&#128514;</button>
                    <button className="emojilist" onClick={this.addEmoji}>&#9996;</button>
                    <button className="emojilist" onClick={this.addEmoji}>&#128540;</button>
                    <button className="emojilist" onClick={this.addEmoji}>&#128519;</button>
                    <button className="emojilist" onClick={this.addEmoji}>&#128521;</button>
                    <button className="emojilist" onClick={this.addEmoji}>&#128523;</button>
                    <button className="emojilist" onClick={this.addEmoji}>&#128527;</button>
                </div>
            )
        }
    }

    ifShowEmoji = (props) => {
        if (this.state.selectedEmoji != "") {
            return (
                <button className="addemojibtn" onClick={this.addEmoji} id="selectedEmoji">{this.state.selectedEmoji}</button>
            )
        }
        else{
            return null;
        }
    }


    render() {
        return (
            <div className="addemojis">
                <this.ifShowEmoji />
                {/* <button className="addemojibtn">{this.state.selectedEmoji}</button> */}
                <button className="addemojibtn" onClick={this.handleBtnClick}>&#128512; +</button>
                {this.emojiPanel()}
            </div>
        )
    }
}

class ReplyPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            msgId: props.msgId,
            nreplies: props.nreplies,
            showRepliesFn: props.showRepliesFn,
            changeURLPathFn: props.changeURLPathFn,
            changeSmallWindowState: props.changeSmallWindowState
        }
    }

    componentDidUpdate(prevProps,prevState) {
        if (this.state.msgId !== this.props.msgId || this.state.nreplies !== this.props.nreplies) {
            this.setState({
                msgId: this.props.msgId,
                nreplies: this.props.nreplies,
            })
        }
    }

    render() {
        // {console.log("inside Replypanel Render", this.state.msgId)}

        if (this.state.nreplies >= 0) {
            return (
                <div className="replypanel" onClick={() => {
                    console.log("replypanel clicked", this.state.msgId);
                    this.state.showRepliesFn(this.state.msgId);
                    this.state.changeURLPathFn("/thread/" + this.state.msgId);
                    this.state.changeSmallWindowState(3);
                }
                }>
                    <a href="javascript:void(0);" className="replytext">{this.state.nreplies} replies</a>
                </div>
            )
        }
        else {
            return null;
        }
    }  
}

class Message extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            msgId: props.msgId,
            message: props.message,
            author: props.author,
            time: props.time,
            totalReplies: props.nreplies,
            showRepliesFn: props.showRepliesFn,
            changeURLPathFn: props.changeURLPathFn,
            changeSmallWindowState: props.changeSmallWindowState,
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.toggleReplyPanel !== this.props.viewReplies || this.state.msgId !== this.props.msgId || this.state.message !== this.props.message || this.state.author !== this.props.author || this.state.time !== this.props.time || this.state.totalReplies !== this.props.nreplies || this.state.showRepliesFn !== this.props.showRepliesFn) {
            this.setState({
                msgId: this.props.msgId,
                message: this.props.message,
                author: this.props.author,
                time: this.props.time,
                totalReplies: this.props.nreplies,
                showRepliesFn: this.props.showRepliesFn,
                toggleReplyPanel: this.props.viewReplies,
            });
        }
    }


    render() {
        // console.log("inside Message Render")
        return (
            <div className="message">
                <div className="messageauthor">
                    {this.state.author}
                </div>
                <div className="messagetime">
                    {this.state.time}
                </div>
                <div className="messagecontent">
                    {this.state.message}
                </div>
                <div className="emojirow">
                    <AddEmojis />
                </div>
                <div className="replies">
                    <ReplyPanel nreplies={this.state.totalReplies} showRepliesFn={this.state.showRepliesFn} msgId={this.state.msgId} changeURLPathFn={this.state.changeURLPathFn} changeSmallWindowState={this.state.changeSmallWindowState}/>
                </div>
            </div>
        )
    }
}




class MiddlePanel extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            toggleReplyPanel: props.viewReplies,
            showRepliesFn: props.showRepliesFn,
            messages: [],
            channel: props.channel,
            changeURLPathFn: props.changeURLPathFn,
            changeSmallWindowState: props.changeSmallWindowState,
        }
        this.getMessages();
        // setInterval(this.getMessages, 500);

        // Bind variables to function calls
        this.getMessages = this.getMessages.bind(this);

        let msgsmsgs = document.getElementById("msgsmsgs");
        if (msgsmsgs != null) {
            msgsmsgs.innerHTML = "";
        }
    }

    componentDidMount() {
        let getMsgsIntervalVar = setInterval(this.getMessages, 500);
    }

    componentDidUpdate(prevProps, prevState) {
        // console.log("MidPanel : componentDidUpdate")
        if (this.state.toggleReplyPanel !== this.props.viewReplies || this.state.channel !== this.props.channel) {
            this.setState({
                toggleReplyPanel: this.props.viewReplies,
                channel: this.props.channel,
            });
        }
    }

    getMessages () {

        let api_key = window.localStorage.getItem("shahrm_belay_auth_key");

        // For testing purposes
        // DELETE THIS LATER
        // api_key = "rachitapikey"

        let channel_id = this.state.channel;
        // console.log("channel_id", channel_id);

        fetch('/api/getmsgs/' + channel_id, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "api_key": api_key
            }
        }).then(response => {
            if (response.status == 200) {
                return response.json();
            }
            else {
                return null;
            }
        }).then(data => {
            // console.log("getmsgs data",data)
            if (data != null) {
                this.setState({
                    messages: data
                })
            }
        })

    }

    render() {
        // console.log("MidPanel : render", this.state.messages)
        if (this.state.changeSmallWindowState !== null) {
            var backbtn = <button onClick={() => {
                this.state.changeSmallWindowState(1);
            }}>Back</button>
        }
        else {
            var backbtn = null;
        }
        
            return(
                <div id="middlepanelcontainer">
                    <div id = "channelnameinmessages"> 
                        <a href="javascript:void(0);" id="profile" onClick={() => {
                            this.state.changeURLPathFn("/profile")
                            }

                        }>
                            Hello, {window.localStorage.getItem("wp_username")}
                        </a>
                        {backbtn}
                        <p># general</p>
                    </div>
                    <div id="msgsmsgs">
                        {this.state.messages.map((message) => { return <Message key={message.msgId} message={message.text} author={message.username} time={message.time} nreplies={message.num_replies} showRepliesFn={this.state.showRepliesFn} msgId={message.msgId} changeURLPathFn={this.state.changeURLPathFn} changeSmallWindowState={this.state.changeSmallWindowState}/> })}

                    </div>
                </div>
            )
    }
}



// --------------------------------------------------------------
// Starting of right panel
// --------------------------------------------------------------

class RightPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            closeButtonFn: props.closeButtonFn,
            toggleReplyPanel: props.viewReplies,
            replyToMsgId: props.replyToMsgId,
            messages: [],
            changeSmallWindowState: props.changeSmallWindowState,
        };
        console.log("RightPanel : constructor", this.state.replyToMsgId)

        // Bind variables to function calls
        this.getReplies = this.getReplies.bind(this);

    }

    componentDidMount() {
        console.log("RightPanel : componentDidMount")
        // this.getReplies();
        var repliesInterval = setInterval(this.getReplies, 500);
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.toggleReplyPanel !== this.props.viewReplies || this.state.replyToMsgId !== this.props.replyToMsgId) {
            this.setState({
                toggleReplyPanel: this.props.viewReplies,
                replyToMsgId: this.props.replyToMsgId,
                
            });
            this.getReplies();
        }
    }

    getReplies() {
        let api_key = window.localStorage.getItem("shahrm_belay_auth_key");
        // console.log("Inside getReplies", this.state.replyToMsgId)

        // For testing purposes
        // DELETE THIS LATER
        // api_key = "rachitapikey"


        fetch('/api/getreplies/' + this.state.replyToMsgId, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "api_key": api_key
            }
        }).then(response => {
            if (response.status == 200) {
                return response.json();
            }
            else {
                return null;
            }
        }).then(data => {

            // console.log("######",data)
            if (data != null) {
                this.setState({
                    messages: data
                })
            }
        })

        // console.log("RightPanel : getReplies", this.state)
    }



    render() {
        // console.log("RightPanel : render", this.state)
        if (this.state.toggleReplyPanel === false)
            return null;
        let topMessage = null;
        let replies = null;
        if (this.state.messages.length > 0){
            topMessage = <Message message={this.state.messages[0].text} author={this.state.messages[0].username} time={this.state.messages[0].time} nreplies={this.state.messages[0].num_replies} />
            // replies = this.state.messages.slice(1, this.state.messages.length)
            replies=this.state.messages.slice(1, this.state.messages.length).map((message) => { return <Message key={message.msgId} message={message.text} author={message.username} time={message.time} nreplies={message.num_replies} /> })
        }
        
        return (
            <div id="rightpanelcontainer">
                <div id="threadHeader">
                    <p id="threadtag">Thread</p>
                    <button id="closeReplies" onClick={() => {
                        this.state.closeButtonFn();
                        this.state.changeSmallWindowState(2);
                        }}>X</button>
                </div>
                <div className="topMessage">
                    
                    {topMessage}
                </div>
                <div className="replies">

                    {replies}

                </div>
                <div id="postthread">
                    <PostThread replyToMsgId={this.state.replyToMsgId}/>
                </div>
            </div>
        )
    }
}


// --------------------------------------------------------------
// PostMsgPanel component
// --------------------------------------------------------------

class PostMsgPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            channelId: this.props.channelId,
        }

        // Bind variables to function calls
        this.postMsg = this.postMsg.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.channelId !== this.props.channelId) {
            this.setState({
                channelId: this.props.channelId
            })
        }
    }

    postMsg() {
        let msgBody = document.getElementById("postmsgtextarea").value;
        console.log(msgBody);
        let api_key = window.localStorage.getItem("shahrm_belay_auth_key");
        let channel_id = this.state.channelId;

        // For testing purposes
        // DELETE THIS LATER
        // api_key = "rachitapikey"

        fetch('/api/postmsg', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api_key": api_key
            },
            body: JSON.stringify({
                "channel_id": channel_id,
                "text": msgBody
            })
        }).then(response => {
            if (response.status == 200) {
                return response.json();
            }
            else {
                return null;
            }
        }).then(data => {
            if (data != null) {
                console.log(data);
            }
        })
    }

    render() {
        return (
            <div id="postmsgpanel">
                <div id="postmsgbody">
                    <textarea id="postmsgtextarea" placeholder="Post a Message to the Channel"></textarea>
                </div>
                <div id="postmsgfooter">
                    <button id="postmsgbutton" type="button" onClick={this.postMsg}>Post</button>
                </div>
            </div>
        )
    }
}


class PostMsgPanelSmall extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            channelId: this.props.channelId,
            temp: null,
        }

        // Bind variables to function calls
        this.postMsg = this.postMsg.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.channelId !== this.props.channelId) {
            this.setState({
                channelId: this.props.channelId
            })
        }
    }

    postMsg() {
        // let msgBody = document.getElementById("postmsgtextarea");
        let msgBody = document.querySelector(".cozmissing")
        console.log(msgBody);
        msgBody = msgBody.value
        let api_key = window.localStorage.getItem("shahrm_belay_auth_key");
        let channel_id = this.state.channelId;

        // For testing purposes
        // DELETE THIS LATER
        // api_key = "rachitapikey"

        fetch('/api/postmsg', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api_key": api_key
            },
            body: JSON.stringify({
                "channel_id": channel_id,
                "text": msgBody
            })
        }).then(response => {
            if (response.status == 200) {
                return response.json();
            }
            else {
                return null;
            }
        }).then(data => {
            if (data != null) {
                console.log(data);
            }
        })
    }

    tempfn = (event) => {
        this.setState({
            temp: event.target.value
        })
    }

    render() {
        return (
            <div id="postmsgpanelsmall">
                <div id="postmsgbody">
                    <textarea id="postmsgtextarea" className="cozmissing" placeholder="Post a Message to the Channel" value={this.state.temp} onChange={this.tempfn}></textarea>
                </div>
                <div id="postmsgfooter">
                    <button id="postmsgbutton" type="button" onClick={this.postMsg}>Post</button>
                </div>
            </div>
        )
    }
}

class PostThread extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            replyToMsgId: this.props.replyToMsgId,
        }

        // Bind variables to function calls
        this.postReply = this.postReply.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.replyToMsgId !== this.props.replyToMsgId) {
            this.setState({
                replyToMsgId: this.props.replyToMsgId
            })
        }
    }

    postReply () {
        let msgBody = document.getElementById("postmsgtextarea").value;
        console.log(msgBody);
        let api_key = window.localStorage.getItem("shahrm_belay_auth_key");
        let reply_to_msg_id = this.state.replyToMsgId;

        // For testing purposes
        // DELETE THIS LATER
        // api_key = "rachitapikey"

        fetch('/api/postreply', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api_key": api_key
            },
            body: JSON.stringify({
                "msg_id": reply_to_msg_id,
                "text": msgBody
            })
        }).then(response => {
            if (response.status == 200) {
                return response.json();
            }
            else {
                return null;
            }
        }
        ).then(data => {
            if (data != null) {
                console.log("THREAD POSTED",data);
            }
        }
        )
    }

    render() {
        return (
            <div id="postthread">
                <div id="postmsgbody">
                    <textarea id="postmsgtextarea" placeholder="Post a Message"></textarea>
                </div>
                <div id="postmsgfooter">
                    <button id="postmsgbutton" type="button" onClick={this.postReply}>Post</button>
                </div>
            </div>
        )
    }
}


// --------------------------------------------------------------
// Rendering the whole app
// --------------------------------------------------------------

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            toggleReplyPanel: false,
            replyToMsgId: null,
            channelId: 1,
            changeURLPathFn: props.changeURLPathFn,
            windowSize: 1000,
            smallWindowState: null,
        }

        if (props.channelId) {
            this.state.channelId = props.channelId;
        }

        if (props.replyToMsgId) {
            this.state.replyToMsgId = props.replyToMsgId;
            this.state.toggleReplyPanel = true;
        }

        // Bind this context to all functions
        this.onCloseReplies = this.onCloseReplies.bind(this);
        this.showRepliesFn = this.showRepliesFn.bind(this);
        this.changeSmallWindowState = this.changeSmallWindowState.bind(this);

        window.addEventListener('resize', this.handleWindowSizeChange);
    }

    handleWindowSizeChange = () => {
        console.log("handleWindowSizeChange");
        this.setState({ windowSize: window.innerWidth });
        if (window.innerWidth < 700) {
            this.setState({
                smallWindowState: 2,
            })
        }
        else {
            this.setState({
                smallWindowState: null,
            })
        }
    };

    componentDidUpdate(prevProps, prevState) {

        if (this.state.channelId !== this.props.channelId) {
            this.setState({
                channelId: this.props.channelId
            })
        }

        if (this.state.replyToMsgId !== this.props.replyToMsgId) {
            this.setState({
                replyToMsgId: this.props.replyToMsgId
            })
        }

    }

    changeSmallWindowState (stateid) {
        console.log("changeSmallWindowState", stateid);
        // 
        this.setState({
            smallWindowState: stateid,
        })
    }

    onCloseReplies() {
        console.log("onCloseReplies");
        this.setState({
            toggleReplyPanel: false,
        });
        console.log(this.state.toggleReplyPanel)
    }

    showRepliesFn(msgId) {
        console.log("showReplies521", msgId);
        this.setState({
            toggleReplyPanel: true,
            replyToMsgId: msgId,
        });
    }

    changeChannel = (channelId) => {
        console.log("App : changeChannel", channelId)
        this.setState({
            channelId: channelId,
        })
    }

    render() {
        
        console.log("App : render", this.state)

        if (this.state.smallWindowState == null) {
            // if (window.matchMedia("(min-width: 700px)").matches) {

            if (this.state.toggleReplyPanel) {
                return (
                    <div>
                        <div id="leftsection">
                            <LeftPanel changeChannelFn={this.changeChannel} changeURLPathFn={this.state.changeURLPathFn} channelId={this.state.channelId}/>
                        </div>
                        <div id="middlesection3sections">
                            <MiddlePanel viewReplies={this.state.toggleReplyPanel} showRepliesFn={this.showRepliesFn} channel={this.state.channelId} changeURLPathFn={this.state.changeURLPathFn}/>
                        </div>
                        <div id="rightsection">
                            <RightPanel closeButtonFn={this.onCloseReplies} viewReplies={this.state.toggleReplyPanel} replyToMsgId = {this.state.replyToMsgId} changeURLPathFn={this.state.changeURLPathFn}/>
                        </div>
                        <div id="postmsg">
                            <PostMsgPanelSmall channelId={this.state.channelId}/>
                        </div>
                    </div>
                )
            }
            else {
                return (
                    <div>
                        <div id="leftsection">
                            <LeftPanel changeChannelFn={this.changeChannel} changeURLPathFn={this.state.changeURLPathFn} channelId={this.state.channelId}/>
                        </div>
                        <div id="middlesection">
                            <MiddlePanel viewReplies={this.state.toggleReplyPanel} showRepliesFn={this.showRepliesFn} channel={this.state.channelId} changeURLPathFn={this.state.changeURLPathFn}/>
                        </div>
                        <div id="postmsg">
                            <PostMsgPanel channelId={this.state.channelId}/>
                        </div>
                    </div>
                )
            }
        }
        else {
            if (this.state.smallWindowState == 1) {
                return (
                    <LeftPanel changeChannelFn={this.changeChannel} changeURLPathFn={this.state.changeURLPathFn} channelId={this.state.channelId} changeSmallWindowState={this.changeSmallWindowState}/>
                )
            }

            else if (this.state.smallWindowState == 2) {
                return (
                    <MiddlePanel viewReplies={this.state.toggleReplyPanel} showRepliesFn={this.showRepliesFn} channel={this.state.channelId} changeURLPathFn={this.state.changeURLPathFn} changeSmallWindowState={this.changeSmallWindowState}/>
                )
            }

            else if (this.state.smallWindowState == 3) {
                return (
                    <RightPanel closeButtonFn={this.onCloseReplies} viewReplies={this.state.toggleReplyPanel} replyToMsgId = {this.state.replyToMsgId} changeURLPathFn={this.state.changeURLPathFn} changeSmallWindowState={this.changeSmallWindowState}/>
                )
            }

            else {
                <h1>There's something wrong here</h1>
            }
        }
    }
}



// --------------------------------------------------------------
// Login and Signup Page
// --------------------------------------------------------------

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            changeURLPathFn: this.props.changeURLPathFn,
        }

        // Bind variables to function calls
        this.login = this.login.bind(this);
        this.signup = this.signup.bind(this);
    }
    
    login() {
        let uname = document.getElementById("uname").value;
        console.log(uname);
        let pswd = document.getElementById("pswd").value;
        console.log(uname, pswd);
        fetch('/api/login', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "username": uname,
                "password": pswd,
            })
        }).then(response => {
            if (response.status == 200) {
                return response.json();
            }
            else {
                return null;
            }
        }
        ).then(data => {
            if (data != null) {
                console.log("LOGIN",data);
                window.localStorage.setItem("shahrm_belay_auth_key", data.api_key);
                window.localStorage.setItem("wp_username", data.username);
                // history.pushState({}, null, "/");
                this.state.changeURLPathFn("/");
            }
        }
        )
    }

    signup() {
        let uname = document.getElementById("uname").value;
        let pswd = document.getElementById("pswd").value;
        console.log(uname, pswd);
        fetch('/api/signup', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "username": uname,
                "password": pswd,
            })
        }).then(response => {
            if (response.status == 200) {
                return response.json();
            }
            else {
                return null;
            }
        }
        ).then(data => {
            if (data != null) {
                console.log("SIGNUP",data);
                window.localStorage.setItem("shahrm_belay_auth_key", data.api_key);
                window.localStorage.setItem("wp_username", data.username);
                // window.location.href = "/home";
                this.state.changeURLPathFn("/");
            }
        }
        )
    }


    render() {
        return(
            <div id="loginPageContainer">
                <div id="loginForm">
                    <div id="loginFormHeader">
                        <h1>Sign In / Sign Up</h1>
                    </div>
                    <div id="unamepswd">
                        <div className="labelContainer">
                            <label for="uname" className="loginFormLabel"><b>Username</b></label>
                            <input type="text" placeholder="Enter Username" name="uname" className="loginFormIunputBox" id="uname" required />
                        </div>

                        <div className="labelContainer">
                            <label for="pswd" className="loginFormLabel"><b>Password</b></label>
                            <input type="password" placeholder="Enter Password" name="pswd" className="loginFormIunputBox" id="pswd" required />
                        </div>

                    </div>
                    <div id="loginFormFooter">
                        <button type="submit" className="loginFormButton" onClick={this.login}>Login</button>
                        <button type="submit" className="loginFormButton" onClick={this.signup}>Signup</button>
                    </div>
                </div>
            </div>

        )
    }
}

class Profile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            changeURLPathFn: this.props.changeURLPathFn,
        }
    }

    changenamepswd() {
        let uname = document.getElementById("profileuname").value;
        let pswd = document.getElementById("profilepswd").value;
        console.log(uname, pswd);

        let api_key = window.localStorage.getItem("shahrm_belay_auth_key");

        fetch('/api/changeusername', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api_key": api_key,
            },
            body: JSON.stringify({
                "username": uname,
            })
        }).then(response => {
            if (response.status == 200) {
                return response.json();
            }
            else {
                return null;
            }
        }
        ).then(data => {
            if (data != null) {
                console.log("CHANGE USERNAME",data);
                window.localStorage.setItem("wp_username", uname);
            }
        }
        )

        fetch('/api/changepassword', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api_key": api_key,
            },
            body: JSON.stringify({
                "password": pswd,
            })
        }).then(response => {
            if (response.status == 200) {
                return response.json();
            }
            else {
                return null;
            }
        }
        ).then(data => {
            if (data != null) {
                console.log("CHANGE PASSWORD",data);
                document.getElementById("changesuccess").style = "display:block";
            }
        }
        )

    }

    render() {
        return(
            <div id="loginPageContainer">
                <div id="loginForm">
                    <div id="loginFormHeader">
                        <h1>User Profile</h1>
                    </div>
                    <div id="unamepswd">
                        <div className="labelContainer">
                            <label for="uname" className="loginFormLabel"><b>Change Username</b></label>
                            <input type="text" placeholder="Enter Username" name="uname" className="loginFormIunputBox" id="profileuname" required />
                        </div>

                        <div className="labelContainer">
                            <label for="pswd" className="loginFormLabel"><b>Change Password</b></label>
                            <input type="password" placeholder="Enter Password" name="pswd" className="loginFormIunputBox" id="profilepswd" required />
                        </div>

                    </div>
                    <div id="loginFormFooter">
                        <button type="submit" className="loginFormButton" onClick={this.changenamepswd}>Change</button>
                    </div>
                    <div id="changesuccess" style={{display: 'none'}}>Details successfully updated</div>
                </div>

            </div>
        )
    }

}


class ControlLogic extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            URLPath : null,
            isLoggedin: false,
        }

        if (window.localStorage.getItem("shahrm_belay_auth_key") != null) {
            this.state.isLoggedin = true;
        }

        if (this.state.isLoggedin == true) {
            if (window.location.pathname == "/login") {
                this.state.URLPath = "/";
                history.pushState({}, null, this.state.URLPath);
            }
            this.state.URLPath = window.location.pathname;
        }
        else {
            this.state.URLPath = "/login";
            history.pushState({}, null, this.state.URLPath);
        }

        window.addEventListener("popstate", (newState) => {
            console.log(newState); 
            this.setState({
                URLPath: window.location.pathname,
            })
        })

        // Bind variables to function calls
        this.changeURLPathFn = this.changeURLPathFn.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
        console.log("ControlLogic : componentDidUpdate", prevProps, prevState);
        if (prevState.URLPath != this.state.URLPath) {
            history.pushState({}, null, this.state.URLPath);
        }
    }

    changeURLPathFn(newPath) {
        console.log("changeURLPathFn", newPath);
        this.setState({
            URLPath: newPath,
        })
    }

    render() {
        console.log("ControlLogic : render", this.state.URLPath);
        let urllist = this.state.URLPath.split("/");
        console.log("ControlLogic : render", urllist);
        if (this.state.URLPath == "/login") {
            return (
                <Login changeURLPathFn={this.changeURLPathFn}/>
            )
        }

        else if (this.state.URLPath == "/profile") {
            return (
                <Profile />
            )
        }

        else if (urllist.length == 2 && urllist[1] == "") {
            return (
                <App changeURLPathFn={this.changeURLPathFn}/>
            )
        }

        else if (urllist.length == 3 && this.state.URLPath.split("/")[1] == "channel") {
            return (
                <App channelId={urllist[2]} changeURLPathFn={this.changeURLPathFn}/>
                // <App channelId={this.state.URLPath.split("/")[2]} />
            )
        }

        else if (urllist.length == 3 && urllist[1] == "thread") {
            return (
                <App replyToMsgId={urllist[2]} changeURLPathFn={this.changeURLPathFn}/>
            )
        }

    }
}


ReactDOM.render(
    <ControlLogic />,
    document.getElementById('root')
)
