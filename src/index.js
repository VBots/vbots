var _ = require("./src/helper"),
	getBots = new (require("./src/getBots"))(false);

process.on('uncaughtException', (err) => {
	console.log("\n*===*\nERR:");
	console.error(err);
	console.log("*===*\n");
});


var sType = false, //  Current BOT
	sTypeINT = -1,
	osBot = false


for (var argn = 2; argn < process.argv.length; argn++) {

	if(["-p", "-d", "-t"].includes(process.argv[argn])) {

		if (process.argv[argn] === '-t') {
			var safeI = parseInt(process.argv[argn + 1]); 
			sTypeINT = isNaN(safeI)?sTypeINT:safeI;
			// console.log("Arg: "+process.argv[argn]+" : "+process.argv[argn+1])

			argn++;
			continue;
		}

		if (process.argv[argn] === '-d') {
			// debugging = 1;
			// console.log("Arg: "+process.argv[argn]+" : "+process.argv[argn+1])
			continue;
		}
	}
}
var rl = _.setLine((line) => {
	switch(line.trim()) {
		
		case '':
			break;

		case 'hh':
			_.ccon("Cmds:", "red");
			_.ccon("Save - try save data");
			_.ccon("...");
		break;

		case 'info':
			console.log("osBot", osBot);
			console.log(osBot.q);
			break;
			
		case 'save':
			if(osBot && osBot.q && osBot.q.izCap) {
				_.con("Try save data...")
				osBot.q.izCap.save();
			}
			break;
	}
});
startApp();


function startApp() {
	getBots.addLoad((bots)=> {
		var dataUser = false;

		// console.log(sTypeINT)

		if(sTypeINT == -1 || sTypeINT > bots.length-1) {
			_.ccon("FAI K", !0);
			setTimeout(trySelect, 1e3, bots);
		}
		else if(bots[sTypeINT]) {
			loadBot(bots[sTypeINT], sTypeINT)
		}
	})
	.load();
}

function trySelect(bots) {
	var msg = "Select:";

	for (var i = 0; i < bots.length; i++) {
		msg += (i%2==0?"\n":"\t")+(i+1)+". Bot "+bots[i] + (i%2==0?"\t| ":"")
	}
	msg += "\nEnter ID: ";

	_.rl.question(msg, data=> {
		if(data >= 1 && data <= bots.length)
			loadBot(bots[data-1], data-1);
		else
			trySelect(bots);
	});
}

function loadBot(name, id) {
	sTypeINT = id || sTypeINT;
	sType = name || sType;

	osBot = require("./bots/"+sType+"/"+sType+".js");
	var { name, start } = osBot;

	_.con("BOT '"+name+"' loaded");

	start();
}


process.stdin.resume();
process.on('SIGINT', tryExit);
function tryExit() {
	_.con('The process will be stopped...', "red");
			
	if(osBot && osBot.q && osBot.q.izCap.izCS().length > 0) {
		osBot.q.izCap.izCS().forEach((data, index)=> {
			if(!data.isExitSave)
				data.save(true, true, checkTryExit)
		})
	}
	checkTryExit();
}
function checkTryExit() {
	var allSaved = true;

	if(osBot && osBot.q && osBot.q.izCap) {
		osBot.q.izCap.izCS().forEach((data)=> {
			if(allSaved && !data.isExitSave)
				allSaved = false;
		});
	}

	if(allSaved) {
		process.exit();
		_.con('Process stopped', "yellow");
	}
}

setInterval(()=> {
	// Auto save
	if(osBot && osBot.q && osBot.q.izCap)
		osBot.q.izCap.save();
}, 2*60*60*1000); // 2 hours