const AcknowledgementPacket = require("./acknowledgement");

class ACK extends AcknowledgementPacket {
	getId() {
		return 0xc0;
	}

	constructor(stream){
        super();
        
        if(stream) {
        	this.stream = stream;
        }
    }
}

module.exports = ACK;