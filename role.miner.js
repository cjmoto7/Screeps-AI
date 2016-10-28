module.exports = {
	/* @param {Creep} creep */
	run: function(creep, isRoaming, destRoom) {
		if(!isRoaming) {
			var source = creep.pos.findClosestByPath(FIND_SOURCES, {
				filter: (s) => s.energy > 0
			});
			if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
				creep.moveTo(source);
			}
		}
		else if(isRoaming) {
			if(creep.room.name != destRoom) {
				let a = new RoomPosition(25,25,destRoom);
				creep.moveTo(a);
			}
			else if(creep.room.name = destRoom) {
				var remoteSource = creep.pos.findClosestByPath(FIND_SOURCES, {
					filter: (s) => s.energy > 0
				});
					if(creep.harvest(remoteSource) == ERR_NOT_IN_RANGE) {
						creep.moveTo(remoteSource);
					}
			}
		}
	}
};
