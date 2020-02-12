const Raknet = require("./infos");
const Packets = require("./packets");
const Packet = require("./packet");
const BinaryStream = require("../../utils/binary");

class OfflineMessage extends Packet {
	constructor(stream) {
		super(stream);
	}

	writeMagic() {
		this.getStream().append(Buffer.from(Raknet.MAGIC, "binary"));
	}
}

module.exports = OfflineMessage;