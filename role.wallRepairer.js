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

		if (creep.memory.working == true) {
			// find all walls in the room
			var walls = creep.room.find(FIND_STRUCTURES, {
				filter: (s) => s.structureType == STRUCTURE_WALL
			});

			var target = undefined;

			// loop with increasing percentages
			for (let percentage = 0.0001; percentage <= 1; percentage = percentage + 0.0001){
				// find a wall with less than percentage hits

				target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
					filter: (s) => (s.structureType == STRUCTURE_WALL &&
					s.hits / s.hitsMax < percentage) || (s.structureType == STRUCTURE_RAMPART &&
					s.hits / s.hitsMax < (percentage * 0.1))
				});

				// if there is one
				if (target != undefined) {
					// break the loop
					break;
				}
			}

			// if we find a wall that has to be repaired
			if (target != undefined) {
				if (creep.repair(target) == ERR_NOT_IN_RANGE) {
					creep.moveTo(target);
				}
			}
			// if we can't find one go build
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
				var droppings = creep.pos.findClosestByPath(FIND_DROPPED_ENERGY, {
					filter: (d) => {return (d.resourceType == RESOURCE_ENERGY)}
				});
				if(creep.pickup(droppings) == ERR_NOT_IN_RANGE) {
					creep.moveTo(droppings);
				}
			}
		}
	}
};
