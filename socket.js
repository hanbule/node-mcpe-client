const dgram = require("dgram");
const BinaryStream = require("./utils/binary");
const Packets = require("./packets/raknet/packets");

// Packets
const Open2 = require("./packets/raknet/open_request_2");
const Reply2 = require("./packets/raknet/open_reply_2");

class Socket {

	constructor(host, port = 19132) {
		this.host = host;
		this.port = port;
		this.socket = dgram.createSocket("udp4");
	}

	init(){
		this.socket.on("message", (msg, rinfo) => {
			let id = new BinaryStream(msg).getBuffer()[0];

			if(id === Packets.ID_OPEN_CONNECTION_REPLY_1){
				console.log("Got connection reply 1!");
				let two = new Open2(this.port);
				two.encode();
				this.send(two);
			}
			else if(id === Packets.ID_INCOMPATIBLE_PROTOCOL_VERSION){
				throw new Error("Invalid protocol version");
			}
			else if(id === Packets.ID_OPEN_CONNECTION_REPLY_2){
				console.log("Got connection reply 2!");
				let reply2 = new Reply2(msg);
				reply2.decode();
				console.log("With MTU value : " + reply2.mtu)
			}
		});
	}

	send(packet) {
		this.socket.send(packet.stream.buffer, 0, packet.stream.buffer.length, this.port, this.host, (err) => {
			if(err){
				console.log("An error occured " + err);
				process.exit(1);
			}
		});
	}
}

module.exports = Socket;