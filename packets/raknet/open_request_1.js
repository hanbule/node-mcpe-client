const Raknet = require("./infos");
const Packets = require("./packets");
const Packet = require("./packet");
const BinaryStream = require("../../utils/binary");

class OpenConnectionRequest1 extends Packet {

	constructor(){
		super();
	}

	getId(){
		return Packets.ID_OPEN_CONNECTION_REQUEST_1;
	}

	encode(){
		let magic = Buffer.from(Raknet.MAGIC, "binary");
		let binary = this.stream;

		binary.writeByte(this.getId());
		binary.append(magic);
		binary.writeByte(Raknet.VERSION);
	}
}

module.exports = OpenConnectionRequest1;