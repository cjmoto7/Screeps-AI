var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleRepairer = require('role.repairer');
var roleWallRepairer = require('role.wallRepairer');
var roleMiner = require('role.miner');
var roleCarrier = require('role.carrier');

module.exports.loop = function () {

	//	Set room variables
	var firstMainRoom = {
		Spawn1: Game.spawns.Spawn1.room.name,
	};
	if (Game.spawns.Spawn2) {
		firstMainRoom.Spawn2 = Game.spawns.Spawn2.room.name;
	}
	var secondRoom = {
		Spawn1: 'E62N61',
		Spawn2: 'E61N61'
	};
	var thirdRoom = {
		Spawn1: 'E63N61',
		Spawn2: ''
	}
	//	Cleanup dead creep memories
	for (let name in Memory.creeps) {
		if (Game.creeps[name] == undefined) {
			delete Memory.creeps[name];
		}
	}
	//	Handle assigning of roles
	for(let name in Game.creeps) {
		var creep = Game.creeps[name];
		if(creep.memory.role == 'harvester') {
			roleHarvester.run(creep);
		}
		if(creep.memory.role == 'miner') {
			roleMiner.run(creep);
		}
		if(creep.memory.role == 'remoteMiner' && creep.memory.spawnedBy == 'Spawn1') {
			roleMiner.run(creep, true, secondRoom.Spawn1);
		}
		if(creep.memory.role == 'remoteMiner' && creep.memory.spawnedBy == 'Spawn2') {
			roleMiner.run(creep, true, secondRoom.Spawn2);
		}
		if(creep.memory.role == 'carrier') {
			roleCarrier.run(creep);
		}
		if(creep.memory.role == 'remoteCarrier' && creep.memory.spawnedBy == 'Spawn1') {
			roleCarrier.run(creep, true, secondRoom.Spawn1, firstMainRoom.Spawn1);
		}
		if(creep.memory.role == 'remoteCarrier' && creep.memory.spawnedBy == 'Spawn2') {
			roleCarrier.run(creep, true, secondRoom.Spawn2, firstMainRoom.Spawn2);
		}
		if(creep.memory.role == 'upgrader') {
			roleUpgrader.upgrade(creep);
		}
		if(creep.memory.role == 'claimer' && creep.memory.spawnedBy == 'Spawn1') {
			roleUpgrader.reserve(creep, secondRoom.Spawn1);
		}
		if(creep.memory.role == 'claimer' && creep.memory.spawnedBy == 'Spawn2') {
			roleUpgrader.reserve(creep, secondRoom.Spawn2);
		}
		if(creep.memory.role == 'builder') {
			roleBuilder.build(creep);
		}
		if(creep.memory.role == 'spawnBuilder') {
			roleBuilder.buildRemote(creep, secondRoom.Spawn1);
		}
		if(creep.memory.role == 'repairer') {
			roleRepairer.repair(creep);
		}
		if(creep.memory.role == 'remoteRepairer' && creep.memory.spawnedBy == 'Spawn1') {
			roleRepairer.remoteRepair(creep, secondRoom.Spawn1);
		}
		if(creep.memory.role == 'remoteRepairer' && creep.memory.spawnedBy == 'Spawn2') {
			roleRepairer.remoteRepair(creep, secondRoom.Spawn2);
		}
		if(creep.memory.role == 'wallRepairer') {
			roleWallRepairer.run(creep);
		}
	}

console.log('After creep roles before tower' + Game.cpu.getUsed());
	//  Handle repairing and attacking for towers
	var towers = _.filter(Game.structures, (s) => s.structureType == STRUCTURE_TOWER);
	for (let tower of towers) {
		var closestWounded = tower.pos.findClosestByRange(FIND_MY_CREEPS, {
			filter: (w) => w.hits < w.hitsMax
		});
		var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
		var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
			filter: (s) => (s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART) ||
			(s.hits < 10000 && s.structureType == STRUCTURE_RAMPART)
		});
		if (closestHostile) {
			tower.attack(closestHostile);
		}
		else if ((closestWounded) && (tower.energy > 250)) {
			tower.heal(closestWounded);
		}
		else if ((closestDamagedStructure) && (tower.energy > 500)) {
			tower.repair(closestDamagedStructure);
		}
	}

	//	Different roles count
	var harvesters = {
		Spawn1: _.sum(Game.creeps, (creep) => creep.memory.role == 'harvester' && creep.memory.spawnedBy == 'Spawn1'),
		Spawn2: _.sum(Game.creeps, (creep) => creep.memory.role == 'harvester' && creep.memory.spawnedBy == 'Spawn2')
	};
	var miners = {
		Spawn1: _.sum(Game.creeps, (creep) => creep.memory.role == 'miner' && creep.memory.spawnedBy == 'Spawn1'),
		Spawn2: _.sum(Game.creeps, (creep) => creep.memory.role == 'miner' && creep.memory.spawnedBy == 'Spawn2')
	};
	var remoteMiners = {
		Spawn1: _.sum(Game.creeps, (creep) => creep.memory.role == 'remoteMiner' && creep.memory.spawnedBy == 'Spawn1'),
		Spawn2: _.sum(Game.creeps, (creep) => creep.memory.role == 'remoteMiner' && creep.memory.spawnedBy == 'Spawn2')
	};
	var carriers = {
		Spawn1: _.sum(Game.creeps, (creep) => creep.memory.role == 'carrier' && creep.memory.spawnedBy == 'Spawn1'),
		Spawn2: _.sum(Game.creeps, (creep) => creep.memory.role == 'carrier' && creep.memory.spawnedBy == 'Spawn2')
	};
	var remoteCarriers = {
		Spawn1: _.sum(Game.creeps, (creep) => creep.memory.role == 'remoteCarrier' && creep.memory.spawnedBy == 'Spawn1'),
		Spawn2: _.sum(Game.creeps, (creep) => creep.memory.role == 'remoteCarrier' && creep.memory.spawnedBy == 'Spawn2')
	};
	var upgraders = {
		Spawn1: _.sum(Game.creeps, (creep) => creep.memory.role == 'upgrader' && creep.memory.spawnedBy == 'Spawn1'),
		Spawn2: _.sum(Game.creeps, (creep) => creep.memory.role == 'upgrader' && creep.memory.spawnedBy == 'Spawn2')
	};
	var claimers = {
		Spawn1: _.sum(Game.creeps, (creep) => creep.memory.role == 'claimer' && creep.memory.spawnedBy == 'Spawn1'),
		Spawn2: _.sum(Game.creeps, (creep) => creep.memory.role == 'claimer' && creep.memory.spawnedBy == 'Spawn2')
	};
	var builders = {
		Spawn1: _.sum(Game.creeps, (creep) => creep.memory.role == 'builder' && creep.memory.spawnedBy == 'Spawn1'),
		Spawn2: _.sum(Game.creeps, (creep) => creep.memory.role == 'builder' && creep.memory.spawnedBy == 'Spawn2')
	};
	var remoteBuilders = {
		Spawn1: _.sum(Game.creeps, (creep) => creep.memory.role == 'spawnBuilder' && creep.memory.spawnedBy == 'Spawn1'),
		Spawn2: _.sum(Game.creeps, (creep) => creep.memory.role == 'spawnBuilder' && creep.memory.spawnedBy == 'Spawn2')
	};
	var repairers = {
		Spawn1: _.sum(Game.creeps, (creep) => creep.memory.role == 'repairer' && creep.memory.spawnedBy == 'Spawn1'),
		Spawn2: _.sum(Game.creeps, (creep) => creep.memory.role == 'repairer' && creep.memory.spawnedBy == 'Spawn2')
	};
	var remoteRepairers = {
		Spawn1: _.sum(Game.creeps, (creep) => creep.memory.role == 'remoteRepairers' && creep.memory.spawnedBy == 'Spawn1'),
		Spawn2: _.sum(Game.creeps, (creep) => creep.memory.role == 'remoteRepairers' && creep.memory.spawnedBy == 'Spawn2')
	};
	var wallRepairers = {
		Spawn1: _.sum(Game.creeps, (creep) => creep.memory.role == 'wallRepairer' && creep.memory.spawnedBy == 'Spawn1'),
		Spawn2: _.sum(Game.creeps, (creep) => creep.memory.role == 'wallRepairer' && creep.memory.spawnedBy == 'Spawn2')
	};
	console.log('After creep count before pop count' + Game.cpu.getUsed());

//	Desired population count amongst spawns
	var minimumHarvesters = {Spawn1: 1, Spawn2: 1};
	var minimumMiners = {Spawn1: 4, Spawn2: 3};
	var minimumRemoteMiners = {Spawn1: 1, Spawn2: 0};
	var minimumCarriers = {Spawn1: miners.Spawn1 + 1, Spawn2: miners.Spawn2};
	var minimumRemoteCarriers = {Spawn1: remoteMiners.Spawn1 + 2, Spawn2: remoteMiners.Spawn2 + 3};
	var minimumUpgraders = {Spawn1: 2, Spawn2: 2};
	var minimumClaimers = {Spawn1: 1, Spawn2: 0};
	var minimumBuilders = {Spawn1: 1, Spawn2: 1};
	var minimumRemoteBuilders = {Spawn1: 0, Spawn2: 0};
	var minimumRepairers = {Spawn1: 1, Spawn2: 1};
	var minimumRemoteRepairers = {Spawn1: 1, Spawn2: 0};
	var minimumWallRepairers = {Spawn1: 1, Spawn2: 1};

	var totalSappingCreeps = {
		Spawn1: carriers.Spawn1 + upgraders.Spawn1 + builders.Spawn1 + repairers.Spawn1 + wallRepairers.Spawn1 + remoteCarriers.Spawn1,
		Spawn2: carriers.Spawn2 + upgraders.Spawn2 + builders.Spawn2 + repairers.Spawn2 + wallRepairers.Spawn2 + remoteCarriers.Spawn2
	};
	//  Creep body determined by how many extensions we have (per spawn)
	var maxEnergy = {
		Spawn1: Game.spawns.Spawn1.room.energyCapacityAvailable
	};
	var extension = {
		Spawn1: Game.spawns.Spawn1.room.find(FIND_STRUCTURES, {filter: (ex) => ex.structureType == STRUCTURE_EXTENSION})
	};
	var extensions = {
		Spawn1: extension.Spawn1.length
	}
	if (Game.spawns.Spawn2) {
		maxEnergy.Spawn2 = Game.spawns.Spawn2.room.energyCapacityAvailable;
		extension.Spawn2 = Game.spawns.Spawn2.room.find(FIND_STRUCTURES, {filter: (ex) => ex.structureType == STRUCTURE_EXTENSION});
		extensions.Spawn2 = extension.Spawn2.length;
	}
	var workerBody = {Spawn1: [], Spawn2: [] };
	var claimerBody = {Spawn1: [], Spawn2: [] };
	var carrierBody = {Spawn1: [], Spawn2: [] };
	var minerBody = {Spawn1: [], Spawn2: [] };
	var defenderBody = {Spawn1: [], Spawn2: [] };

	var workerCost = { };
	var carrierCost = { };
	var minerCost = { };
	var defenderCost = { };
	var claimerCost = { };

	for (let name in Game.spawns) {
		let eachSpawn = Game.spawns[name];
		if(extensions[name] < 3 || (miners[name] < 1 || carriers[name] < 1)) {
			workerCost[name] = 250;
			carrierCost[name] = 200;
			minerCost[name] = 250;
			workerBody[name].push(WORK,CARRY,MOVE,MOVE);
			carrierBody[name].push(CARRY,CARRY,MOVE,MOVE);
			minerBody[name].push(WORK,WORK,MOVE);
		}
		else if(extensions[name] >= 3 && extensions[name] < 8 && miners[name] > 0 && carriers[name] > 0) {
			workerCost[name] = 400;
			carrierCost[name] = 300;
			minerCost[name] = 400;
			defenderCost[name] = 400;
			workerBody[name].push(WORK,WORK,CARRY,MOVE,MOVE,MOVE);
			carrierBody[name].push(CARRY,CARRY,CARRY,MOVE,MOVE,MOVE);
			minerBody[name].push(WORK,WORK,WORK,MOVE,MOVE);
			defenderBody[name].push(RANGED_ATTACK,RANGED_ATTACK,MOVE,MOVE);
		}
		else if(extensions[name] >= 8 && miners[name] > 0 && carriers[name] > 0) {
			workerCost[name] = 650;
			claimerCost[name] = 1300;
			carrierCost[name] = 400;
			minerCost[name] = 550;
			defenderCost[name] = 600;
			workerBody[name].push(WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE);
			claimerBody[name].push(CLAIM,CLAIM,MOVE,MOVE);
			carrierBody[name].push(CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE);
			minerBody[name].push(WORK,WORK,WORK,WORK,MOVE,MOVE,MOVE);
			defenderBody[name].push(RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,MOVE,MOVE,MOVE);
		}
		else {
			workerCost[name] = 250;
			carrierCost[name] = 200;
			minerCost[name] = 250;
			workerBody[name].push(WORK,CARRY,MOVE,MOVE);
			carrierBody[name].push(CARRY,CARRY,MOVE,MOVE);
			minerBody[name].push(WORK,WORK,MOVE);
		}
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
	var newRemoteBuilderName = 'RemoteBuilder' + randomNum;
	var newRepairerName = 'Repairer' + randomNum;
//	var newRemoteRepairerName = 'RemoteRepairer' + randomNum;
	var newWallRepairerName = 'WallRepairer' + randomNum;
	console.log('Just before creep spawn' + Game.cpu.getUsed());

	var nameful = undefined;
	//  Spawn creeps at each spawning
	for (let name in Game.spawns) {
		let eachSpawn = Game.spawns[name];
		//	Handle the spawning of the first and only temporary harvester
		if(harvesters[name] > 0) {
			if(miners[name] < minimumMiners[name]) {
				var nameful = eachSpawn.createCreep(minerBody[name], newMinerName, {role: 'miner', spawnedBy: name});
				console.log(nameful);
			}
			if(carriers[name] < minimumCarriers[name] && miners[name] > 0) {
				var nameful = eachSpawn.createCreep(carrierBody[name], newCarrierName, {role: 'carrier', spawnedBy: name});
				console.log(nameful);
			}
		}
		else if(harvesters[name] < 1 && miners[name] > 0 && carriers[name] > 0) {
			if(miners[name] < minimumMiners[name]) {
				var nameful = eachSpawn.createCreep(minerBody[name], newMinerName, {role: 'miner', spawnedBy: name});
				console.log(nameful);
			}
			if(carriers[name] < minimumCarriers[name]) {
				var nameful = eachSpawn.createCreep(carrierBody[name], newCarrierName, {role: 'carrier', spawnedBy: name});
				console.log(nameful);
			}
		}
		else {
			if(harvesters[name] < minimumHarvesters[name]) {
				var nameful = eachSpawn.createCreep(workerBody[name], newHarvesterName, {role: 'harvester', spawnedBy: name});
				console.log(nameful);
			}
		}
		//	Handle the spawning of miners above the count of 1 and remoteMiners when miners are at 4
		if(totalSappingCreeps[name] > 2 && miners[name] < 2) {
			if(miners[name] < minimumMiners[name]) {
				var nameful = eachSpawn.createCreep(minerBody[name], newMinerName, {role: 'miner', spawnedBy: name});
				console.log(nameful);
			}
		}
		else if(totalSappingCreeps[name] > 4 && miners[name] < 3) {
			if(miners[name] < minimumMiners[name]) {
				var nameful = eachSpawn.createCreep(minerBody[name], newMinerName, {role: 'miner', spawnedBy: name});
				console.log(nameful);
			}
		}
		else if(totalSappingCreeps[name] > 8 && miners[name] < 4) {
			if(miners[name] < minimumMiners[name]) {
				var nameful = eachSpawn.createCreep(minerBody[name], newMinerName, {role: 'miner', spawnedBy: name});
				console.log(nameful);
			}
		}
		else if(totalSappingCreeps[name] > 10 && remoteMiners[name] < 1) {
			if(remoteMiners[name] < minimumRemoteMiners[name]) {
				var nameful = eachSpawn.createCreep(minerBody[name], newRemoteMinerName, {role: 'remoteMiner', spawnedBy: name});
				console.log(nameful);
			}
		}
		else if(totalSappingCreeps[name] > 13 && remoteMiners[name] < 2) {
			if(remoteMiners[name] < minimumRemoteMiners[name]) {
				var nameful = eachSpawn.createCreep(minerBody[name], newRemoteMinerName, {role: 'remoteMiner', spawnedBy: name});
				console.log(nameful);
			}
		}
		else {
			if(remoteMiners[name] > 0 && remoteCarriers[name] < minimumRemoteCarriers[name]) {
				var nameful = eachSpawn.createCreep(carrierBody[name], newRemoteCarrierName, {role: 'remoteCarrier', spawnedBy: name});
				console.log(nameful);
			}
			//	Handle the conditions for spawning a claimer
			if (remoteMiners[name] > 0 && remoteCarriers[name] > 1) {
				if (claimers[name] < minimumClaimers[name]) {
					var nameful = eachSpawn.createCreep(claimerBody[name], newClaimerName, {role: 'claimer', spawnedBy: name});
					console.log(nameful);
				}
			}
			//	Handle the conditions for spawning a third upgrader, else handle the conditions for spawning an upgrader
			if(repairers[name] > 0 && builders[name] > 0 && miners[name] > 2 && carriers[name] > 2 && upgraders[name] < 3) {
				if(upgraders[name] < minimumUpgraders[name]) {
					var nameful = eachSpawn.createCreep(workerBody[name], newUpgraderName, {role: 'upgrader', spawnedBy: name});
					console.log(nameful);
				}
			}
			else if(miners[name] > 1 && carriers[name] > 2 && upgraders[name] < 2) {
				if(upgraders[name] < minimumUpgraders[name]) {
					var nameful = eachSpawn.createCreep(workerBody[name], newUpgraderName, {role: 'upgrader', spawnedBy: name});
					console.log(nameful);
				}
			}
			else if(miners[name] > 0 && carriers[name] > 1 && upgraders[name] < 1) {
				if(upgraders[name] < minimumUpgraders[name]) {
					var nameful = eachSpawn.createCreep(workerBody[name], newUpgraderName, {role: 'upgrader', spawnedBy: name});
					console.log(nameful);
				}
			}
			//	Handle the conditions for spawning a builder
			if(miners[name] > 0 && carriers[name] > 1 && upgraders[name] > 0) {
				if (builders[name] < minimumBuilders[name]) {
				var nameful = eachSpawn.createCreep(workerBody[name], newBuilderName, {role: 'builder', spawnedBy: name});
				console.log(nameful);
				}
			else if (builders[name] > 0 && remoteBuilders[name] < minimumRemoteBuilders[name]) {
				var nameful = eachSpawn.createCreep(workerBody[name], newRemoteBuilderName, {role: 'spawnBuilder', spawnedBy: name});
				console.log(nameful);
			}
			}
			//	Handle the conditions for spawning a thrid repairer, else handle the conditions for spawning a repairer
			if(repairers[name] < 3 && builders[name] > 0 && upgraders[name] > 1 && miners[name] > 2 && carriers[name] > 2) {
				if(repairers[name] < minimumRepairers[name]) {
					var nameful = eachSpawn.createCreep(workerBody[name], newRepairerName, {role: 'repairer', spawnedBy: name});
					console.log(nameful);
				}
			}
			else if(builders[name] > 0 && upgraders[name] > 0 && carriers[name] > 1 && miners[name] > 0) {
				if(repairers[name] < minimumRepairers[name]) {
					var nameful = eachSpawn.createCreep(workerBody[name], newRepairerName, {role: 'repairer', spawnedBy: name});
					console.log(nameful);
				}
				else if (repairers[name] > 0 && remoteRepairers[name] < minimumRemoteRepairers[name]) {
					var nameful = eachSpawn.createCreep(workerBody[name], newRemoteRepairerName, {role: 'remoteRepairer', spawnedBy: name});
					console.log(nameful);
				}
			}
			//	Handle the conditions for spawning a Wall Repairer
			if(miners[name] > 1 && carriers[name] > 2 && upgraders[name] > 1 && builders[name] > 0 && repairers[name] > 1 && wallRepairers[name] < 2) {
				if(wallRepairers[name] < minimumWallRepairers[name]) {
					var nameful = eachSpawn.createCreep(workerBody[name], newWallRepairerName, {role: 'wallRepairer', spawnedBy: name});
					console.log(nameful);
				}
			}
			else if(miners[name] > 0 && carriers[name] > 1 && upgraders[name] > 0 && builders[name] > 0 && repairers[name] > 0) {
				if(wallRepairers[name] < minimumWallRepairers[name]) {
					var nameful = eachSpawn.createCreep(workerBody[name], newWallRepairerName, {role: 'wallRepairer', spawnedBy: name});
					console.log(nameful);
				}
			}
		}
		//	kill off that beginning harvester whilst there is at least 1 miner and 1 carrier
		for (let pain in Game.creeps) {
			var anotherCreep = Game.creeps[pain];
			if(anotherCreep.memory.role == 'harvester' && anotherCreep.memory.spawnedBy == name && miners[name] > 0 && carriers[name] > 0) {
				anotherCreep.suicide();
			}
		}
	}
	console.log('After creep spawn' + Game.cpu.getUsed());

};
