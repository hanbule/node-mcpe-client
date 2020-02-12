const UUID = pocketnode("./uuid");
const BinaryStream = require("./binary");
const Vector3 = require("../math/vector3");

class NetworkBinaryStream extends BinaryStream {
    /**
     * @return {string}
     */
    readString(){
        return this.read(this.readUnsignedVarInt()).toString();
    }

    /**
     * @param v {string}
     * @return {NetworkBinaryStream}
     */
    writeString(v){
        this.writeUnsignedVarInt(Buffer.byteLength(v));
        if(v.length === 0) return this;
        this.append(Buffer.from(v, "utf8"));
        return this;
    }

    /**
     * @return {UUID}
     */
    readUUID(){
        let [p1, p0, p3, p2] = [this.readLInt(), this.readLInt(), this.readLInt(), this.readLInt()];

        return new UUID(p0, p1, p2, p3);
    }

    /**
     * @param uuid {UUID}
     * @return {NetworkBinaryStream}
     */
    writeUUID(uuid){
       this.writeLInt(uuid.getPart(1))
           .writeLInt(uuid.getPart(0))
           .writeLInt(uuid.getPart(3))
           .writeLInt(uuid.getPart(2));

       return this;
    }

    getEntityUniqueId(){
        return this.readVarLong();
    }

    writeEntityUniqueId(eid){
        this.writeVarLong(eid);
        return this;
    }

    getEntityRuntimeId(){
        return this.readUnsignedVarLong();
    }

    writeEntityRuntimeId(eid){
        this.writeUnsignedVarLong(eid);
        return this;
    }

    getVector3Obj(){
        return new Vector3(
            this.readRoundedLFloat(4),
            this.readRoundedLFloat(4),
            this.readRoundedLFloat(4)
        );
    }

    writeVector3Obj(vector){
        this.writeLFloat(vector.x);
        this.writeLFloat(vector.y);
        this.writeLFloat(vector.z);
    }

    getBlockPosition(){
        return [
            this.readVarInt(),
            this.readUnsignedVarInt(),
            this.readVarInt()
        ];
    }

    writeBlockPosition(x, y, z){
        this.writeVarInt(x)
            .writeUnsignedVarInt(y)
            .writeVarInt(z);
        return this;
    }

    getGameRules(){
        let count = this.readUnsignedVarInt();
        let rules = [];
        for(let i = 0; i < count; ++i){
            let name = this.readString();
            let type = this.readUnsignedVarInt();
            let value = null;
            switch(type){
                case 1:
                    value = this.readBool();
                    break;
                case 2:
                    value = this.readUnsignedVarInt();
                    break;
                case 3:
                    value = this.readLFloat();
                    break;
            }

            rules[name] = [type, value];
        }

        return rules;
    }

    writeGameRules(rules){
        this.writeUnsignedVarInt(rules.length);
        rules.forEach(rule => {
            this.writeString(rule.getName());
            if(typeof rule.getValue() === "boolean") {
                this.writeByte(1);
                this.writeBool(rule.getValue());
            }
            else if(Number.isInteger(rule.getValue())){
                this.writeByte(2);
                this.writeUnsignedVarInt(rule.getValue());
            }
            else if(typeof rule.getValue() === "number" && !Number.isInteger(rule.getValue())){
                this.writeByte(3);
                this.writeLFloat(rule.getValue());
            }
        });

        return this;
    }
}

module.exports = NetworkBinaryStream;