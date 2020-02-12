const NetworkBinaryStream = require("../../utils/networkbinary");

class DataPacket {
	constructor() {
		super();

		this.isEncoded = false;
        this.extraByte1 = 0;
        this.extraByte2 = 0;
	}

	getId(){
        return this.constructor.id;
    }

	getName(){
        return this.constructor.name;
    }

    canBeBatched(){
        return true;
    }

    canBeSentBeforeLogin(){
        return false;
    }

    mayHaveUnreadBytes(){
        return false;
    }

    encode(){
    	this.reset();

    	this.writeUnsignedVarInt(this.getId());
        this.writeByte(this.extraByte1);
        this.writeByte(this.extraByte2);

        this.encodePayload();
    }

    encodePayload(){}

    decode(){
    	this.offset = 0;
    	let packetId = this.readUnsignedVarInt();

        if(packetId === this.getId()) {
            this.extraByte1 = this.readByte();
            this.extraByte2 = this.readByte();

            if(this.extraByte1 !== 0 && this.extraByte2 !== 0) {
                throw new Error("Got unexpected non-zero split-screen bytes (byte1: "+this.extraBytes[0]+", byte2: "+this.extraBytes[1]);
            }
        }
        else {
            throw new Error("Packet id received is different from DataPacket id! "+JSON.stringify({recieved: packetId, datapacket: this.getId()}));
        }

    	this.decodePayload();
    }

    decodePayload(){}
}

module.exports = DataPacket;