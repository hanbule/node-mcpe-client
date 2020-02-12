const Raknet = require("./infos");
const Packets = require("./packets");
const BinaryStream = require("../../utils/binary");

class RaknetPacket {

	constructor(stream = null) {
		if(stream instanceof BinaryStream){
			this.stream = stream;
		}
		else if(stream instanceof Buffer){
			this.stream = new BinaryStream(stream);
		}
		else {
			this.stream = new BinaryStream();
		}
	}

	static getId() {
		return -1;
	}

	getId() {
		return this.constructor.getId();
	}

	decode() {}

	encode() {}

	getBuffer() {
		return this.stream.getBuffer();
	}

	getStream() {
		return this.stream;
	}
}

module.exports = RaknetPacket;