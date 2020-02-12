const AcknowledgementPacket = require("./acknowledgement");

class NACK extends AcknowledgementPacket {
	getId() {
		return 0xA0;
	}

	constructor(stream){
        super(stream);
    }
}

module.exports = NACK;