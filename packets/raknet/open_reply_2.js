const Raknet = require("./infos");
const Packets = require("./packets");
const OfflineMessage = require("./offline");
const BinaryStream = require("../../utils/binary");

class OpenConnectionReply2 extends OfflineMessage {

	constructor(stream){
		super(stream);
		this.serverId = null;
		this.mtu = null;
		this.serverSecurity = null;
	}

	static getId(){
		return Packets.ID_OPEN_CONNECTION_REPLY_2;
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