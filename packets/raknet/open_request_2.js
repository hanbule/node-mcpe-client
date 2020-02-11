const Raknet = require("./infos");
const Packets = require("./packets");
const Packet = require("./packet");
const BinaryStream = require("../../utils/binary");

class OpenConnectionRequest2 extends Packet {

	constructor(port, clientId = 0){
		super();
		this.port = port;
		this.clientId = clientId;
	}

	getId(){
		return Packets.ID_OPEN_CONNECTION_REQUEST_2;
	}

	encode(){
		let magic = Buffer.from(Raknet.MAGIC, "binary");
		let binary = this.stream;

		binary.writeByte(this.getId());
		binary.append(magic);
		binary.writeByte(0x04);
		binary.writeInt(0x03f57fefd);
		binary.writeShort(this.port);
		binary.writeShort(1464);
		binary.writeLong(this.clientId);
	}
}

module.exports = OpenConnectionRequest2;