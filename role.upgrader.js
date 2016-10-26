module.exports = {
	/** @param {Creep} creep **/
	run: function(creep) {

if(creep.memory.working && creep.carry.energy == 0) {
	creep.memory.working = false;
	creep.say('gathering');
}
if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
	creep.memory.working = true;
	creep.say('upgrading');
}

if(creep.memory.working) {
	if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
		creep.moveTo(creep.room.controller);
	}
}
else {
//	Check to see if there is a container available that has energy in it
	var isContainer = creep.pos.findClosestByPath(FIND_STRUCTURES, {
		filter: (s) => (s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_STORAGE) && s.store[RESOURCE_ENERGY] > 0
	});

	if(isContainer) {
		if(creep.withdraw(isContainer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
			creep.moveTo(isContainer);
		}
	}
	else {
//	Else just pick up dropped energy
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
