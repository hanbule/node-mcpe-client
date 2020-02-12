const Raknet = require("./infos");
const Packets = require("./packets");
const OfflineMessage = require("./offline");
const BinaryStream = require("../../utils/binary");

class OpenConnectionRequest2 extends OfflineMessage {

	constructor(port, clientId = 0){
		super();
		this.port = port;
		this.clientId = clientId;
	}

	static getId(){
		return Packets.ID_OPEN_CONNECTION_REQUEST_2;
	}

	encode(){
		let binary = this.stream;

		binary.writeByte(this.getId());
		this.writeMagic();
		binary.writeByte(0x04);
		binary.writeInt(0x03f57fefd);
		binary.writeShort(this.port);
		binary.writeShort(1464);
		binary.writeLong(this.clientId);
	}
}

module.exports = OpenConnectionRequest2;