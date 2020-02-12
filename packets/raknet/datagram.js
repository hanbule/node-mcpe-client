const Packet = require("./packet");
const EncapsulatedPacket = require("./encapsulated");
const BITFLAG = require("./bitflags");

class Datagram extends Packet {

    constructor(stream){
        super(stream);
        
        this.headerFlags = 0;
        this.packetPair = false;
        this.continuousSend = false;
        this.needsBAndAs = false;
        this.packets = [];
        this.sequenceNumber = 0;
    }

    encode(){
        if(this.packetPair === true) {
            this.headerFlags |= BITFLAG.PACKET_PAIR;
        }

        if(this.continuousSend === true) {
            this.headerFlags |= BITFLAG.CONTINUOUS_SEND;
        }

        if(this.needsBAndAs === true) {
            this.headerFlags |= BITFLAG.NEEDS_B_AND_AS;
        }

        this.getStream().writeByte(BITFLAG.VALID | this.headerFlags);
        this.getStream().writeLTriad(this.sequenceNumber);
        this.packets.forEach(packet => this.getStream().append(packet));
    }

    decode(){
        this.headerFlags = this.getStream().readByte();
        this.packetPair = (this.headerFlags & BITFLAG.PACKET_PAIR) > 0;
        this.continuousSend = (this.headerFlags & BITFLAG.CONTINUOUS_SEND) > 0;
        this.needsBAndAs = (this.headerFlags & BITFLAG.NEEDS_B_AND_AS) > 0;
        this.sequenceNumber = this.getStream().readLTriad();

        while(!this.getStream().feof()){
            let packet = EncapsulatedPacket.fromBinary(this.stream);

            if(packet.getStream().length === 0){
                break;
            }

            this.packets.push(packet);
        }
    }

    getLength(){
        let length = 4;

        this.packets.forEach(packet => {
            length += (packet instanceof EncapsulatedPacket ? packet.getLength() : Buffer.byteLength(packet, "hex"));
        });

        return length;
    }
}

module.exports = Datagram;