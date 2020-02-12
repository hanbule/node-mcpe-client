// Packets
// ToDo

class PacketPool {

	constructor() {
		this.pool = new Map();
	}

	register(packet) {
		this.pool.set(packet.getId(), packet);
	}

	getPaket(id) {
		return this.pool().has(id) ? new (this.pool.get(id))() : null;
	}

	init() {
		// ToDo
	}
}

module.exports = PacketPool;