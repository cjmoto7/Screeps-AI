module.exports = {
	/* @param {Creep} creep */
	run: function(creep, isRoaming, remoteRoom) {

		if(!isRoaming) {
			var source = creep.pos.findClosestByPath(FIND_SOURCES, {
				filter: (s) => s.energy > 0
			});
			if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
				creep.moveTo(source);
			}
		}
		else if(isRoaming) {
			var remoteSource = Game.rooms.remoteRoom.find(FIND_SOURCES, {
				filter: (s) => s.energy > 0
			});
			if(remoteSource.length > 0) {
				if(creep.harvest(remoteSource) == ERR_NOT_IN_RANGE) {
					creep.moveTo(remoteSource);
				}
			}
		}
	}
};
