var roleUpgrader = require('role.upgrader');

module.exports = {
	/** @param {Creep} creep **/
	run: function(creep) {

		if(creep.memory.working && creep.carry.energy == 0) {
			creep.memory.working = false;
			creep.say('gathering');
		}
		if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
			creep.memory.working = true;
			creep.say('building');
		}


		if(creep.memory.working) {
			var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
			if(targets.length) {
				if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
					creep.moveTo(targets[0]);
				}
			}
			else {
				// go upgrade the controller
				roleUpgrader.run(creep);
			}
		}
		else {
			var isContainer = creep.pos.findClosestByPath(FIND_STRUCTURES, {
				filter: (s) => (s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_STORAGE) && s.store[RESOURCE_ENERGY] > 0
			});

			if(isContainer) {
				if(creep.withdraw(isContainer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
					creep.moveTo(isContainer);
				}
			}
			else {
				var droppings = creep.pos.findClosestByPath(FIND_DROPPED_ENERGY);
				if(creep.pickup(droppings) == ERR_NOT_IN_RANGE) {
					creep.moveTo(droppings);
				}
			}
		}
	}
};
