var stream = require('stream');
var util = require('util');
var Duplex = stream.Duplex;

function WebsocketStream(socket, options) {
	// allow use without new operator
	if (!(this instanceof WebsocketStream)) {
		return new WebsocketStream(socket, options);
	}
	Duplex.call(this, options);
	this._socket = socket;
	var me = this;
	this.paused = false;
	socket.on("message", function(data, flags){
		if(flags.binary && data){
			if(!me.push(data)){
				me.paused = true;
				socket.pause();
			}
		}
	});
	socket.on("close", function(){
		me.push(null);
	});
}
util.inherits(WebsocketStream, Duplex);

WebsocketStream.prototype._read = function readBytes(n) {
	if(this.paused){
		this.paused = false;
		this._socket.unpause();
	}
};

WebsocketStream.prototype._write = function (chunk, enc, cb) {
	this._socket.send(chunk, {binary: true}, cb);
};

WebsocketStream.prototype.end = function(){
	Duplex.prototype.end.call(this);
	this._socket.close();
};

module.exports = WebsocketStream;