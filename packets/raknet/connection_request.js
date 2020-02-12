const Packet = require("./packet");
const Packets = require("./packets");

class ConnectionRequest extends Packet {

    getId(){
        return Packets.ID_CONNECTION_REQUEST;
    }

    constructor(stream){
        super(stream);
        this.clientId = -1;
        this.sendPingTime = 0;
        this.useSecurity = false;
    }

    encode(){
        this.getStream()
            .writeByte(this.getId())
            .writeLong(this.clientId)
            .writeLong(this.sendPingTime)
            .writeBool(this.useSecurity);
    }

    decode(){
        this.clientId = this.getStream().readLong();
        this.sendPingTime = this.getStream().readLong();
        this.useSecurity = this.getStream().readBool();
    }
}

module.exports = ConnectionRequest;