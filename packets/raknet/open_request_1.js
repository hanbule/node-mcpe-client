const Raknet = require("./infos");
const Packets = require("./packets");
const OfflineMessage = require("./offline");
const BinaryStream = require("../../utils/binary");

class OpenConnectionRequest1 extends OfflineMessage {

	constructor(){
		super();
	}

	static getId(){
		return Packets.ID_OPEN_CONNECTION_REQUEST_1;
	}

	encode(){
		let binary = this.stream;

		binary.writeByte(this.getId());
		this.writeMagic();
		binary.writeByte(Raknet.VERSION);
		binary.writeShort(1447);
	}
}

module.exports = OpenConnectionRequest1;