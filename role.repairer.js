var roleBuilder = require('role.builder');

module.exports = {
	// a function to run the logic for this role
	run: function(creep) {
		if (creep.memory.working && creep.carry.energy == 0) {
			creep.memory.working = false;
			creep.say('gathering');
		}
		else if (!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
			creep.memory.working = true;
			creep.say('repairing');
		}

		// if creep is supposed to repair something
		if (creep.memory.working == true) {
			var structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
				// the second argument for findClosestByPath is an object which takes
				// a property called filter which can be a function
				// we use the arrow operator to define it
				filter: (s) => s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL
			});

			// if we find one
			if (structure != undefined) {
				if (creep.repair(structure) == ERR_NOT_IN_RANGE) {
					creep.moveTo(structure);
				}
			}
			// if we can't fine one go build
			else {
				roleBuilder.run(creep);
			}
		}
		// if creep is supposed to harvest energy from source
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
