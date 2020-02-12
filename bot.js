const uuid = require("./utils/uuid");

class Bot {

	constructor(){
		this.name = "";
		this.clientId = 0;
		this.xuid = "";
		// ToDo
		//this.uuid = uuid.fromRandom();
		this.entityRuntimeId = null;
		this.entityUniqueId = null;
	}
}

module.exports = Bot;