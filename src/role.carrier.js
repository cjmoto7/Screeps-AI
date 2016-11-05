module.exports = {
	/* @param {Creep} creep */
	run: function(creep, isRoaming, destRoom, sourceRoom) {
		//	Set state of carrier
		if(creep.memory.working && creep.carry.energy == 0) {
			creep.memory.working = false;
			creep.say('gathering');
		}
		if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
			creep.memory.working = true;
			creep.say('trans enrg');
		}

		if(!isRoaming) {
			if(!creep.memory.working) {
				var droppings = creep.pos.findClosestByPath(FIND_DROPPED_ENERGY, {
					filter: (d) => {return (d.resourceType == RESOURCE_ENERGY && d.amount >= 20)}
				});
				if(creep.pickup(droppings) == ERR_NOT_IN_RANGE) {
					creep.moveTo(droppings);
				}
			}
			else {
				var targets = creep.pos.findClosestByPath(FIND_STRUCTURES, {
					filter: (s) => {
						return (s.structureType == STRUCTURE_EXTENSION ||
							s.structureType == STRUCTURE_SPAWN ||
							(s.structureType == STRUCTURE_TOWER && s.energy < 900)) &&
							s.energy < s.energyCapacity;
						}
					});
					var containers = creep.room.find(FIND_STRUCTURES, {
						filter: (container) => (container.structureType == STRUCTURE_CONTAINER || container.structureType == STRUCTURE_STORAGE) &&
						container.store[RESOURCE_ENERGY] < container.storeCapacity
					});
					if(targets) {
						if(creep.transfer(targets, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
							creep.moveTo(targets);
						}
					}
					else if(containers.length > 0) {
						if(creep.transfer(containers[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
							creep.moveTo(containers[0]);
						}
					}
				}
			}
			else if(isRoaming) {
				if(!creep.memory.working) {
					if(creep.room.name != destRoom) {
						let a = new RoomPosition(25,25,destRoom);
						creep.moveTo(a);
					}
					else if(creep.room.name = destRoom) {
						var remoteDroppings = creep.pos.findClosestByPath(FIND_DROPPED_ENERGY, {
							filter: (d) => {return (d.resourceType == RESOURCE_ENERGY && d.amount >= 20)}
						});
						if(creep.pickup(remoteDroppings) == ERR_NOT_IN_RANGE) {
							creep.moveTo(remoteDroppings);
						}
					}
				}
				else {
					if(creep.room.name != sourceRoom) {
						creep.moveTo(Game.spawns.Spawn1);
					}
					else if(creep.room.name = sourceRoom) {
						var sourceTargets = creep.pos.findClosestByPath(FIND_STRUCTURES, {
							filter: (sa) => {
								return (sa.structureType == STRUCTURE_EXTENSION ||
									sa.structureType == STRUCTURE_SPAWN ||
									(sa.structureType == STRUCTURE_TOWER && sa.energy < 900)) &&
									sa.energy < sa.energyCapacity;
								}
							});
							var sourceContainers = creep.room.find(FIND_STRUCTURES, {
								filter: (con) => (con.structureType == STRUCTURE_CONTAINER || con.structureType == STRUCTURE_STORAGE) &&
								con.store[RESOURCE_ENERGY] < con.storeCapacity
							});
							if(sourceTargets) {
								if(creep.transfer(sourceTargets, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
									creep.moveTo(sourceTargets);
								}
							}
							else if(sourceContainers.length > 0) {
								if(creep.transfer(sourceContainers[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
									creep.moveTo(sourceContainers[0]);
								}
							}
						}
					}
				}
			}
		};
