var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleRepairer = require('role.repairer');
var roleWallRepairer = require('role.wallRepairer');
var roleMiner = require('role.miner');
var roleCarrier = require('role.carrier');

module.exports.loop = function () {

	var firstMainRoom = Game.spawns.Spawn1.room.name;
	var secondRoom = 'E61N62';

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
		if(creep.memory.role == 'remoteMiner') {
			roleMiner.run(creep, true, secondRoom);
		}
		if(creep.memory.role == 'carrier') {
			roleCarrier.run(creep);
		}
		if(creep.memory.role == 'remoteCarrier') {
			roleCarrier.run(creep, true, secondRoom, firstMainRoom);
		}
		if(creep.memory.role == 'upgrader') {
			roleUpgrader.upgrade(creep);
		}
		if(creep.memory.role == 'claimer') {
			roleUpgrader.reserve(creep, secondRoom);
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
	var towers = _.filter(Game.structures, (s) => s.structureType == STRUCTURE_TOWER);
	for (let tower of towers) {
		var closestWounded = tower.pos.findClosestByRange(FIND_MY_CREEPS, {
			filter: (w) => w.hits < w.hitsMax
		});
		var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
		var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
			filter: (s) => s.hits < 2000 && s.structureType == STRUCTURE_RAMPART
		});
		if (closestHostile) {
			tower.attack(closestHostile);
		}
		else if ((closestWounded) && (tower.energy > 250)) {
			tower.heal(closestWounded);
		}
		else if ((closestDamagedStructure) && (tower.energy > 750)) {
			tower.repair(closestDamagedStructure);
		}
	}

	var harvesters = _.sum(Game.creeps, (creep) => creep.memory.role == 'harvester');
	var miners = _.sum(Game.creeps, (creep) => creep.memory.role == 'miner');
	var testMiners = {
		Spawn1: _.sum(Game.creeps, (creep) => creep.memory.role == 'miner' && creep.memory.spawnedBy == 'Spawn1'),
		Spawn2: _.sum(Game.creeps, (creep) => creep.memory.role == 'miner' && creep.memory.spawnedBy == 'Spawn2')
	};
	var remoteMiners = _.sum(Game.creeps, (creep) => creep.memory.role == 'remoteMiner');
	var carriers = _.sum(Game.creeps, (creep) => creep.memory.role == 'carrier');
	var remoteCarriers = _.sum(Game.creeps, (creep) => creep.memory.role == 'remoteCarrier');
	var upgraders = _.sum(Game.creeps, (creep) => creep.memory.role == 'upgrader');
	var claimers = _.sum(Game.creeps, (creep) => creep.memory.role == 'claimer');
	var builders = _.sum(Game.creeps, (creep) => creep.memory.role == 'builder');
	var repairers = _.sum(Game.creeps, (creep) => creep.memory.role == 'repairer');
	var wallRepairers = _.sum(Game.creeps, (creep) => creep.memory.role == 'wallRepairer');

	var minimumHarvesters = 1;
	var minimumMiners = 4;
	var minimumRemoteMiners = 2;
	var minimumCarriers = miners + 1;
	var minimumRemoteCarriers = remoteMiners + 3;
	var minimumUpgraders = 3;
	var minimumClaimers = 1;
	var minimumBuilders = 1;
	var minimumRepairers = 3;
	var minimumWallRepairers = 2;

	var totalSappingCreeps = carriers + upgraders + builders + repairers + wallRepairers + remoteCarriers;
	//  Creep body determined by how much max energy we have
	var maxEnergy = Game.spawns.Spawn1.room.energyCapacityAvailable;
	var extension = Game.spawns.Spawn1.room.find(FIND_STRUCTURES, {
		filter: (ex) => ex.structureType == STRUCTURE_EXTENSION
	});
	var extensions = extension.length;

	var workerBody = [];
	var claimerBody = [];
	var carrierBody = [];
	var minerBody = [];
	var defenderBody = [];

	if(extensions < 3 || (miners < 1 || carriers < 1)) {
		var workerCost = 250;
		var carrierCost = 200;
		var minerCost = 250;
		workerBody.push(WORK,CARRY,MOVE,MOVE);
		carrierBody.push(CARRY,CARRY,MOVE,MOVE);
		minerBody.push(WORK,WORK,MOVE);
	}
	else if(extensions >= 3 && extensions < 8 && miners > 0 && carriers > 0) {
		var workerCost = 400;
		var carrierCost = 300;
		var minerCost = 400;
		var defenderCost = 400;
		workerBody.push(WORK,WORK,CARRY,MOVE,MOVE,MOVE);
		carrierBody.push(CARRY,CARRY,CARRY,MOVE,MOVE,MOVE);
		minerBody.push(WORK,WORK,WORK,MOVE,MOVE);
		defenderBody.push(RANGED_ATTACK,RANGED_ATTACK,MOVE,MOVE);
	}
	else if(extensions >= 8 && miners > 0 && carriers > 0) {
		var workerCost = 650;
		var claimerCost = 1300;
		var carrierCost = 400;
		var minerCost = 550;
		var defenderCost = 600;
		workerBody.push(WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE);
		claimerBody.push(CLAIM,CLAIM,MOVE,MOVE);
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
	var newRemoteMinerName = 'RemoteMiner' + randomNum;
	var newCarrierName = 'Carrier' + randomNum;
	var newRemoteCarrierName = 'RemoteCarrier' + randomNum;
	var newUpgraderName = 'Upgrader' + randomNum;
	var newClaimerName = 'Claimer' + randomNum;
	var newBuilderName = 'Builder' + randomNum;
	var newRepairerName = 'Repairer' + randomNum;
	var newWallRepairerName = 'WallRepairer' + randomNum;

	var name = undefined;

	//  Spawn creeps
	//	Handle the spawning of the first and only temporary harvester
	if(harvesters > 0) {
		if(miners < minimumMiners) {
			var name = Game.spawns['Spawn1'].createCreep(minerBody, newMinerName, {role: 'miner', spawnedBy: 'Spawn1'});
		}
		if(carriers < minimumCarriers && miners > 0) {
			var name = Game.spawns['Spawn1'].createCreep(carrierBody, newCarrierName, {role: 'carrier', spawnedBy: 'Spawn1'});
		}
	}
	else if(harvesters < 1 && miners > 0 && carriers > 0) {
		if(miners < minimumMiners) {
			var name = Game.spawns['Spawn1'].createCreep(minerBody, newMinerName, {role: 'miner', spawnedBy: 'Spawn1'});
		}
		if(carriers < minimumCarriers) {
			var name = Game.spawns['Spawn1'].createCreep(carrierBody, newCarrierName, {role: 'carrier', spawnedBy: 'Spawn1'});
		}
	}
	else {
		if(harvesters < minimumHarvesters) {
			var name = Game.spawns['Spawn1'].createCreep(workerBody, newHarvesterName, {role: 'harvester', spawnedBy: 'Spawn1'});
		}
	}
	//	Handle the spawning of miners above the count of 1 and remoteMiners when miners are at 4
	if(totalSappingCreeps > 3 && miners < 2) {
		if(miners < minimumMiners) {
			var name = Game.spawns['Spawn1'].createCreep(minerBody, newMinerName, {role: 'miner', spawnedBy: 'Spawn1'});
		}
	}
	else if(totalSappingCreeps > 6 && miners < 3) {
		if(miners < minimumMiners) {
			var name = Game.spawns['Spawn1'].createCreep(minerBody, newMinerName, {role: 'miner', spawnedBy: 'Spawn1'});
		}
	}
	else if(totalSappingCreeps > 10 && miners < 4) {
		if(miners < minimumMiners) {
			var name = Game.spawns['Spawn1'].createCreep(minerBody, newMinerName, {role: 'miner', spawnedBy: 'Spawn1'});
		}
	}
	else if(totalSappingCreeps > 12 && remoteMiners < 1) {
		if(remoteMiners < minimumRemoteMiners) {
			var name = Game.spawns['Spawn1'].createCreep(minerBody, newRemoteMinerName, {role: 'remoteMiner', spawnedBy: 'Spawn1'});
		}
	}
	else if(totalSappingCreeps > 15 && remoteMiners < 2) {
		if(remoteMiners < minimumRemoteMiners) {
			var name = Game.spawns['Spawn1'].createCreep(minerBody, newRemoteMinerName, {role: 'remoteMiner', spawnedBy: 'Spawn1'});
		}
	}
	else {
		if(remoteMiners > 0 && remoteCarriers < minimumRemoteCarriers) {
			var name = Game.spawns['Spawn1'].createCreep(carrierBody, newRemoteCarrierName, {role: 'remoteCarrier', spawnedBy: 'Spawn1'});
		}
		//	Handle the conditions for spawning a claimer
		if (remoteMiners > 0 && remoteCarriers > 1) {
			if (claimers < minimumClaimers) {
				var name = Game.spawns['Spawn1'].createCreep(claimerBody, newClaimerName, {role: 'claimer', spawnedBy: 'Spawn1'});
			}
		}
		//	Handle the conditions for spawning a third upgrader, else handle the conditions for spawning an upgrader
		if(repairers > 0 && builders > 0 && miners > 2 && carriers > 2 && upgraders < 3) {
			if(upgraders < minimumUpgraders) {
				var name = Game.spawns['Spawn1'].createCreep(workerBody, newUpgraderName, {role: 'upgrader', spawnedBy: 'Spawn1'});
			}
		}
		else if(miners > 1 && carriers > 2 && upgraders < 2) {
			if(upgraders < minimumUpgraders) {
				var name = Game.spawns['Spawn1'].createCreep(workerBody, newUpgraderName, {role: 'upgrader', spawnedBy: 'Spawn1'});
			}
		}
		else if(miners > 0 && carriers > 1 && upgraders < 1) {
			if(upgraders < minimumUpgraders) {
				var name = Game.spawns['Spawn1'].createCreep(workerBody, newUpgraderName, {role: 'upgrader', spawnedBy: 'Spawn1'});
			}
		}
		//	Handle the conditions for spawning a builder
		if(builders < minimumBuilders && miners > 0 && carriers > 1 && upgraders > 0) {
			var name = Game.spawns['Spawn1'].createCreep(workerBody, newBuilderName, {role: 'builder', spawnedBy: 'Spawn1'});
		}
		//	Handle the conditions for spawning a thrid repairer, else handle the conditions for spawning a repairer
		if(repairers < 3 && builders > 0 && upgraders > 1 && miners > 2 && carriers > 2) {
			if(repairers < minimumRepairers) {
				var name = Game.spawns['Spawn1'].createCreep(workerBody, newRepairerName, {role: 'repairer', spawnedBy: 'Spawn1'});
			}
		}
		else if(builders > 0 && upgraders > 0 && carriers > 1 && miners > 0) {
			if(repairers < minimumRepairers) {
				var name = Game.spawns['Spawn1'].createCreep(workerBody, newRepairerName, {role: 'repairer', spawnedBy: 'Spawn1'});
			}
		}
		//	Handle the conditions for spawning a Wall Repairer
		if(miners > 1 && carriers > 2 && upgraders > 1 && builders > 0 && repairers > 1 && wallRepairers < 2) {
			if(wallRepairers < minimumWallRepairers) {
				var name = Game.spawns['Spawn1'].createCreep(workerBody, newWallRepairerName, {role: 'wallRepairer', spawnedBy: 'Spawn1'});
			}
		}
		else if(miners > 0 && carriers > 1 && upgraders > 0 && builders > 0 && repairers > 0) {
			if(wallRepairers < minimumWallRepairers) {
				var name = Game.spawns['Spawn1'].createCreep(workerBody, newWallRepairerName, {role: 'wallRepairer', spawnedBy: 'Spawn1'});
			}
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
