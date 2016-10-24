var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleRepairer = require('role.repairer');
var roleWallRepairer = require('role.wallRepairer');
var roleMiner = require('role.miner');
var roleCarrier = require('role.carrier');

module.exports.loop = function () {

	for (let name in Memory.creeps) {
		if (Game.creeps[name] == undefined) {
			delete Memory.creeps[name];
		}
	}

	for(let name in Game.creeps) {
		var creep = Game.creeps[name];
		if(creep.memory.role == 'harvester') {
			roleHarvester.run(creep);
		}
		if(creep.memory.role == 'miner') {
			roleMiner.run(creep);
		}
		if(creep.memory.role == 'carrier') {
			roleCarrier.run(creep);
		}
		if(creep.memory.role == 'upgrader') {
			roleUpgrader.run(creep);
		}
		if(creep.memory.role == 'builder') {
			roleBuilder.run(creep);
		}
		if(creep.memory.role == 'repairer') {
			roleRepairer.run(creep);
		}
		if(creep.memory.role == 'wallRepairer') {
			roleWallRepairer.run(creep);
		}
	}

	//  Handle repairing and attacking for towers
	var towers = Game.rooms.E62N62.find(FIND_STRUCTURES, {
		filter: (s) => s.structureType == STRUCTURE_TOWER
	});
	for (let tower of towers) {
		var closestWounded = tower.pos.findClosestByRange(FIND_MY_CREEPS, {
			filter: (w) => w.hits < w.hitsMax
		});
		var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
		var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
			filter: (s) => s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL
		});
		/*		for (let percentage = 0.0001; percentage <= 1; percentage = percentage + 0.0001){
		ramparts = tower.pos.findClosestByPath(FIND_STRUCTURES, {
		filter: (s) => s.structureType == STRUCTURE_RAMPART &&
		s.hits / s.hitsMax < percentage
	});

	// if there is one
	if (ramparts != undefined) {
	// break the loop
	break;
}
}*/
if(closestHostile) {
	tower.attack(closestHostile);
}
if ((closestWounded) && (tower.energy > 250)) {
	tower.heal(closestWounded);
}
/*if ((closestDamagedStructure) && (tower.energy > 990)) {
	tower.repair(closestDamagedStructure);
}*/
}

var harvesters = _.sum(Game.creeps, (creep) => creep.memory.role == 'harvester');
var miners = _.sum(Game.creeps, (creep) => creep.memory.role == 'miner');
var carriers = _.sum(Game.creeps, (creep) => creep.memory.role == 'carrier');
var upgraders = _.sum(Game.creeps, (creep) => creep.memory.role == 'upgrader');
var builders = _.sum(Game.creeps, (creep) => creep.memory.role == 'builder');
var repairers = _.sum(Game.creeps, (creep) => creep.memory.role == 'repairer');
var wallRepairers = _.sum(Game.creeps, (creep) => creep.memory.role == 'wallRepairer');

var minimumHarvesters = 1;
var minimumMiners = 4;
var minimumCarriers = miners + 1;
var minimumUpgraders = 3;
var minimumBuilders = 1;
var minimumRepairers = 3;
var minimumWallRepairers = 2;

var totalSappingCreeps = carriers + upgraders + builders + repairers + wallRepairers;
//  Creep body determined by how much max energy we have
var energy = Game.spawns.Spawn1.room.energyCapacityAvailable;

var workerBody = [];
var carrierBody = [];
var minerBody = [];
var defenderBody = [];

if(energy < 449 || (miners < 1 || carriers < 1)) {
	var workerCost = 250;
	var carrierCost = 200;
	var minerCost = 250;
	workerBody.push(WORK,CARRY,MOVE,MOVE);
	carrierBody.push(CARRY,CARRY,MOVE,MOVE);
	minerBody.push(WORK,WORK,MOVE);
}
else if(energy > 449 && energy < 699 && miners > 0 && carriers > 0) {
	var workerCost = 400;
	var carrierCost = 300;
	var minerCost = 400;
	var defenderCost = 400;
	workerBody.push(WORK,WORK,CARRY,MOVE,MOVE,MOVE);
	carrierBody.push(CARRY,CARRY,CARRY,MOVE,MOVE,MOVE);
	minerBody.push(WORK,WORK,WORK,MOVE,MOVE);
	defenderBody.push(RANGED_ATTACK,RANGED_ATTACK,MOVE,MOVE);
}
else if(energy > 699 && miners > 0 && carriers > 0) {
	var workerCost = 650;
	var carrierCost = 400;
	var minerCost = 550;
	var defenderCost = 600;
	workerBody.push(WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE);
	carrierBody.push(CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE);
	minerBody.push(WORK,WORK,WORK,WORK,MOVE,MOVE,MOVE);
	defenderBody.push(RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,MOVE,MOVE,MOVE);
}

//  Generate random number for naming the creeps
var minRandomNum = 999;
var maxRandomNum = 9999;
var randomNum = Math.floor(Math.random() * (maxRandomNum - minRandomNum + 1)) + minRandomNum;

//  Assign the names for the creeps with the random number on the end
var newHarvesterName = 'Harvester' + randomNum;
var newMinerName = 'Miner' + randomNum;
var newCarrierName = 'Carrier' + randomNum;
var newUpgraderName = 'Upgrader' + randomNum;
var newBuilderName = 'Builder' + randomNum;
var newRepairerName = 'Repairer' + randomNum;
var newWallRepairerName = 'WallRepairer' + randomNum;

var name = undefined;

//  Spawn creeps
//	Handle the spawning of the first and only temporary harvester
if(harvesters > 0) {
	if(miners < minimumMiners) {
		var name = Game.spawns['Spawn1'].createCreep(minerBody, newMinerName, {role: 'miner'});
	}
	if(carriers < minimumCarriers && miners > 0) {
		var name = Game.spawns['Spawn1'].createCreep(carrierBody, newCarrierName, {role: 'carrier'});
	}
}
else if(harvesters < 1 && miners > 0 && carriers > 0) {
	if(miners < minimumMiners) {
		var name = Game.spawns['Spawn1'].createCreep(minerBody, newMinerName, {role: 'miner'});
	}
	if(carriers < minimumCarriers) {
		var name = Game.spawns['Spawn1'].createCreep(carrierBody, newCarrierName, {role: 'carrier'});
	}
}
else {
	if(harvesters < minimumHarvesters) {
		var name = Game.spawns['Spawn1'].createCreep(workerBody, newHarvesterName, {role: 'harvester'});
	}
}
//	Handle the spawning of miners above the count of 1
if(totalSappingCreeps > 3 && miners < 2) {
	if(miners < minimumMiners) {
		var name = Game.spawns['Spawn1'].createCreep(minerBody, newMinerName, {role: 'miner'});
	}
}
else if(totalSappingCreeps > 7 && miners < 3) {
	if(miners < minimumMiners) {
		var name = Game.spawns['Spawn1'].createCreep(minerBody, newMinerName, {role: 'miner'});
	}
}
else if(totalSappingCreeps > 11 && miners < 4) {
	if(miners < minimumMiners) {
		var name = Game.spawns['Spawn1'].createCreep(minerBody, newMinerName, {role: 'miner'});
	}
}
//	Handle the conditions for spawning a third upgrader, else handle the conditions for spawning an upgrader
else {
	if(repairers > 0 && builders > 0 && miners > 2 && carriers > 2 && upgraders < 3) {
		if(upgraders < minimumUpgraders) {
			var name = Game.spawns['Spawn1'].createCreep(workerBody, newUpgraderName, {role: 'upgrader'});
		}
	}
	else if(miners > 1 && carriers > 2 && upgraders < 2) {
		if(upgraders < minimumUpgraders) {
			var name = Game.spawns['Spawn1'].createCreep(workerBody, newUpgraderName, {role: 'upgrader'});
		}
	}
	else if(miners > 0 && carriers > 1 && upgraders < 1) {
		if(upgraders < minimumUpgraders) {
			var name = Game.spawns['Spawn1'].createCreep(workerBody, newUpgraderName, {role: 'upgrader'});
		}
	}
	//	Handle the conditions for spawning a builder
	if(builders < minimumBuilders && miners > 0 && carriers > 1 && upgraders > 0) {
		var name = Game.spawns['Spawn1'].createCreep(workerBody, newBuilderName, {role: 'builder'});
	}
	//	Handle the conditions for spawning a thrid repairer, else handle the conditions for spawning a repairer
	if(repairers < 3 && builders > 0 && upgraders > 1 && miners > 2 && carriers > 2) {
		if(repairers < minimumRepairers) {
			var name = Game.spawns['Spawn1'].createCreep(workerBody, newRepairerName, {role: 'repairer'});
		}
	}
	else if(builders > 0 && upgraders > 0 && carriers > 1 && miners > 0) {
		if(repairers < minimumRepairers) {
			var name = Game.spawns['Spawn1'].createCreep(workerBody, newRepairerName, {role: 'repairer'});
		}
	}
//	Handle the conditions for spawning a Wall Repairer
	if(wallRepairers < minimumWallRepairers && miners > 0 && carriers > 1 && upgraders > 0 && builders > 0 && repairers > 0) {
		var name = Game.spawns['Spawn1'].createCreep(workerBody, newWallRepairerName, {role: 'wallRepairer'});
	}

//	kill off that beginning harvester whilst there is at least 1 miner and 1 carrier
	for (let name in Game.creeps) {
		var anotherCreep = Game.creeps[name];
		if((anotherCreep.memory.role == 'harvester') && miners > 0 && carriers > 0) {
			anotherCreep.suicide();
		}
	}
}
};
