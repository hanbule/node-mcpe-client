const DataPacket = require("./datapacket");
const BinaryStream = require("../../utils/networkbinary");
const Zlib = require("zlib");

class BatchPacket extends DataPacket {

    getId(){
        return 0xFE;
    }

    constructor(){
        super();
        
        this.payload = new BinaryStream();
        this._compressionLevel = 7;
    }

    canBeBatched(){
        return false;
    }

    canBeSentBeforeLogin(){
        return true;
    }

    decode(){
        let packetId = this.readByte();

        if(packetId !== this.getId()){
            throw new Error("Received "+packetId+" as the id, expected "+this.getId());
        }

        let data = this.readRemaining();
        this.payload = new BinaryStream(Zlib.unzipSync(data));
    }

    encode(){
        this.writeByte(this.getId());
        let buf = Zlib.deflateSync(this.payload.getBuffer(), {level: this._compressionLevel});
        this.append(buf);
    }

    addPacket(packet){
        if(!packet.canBeBatched()){
            throw new Error(packet.getName() + " can't be batched");
        }

        if(!packet.isEncoded){
            packet.encode();
        }

        this.payload.writeUnsignedVarInt(packet.length);
        this.payload.append(packet.getBuffer());
    }

    getPackets(){
        let pks = [];

        while(!this.payload.feof()){
            pks.push(this.payload.read(this.payload.readUnsignedVarInt()));
        }

        return pks;
    }
}

module.exports = BatchPacket;