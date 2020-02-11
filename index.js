const Socket = require("./socket");
const Open = require("./packets/raknet/open_request_1");

const HOST = "0.0.0.0";
const PORT = 19132;

let socket = new Socket();
socket.init();
let o = new Open();

o.encode();
socket.send(o, HOST, PORT);