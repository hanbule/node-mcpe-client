const Raknet = require("./infos");
const Packets = require("./packets");
const Packet = require("./packet");
const BinaryStream = require("../../utils/binary");

class ConnectionRequestAccepted extends Packet {

    static getId(){
        return Packets.ID_CONNECTION_REQUEST_ACCEPTED;
    }

    constructor(){
        super();
        this.address = "";
        this.port = -1;
        this.systemAddresses = [];
        this.sendPingTime = -1;
        this.sendPongTime = -1;
    }

    decode(){
        let address = this.getStream().readAddress();
        this.getStream().readShort();

        for(let i = 0; i < 20; ++i){
            this.systemAddresses.push(this.getStream().readAddress())
        }

        this.sendPingTime = this.getStream().readLong()
        this.sendPongTime = this.getStream().readLong();
    }
}

module.exports = ConnectionRequestAccepted;