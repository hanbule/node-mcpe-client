const Raknet = require("./infos");
const Packets = require("./packets");
const BinaryStream = require("../../utils/binary");

class RaknetPacket {

	constructor(stream = null){
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

	getId(){
		return -1;
	}

	decode(){}

	encode(){}
}

module.exports = RaknetPacket;