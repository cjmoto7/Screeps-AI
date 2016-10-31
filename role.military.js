var militaryFunctions = {};

    militaryFunctions.remoteDefender = function(creep, destRoom, mainRoom) {

			var closestHostile = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);

			if(creep.room.name != destRoom) {
				let a = new RoomPosition(25,25,destRoom);
				creep.moveTo(a);
			}
			else if (creep.room.name = destRoom) {
        if(closestHostile) {
            if(creep.attack(closestHostile) == ERR_NOT_IN_RANGE) {
                creep.moveTo(closestHostile)
                creep.attack(closestHostile);
            }
        }
				else {
					creep.moveTo(25,25);
				}
			}
		};
    module.exports = militaryFunctions;
