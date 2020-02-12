const Reply1 = require("./open_reply_1");
const Reply2 = require("./open_reply_2");

class RaknetPacketPool extends Map {

	constructor() {
		super();
		this.init();
	}

	register(packet) {
		this.set(packet.getId(), packet);
	}

	getPacket(id) {
		return this.has(id) ? this.get(id) : null;
	}

	init() {
		this.register(Reply1);
		this.register(Reply2);
	}
}

module.exports = RaknetPacketPool;