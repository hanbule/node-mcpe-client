const Socket = require("./socket");
const Bot = require("./bot");
const PacketPool = require("./packets/mcpe/pool");
const Open = require("./packets/raknet/open_request_1");

const HOST = "0.0.0.0";
const PORT = 19132;

console.log(0x7f);

let bot = new Bot();

let pool = new PacketPool();
pool.init();

let socket = new Socket(bot, HOST, PORT);
socket.init();

let o = new Open();
o.encode();

socket.send(o);

module.exports = {
	getPacketPool: function() {
		return pool;
	},
	getBot: function() {
		return bot;
	}
}