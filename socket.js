const dgram = require("dgram");
const BinaryStream = require("./utils/binary");
const Packets = require("./packets/raknet/packets");
const Bitflag = require("./packets/raknet/bitflags");
const Reliability = require("./packets/raknet/bitflags");
const PacketPool = require("./packets/raknet/pool");
const ACKQueue = require("./packets/queues/ack");
const NACKQueue = require("./packets/queues/nack");
const RecoveryQueue = require("./packets/queues/recovery");

// Packets
const Packet = require("./packets/raknet/packet");
const Open2 = require("./packets/raknet/open_request_2");
const Reply2 = require("./packets/raknet/open_reply_2");
const ConnectionRequest = require("./packets/raknet/connection_request");
const ConnectionRequestAccpeted = require("./packets/raknet/connection_request_accepted");
const Encapsulated = require("./packets/raknet/encapsulated");
const ACK = require("./packets/raknet/ack");
const NACK = require("./packets/raknet/nack");
const Datagram = require("./packets/raknet/datagram");
const OfflineMessage = require("./packets/raknet/offline");

class Socket {

	constructor(bot, host, port = 19132) {
		this.bot = bot;
		this.pool = new PacketPool();
		this.host = host;
		this.port = port;
		this.socket = dgram.createSocket("udp4");

		// Raknet stuff
		this.hasSession = false;
		this.mtu = 1447;
		this.splitId = 0;
		this.lastSequenceNumbre = 0;
		this.messageIndex = 0;
		this.orderChannel = [];
		this.ackQueue = new ACKQueue();
		this.nackQueue = new NACKQueue();
		this.recovery = new RecoveryQueue();
	}

	init(){
		this.socket.on("message", (msg, rinfo) => {
			let stream = new BinaryStream(msg);
			let id = stream.getBuffer()[0];

			this.handleBasePacket(id, stream);
		});
	}

	handleBasePacket(id, stream) {
		if(!this.hasSession) {
			let packet = this.pool.getPacket(id);

			if(packet !== null && (packet = new packet(stream))) {
				if(packet instanceof OfflineMessage) {
					packet.decode();
					this.handleOffline(packet);
				}
			}
		}
		else {
			if(id & Bitflag.ACK) {
				this.handlePacket(new ACK(stream));
			}
			else if(id & Bitflag.NAK) {
				this.handlePacket(new NACK(stream));
			}
			else {
				this.handlePacket(new Datagram(stream));
			}
		}
	}

	handlePacket(packet) {
		let nackQueue = this.nackQueue;
		let ackQueue = this.ackQueue;
		let recovery = this.recovery;

		if(packet instanceof Datagram){
			console.log("Got datagram");
			packet.decode();
			let diff = packet.sequenceNumber - this.lastSequenceNumber;

			if(!nackQueue.isEmpty()) {
				nackQueue.remove(packet.sequenceNumber);

				if(diff !== 1) {
					for(let i = this.lastSequenceNumber++; i < packet.sequenceNumber; i++){
						nackQueue.add(i);
					}
				}
			}

			ackQueue.add(packet.sequenceNumber);

			if(diff >= 1) {
				this.lastSequenceNumber = packet.sequenceNumber;
			}

			packet.packets.forEach(pk => {
				this.handleEncapsulatedPacket(pk);
			});
		}
		else {
			if(packet instanceof ACK) {
				console.log("Got ACK");
				packet.decode();

				recovery.recover(packet.packets).forEach(datagram => {
					recovery.remove(datagram.sequenceNumber);
				});
			}
			else if(packet instanceof NACK) {
				console.log("Got NACK");
				packet.decode();

				recovery.recover(packet.packets).forEach(datagram => {
					this.send(datagram);
					recovery.remove(datagram.sequenceNumber);
				});
			}
		}
	}

	handleOffline(packet) {
		let id = packet.getId();
		let bot = this.bot;

		if(id === Packets.ID_OPEN_CONNECTION_REPLY_1){
			console.log("Got connection reply 1!");

			let open2 = new Open2(this.port);
			open2.clientId = bot.clientId;
			open2.encode();
			this.send(open2);
		}
		else if(id === Packets.ID_INCOMPATIBLE_PROTOCOL_VERSION){
			throw new Error("Invalid protocol version");
		}
		else if(id === Packets.ID_OPEN_CONNECTION_REPLY_2){
			console.log("Session created");
			this.hasSession = true; // Session created

			let con = new ConnectionRequest();
			con.clientId = bot.clientId;
			con.sendPingTime = new Date().getTime();
			this.sendEncapsulated(con); // Need fixes
		}
	}

	handleEncapsulatedPacket(packet) {
		if(!(packet instanceof Encapsulated)) {
			throw new Error("Not an encapsulated packet");
		}

		if(packet.hasSplit) {
			console.log("Got a splitted encapsulated packet");
			// ToDo
			return;
		}

		let id = packet.getBuffer()[0];

		if(id === ConnectionRequestAccpeted.getId()) {
			console.log("Connection request got accepted");
			let acc = new ConnectionRequestAccpeted(packet.getStream());
			acc.decode();

		}
	}

	sendEncapsulated(packet) {
		if(!(packet instanceof Encapsulated)) {
			let pk = new Encapsulated();
			packet.encode();

			pk.reliability = Reliability.UNRELIABLE;
			pk.orderChannel = 0;
			pk.stream = new BinaryStream(packet.getBuffer());

			this.sendEncapsulated(pk);
		}
		else {
			if(packet.isReliable()) {
				packet.messageIndex = this.messageIndex++;
			}

			if(packet.isSequenced()) {
				packet.orderIndex = this.channelIndex[packet.orderIndex]++;
			}

			let maxSize = this.mtu - 60;

			if(packet.getBuffer().length > maxSize) {
				let splitId = ++this.splitId % 65536;
				let splitIndex = 0;
				let splitCount = Math.ceil(packet.getBuffer().length / maxSize);

				while(!packet.getStream().feof()) {
					let stream = packet.getBuffer().slice(packet.getStream().offset, packet.getStream().offset += maxSize);
					let pk = new Encapsulated();
					
					pk.splitId = splitId;
					pk.hasSplit = true;
					pk.splitCount = splitCount;
					pk.reliability = packet.reliability;
					pk.stream = stream;

					if(splitIndex > 0) {
						pk.messageIndex = this.messageIndex++;
					}
					else {
						pk.messageIndex = packet.messageIndex;
					}

					pk.orderChannel = packet.orderChannel;
					pk.orderIndex = packet.orderIndex;

					this.send(pk);
				}
			}
			else {
				console.log(packet);
				this.send(packet);
			}
		}
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