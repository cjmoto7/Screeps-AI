module.exports = {
	/* @param {Creep} creep */
	run: function(creep) {

		if(creep.memory.working && creep.carry.energy == 0) {
			creep.memory.working = false;
			creep.say('gathering');
		}
		if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
			creep.memory.working = true;
			creep.say('trans enrg');
		}

		if(!creep.memory.working) {
			var droppings = creep.pos.findClosestByPath(FIND_DROPPED_ENERGY);
			if(creep.pickup(droppings) == ERR_NOT_IN_RANGE) {
				creep.moveTo(droppings);
			}
		}
		else {
			var targets = creep.room.find(FIND_STRUCTURES, {
				filter: (s) => {
					return (s.structureType == STRUCTURE_SPAWN ||
						s.structureType == STRUCTURE_EXTENSION ||
						s.structureType == STRUCTURE_TOWER) &&
						s.energy < s.energyCapacity;
					}
				});
				var containers = creep.room.find(FIND_STRUCTURES, {
					filter: (container) => (container.structureType == STRUCTURE_CONTAINER || container.structureType == STRUCTURE_STORAGE) &&
					container.store[RESOURCE_ENERGY] < container.storeCapacity
				});
				if(targets.length > 0) {
					if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
						creep.moveTo(targets[0]);
					}
				}
				else if(containers.length > 0) {
					if(creep.transfer(containers[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
						creep.moveTo(containers[0]);
					}
				}
			}
		}
	};
