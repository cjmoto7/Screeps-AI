module.exports = {
	/** @param {Creep} creep **/
	run: function(creep) {

		if(creep.memory.working && creep.carry.energy == 0) {
			creep.memory.working = false;
			creep.say('harvesting');
		}
		if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
			creep.memory.working = true;
			creep.say('trans enrg');
		}

		if(!creep.memory.working) {
			var source = creep.pos.findClosestByPath(FIND_SOURCES, {
				filter: (s) => s.energy > 0
			});
			if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
				creep.moveTo(source);
			}
		}
		else {
			var targets = creep.room.find(FIND_STRUCTURES, {
				filter: (structure) => {
					return (structure.structureType == STRUCTURE_EXTENSION ||
						structure.structureType == STRUCTURE_SPAWN ||
						structure.structureType == STRUCTURE_TOWER) &&
						structure.energy < structure.energyCapacity;
					}
				});
				if(targets.length > 0) {
					if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
						creep.moveTo(targets[0]);
					}
				}
				else {
					creep.moveTo(Game.flags['Idle Post']);
				}
			}
		}
	};
