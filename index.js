const Socket = require("./socket");
const Bot = require("./bot");
const Open = require("./packets/raknet/open_request_1");

const HOST = "0.0.0.0";
const PORT = 19132;

let bot = new Bot();

let socket = new Socket(bot, HOST, PORT);
socket.init();

let o = new Open();
o.encode();

socket.send(o);