const dgram = require("dgram");
const BinaryStream = require("./utils/binary");
const Packets = require("./packets/raknet/packets");

// Packets
const Open2 = require("./packets/raknet/open_request_2");
const Reply2 = require("./packets/raknet/open_reply_2");
const ConnectionRequest = require("./packets/raknet/connection_request");

class Socket {

	constructor(bot, host, port = 19132) {
		this.bot = bot;
		this.host = host;
		this.port = port;
		this.socket = dgram.createSocket("udp4");
	}

	init(){
		let bot = this.bot;

		this.socket.on("message", (msg, rinfo) => {
			let id = new BinaryStream(msg).getBuffer()[0];

			if(id === Packets.ID_OPEN_CONNECTION_REPLY_1){
				console.log("Got connection reply 1!");

				let open1 = new Open2(this.port);
				open1.encode();
				bot.clientId = open1.clientId;
				this.send(open1);
			}
			else if(id === Packets.ID_INCOMPATIBLE_PROTOCOL_VERSION){
				throw new Error("Invalid protocol version");
			}
			else if(id === Packets.ID_OPEN_CONNECTION_REPLY_2){
				console.log("Got connection reply 2!");

				let reply2 = new Reply2(msg);
				reply2.decode();
				bot.mtu = reply2.mtu;

				let con = new ConnectionRequest(null);
				con.clientId = bot.clientId;
				con.sendPingTime = new Date().getTime();
				con.useSecurity = true;
				con.encode();

				console.log(con.stream.buffer);

				this.send(con); // Need fixes (no responses)
			}
			else if(id === Packets.ID_CONNECTION_REQUEST_ACCEPTED){
				console.log("Connection request accepted!");

				// ToDo : Implement NewIncomingConnection packet and send it
			}
			else {
				console.error("Unhandled packet with ID : " + id);
			}
		});
	}

	send(packet) {
		this.socket.send(packet.stream.buffer, 0, packet.stream.buffer.length, this.port, this.host, (err) => {
			if(err){
				console.error("[ERROR] An error occured " + err);
				process.exit(1);
			}
		});
	}
}

module.exports = Socket;