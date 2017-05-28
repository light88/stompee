/* 
 * Javascript file for stompee.html
 */
var contextRoot = getContextRoot();

function getContextRoot() {
    var base = document.getElementsByTagName('base')[0];
    if (base && base.href && (base.href.length > 0)) {
        base = base.href;
    } else {
        base = document.URL;
    }
    
    var u = base.substr(0,base.indexOf("/", base.indexOf("/", base.indexOf("//") + 2) + 1));
    var u = u.substr(u.indexOf("//")+2);
    var contextRoot = u.substr(u.indexOf("/"));
    return contextRoot;
}

$(function(){
    $("#menubar").load("menubar.html");
    $("#footer").load("footer.html");
});

var webSocket;
var messages = document.getElementById("messages");

$('document').ready(function(){
    openSocket();
});

window.onbeforeunload = function() {
    closeSocket();
};

function clearScreen(){
    messages.innerHTML = "";
}

function openSocket(){
    // Ensures only one connection is open at a time
    if(webSocket !== undefined && webSocket.readyState !== WebSocket.CLOSED){
        writeResponse("Already connected...");
        return;
    }
    // Create a new instance of the websocket
    var loc = window.location, new_uri;
    if (loc.protocol === "https:") {
        new_uri = "wss:";
    } else {
        new_uri = "ws:";
    }
    new_uri += "//" + loc.host;
    new_uri += contextRoot + "/websocket/stompee";
    webSocket = new WebSocket(new_uri);

    /**
     * Binds functions to the listeners for the websocket.
     */
    webSocket.onopen = function(event){
        // For reasons I can't determine, onopen gets called twice
        // and the first time event.data is undefined.
        // Leave a comment if you know the answer.
        if(event.data === undefined)
            return;
        
        writeResponse(event.data);
    };

    webSocket.onmessage = function(event){
        var json = JSON.parse(event.data);
        var timestamp = new Date(json.timestamp);
        var timestring = timestamp.toLocaleTimeString();

        writeResponse("<span class=' text " + json.level + "'>" + " (" + json.threadId + ")&nbsp;&nbsp;" + timestring + "|&nbsp;&nbsp;" + json.message + "</span>");
    };

    webSocket.onclose = function(){
        writeResponse("Connection closed");
    };

    $('pre code').each(function(i, block) {
        hljs.highlightBlock(block);
    });
}

function closeSocket(){
    webSocket.close();
}

function writeResponse(text){
    messages.innerHTML += text + "<br/>";
}