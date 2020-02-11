const Raknet = require("./infos");
const Packets = require("./packets");
const Packet = require("./packet");
const BinaryStream = require("../../utils/binary");

class OpenConnectionReply2 extends Packet {

	constructor(stream){
		super(stream);
		this.serverId = null;
		this.mtu = null;
		this.serverSecurity = null;
	}

	getId(){
		return Packets.ID_OPEN_CONNECTION_REQUEST_2;
	}

	decode(){
		let binary = this.stream;

		let id = binary.readByte();
		this.serverId = binary.readLong();
		let port = binary.readShort(); // skip port
		this.mtu = binary.readShort();
		this.serverSecurity = binary.readByte();
	}
}

module.exports = OpenConnectionReply2;