var 
	colors = require('colors/safe'),
	ReadLine = require('readline')

colors.setTheme({
	dateBG: 'bgMagenta',
	dataC: 'yellow',
	warnBG: 'bgBlack',
	warn: 'yellow',
	errorBG: 'bgBlack',
	error: 'red'
});


function ccon(message, color, colorBG) {
	if(message === undefined) {
		console.log("\n")
		return;
	}

	if(color === true) {
		color = "red";
		colorBG = "Blue";
	}

	colorBG = "bg"+ ((typeof colorBG == "string")?colorBG:"Black");
	color = (typeof color == "string")?color:"green";

	console.log(colors[colorBG](colors[color](message)) );
}
function con(message, color, colorBG) {
	if(message === undefined) {
		console.log("\n")
		return;
	}

	if(color === true) {
		color = "red";
		colorBG = "Blue";
	}
	
	/*bgBlack
	bgRed
	bgGreen
	bgYellow
	bgBlue
	bgMagenta
	bgCyan
	bgWhite*/

	colorBG = "bg"+ ((typeof colorBG == "string")?colorBG:"Black");
	color = (typeof color == "string")?color:"green";

	console.log(colors.dateBG( '[' +dateF()+ ']' )+": "+ colors[colorBG](colors[color](message)) );
}
function dateF(date) {
	
	date = date!==undefined ? new Date(date) : new Date()
	
	var dYear = date.getFullYear()
	, dMonthF = (date.getMonth()+1)
	, dMonth = dMonthF > 9 ? dMonthF : "0"+dMonthF
	, dDay = date.getDate() > 9 ? date.getDate() : "0"+date.getDate()
	, dHour = date.getHours() > 9 ? date.getHours() : "0"+date.getHours()
	, dMinutes = date.getMinutes() > 9 ? date.getMinutes() : "0"+date.getMinutes()
	, dSeconds = date.getSeconds() > 9 ? date.getSeconds() : "0"+date.getSeconds()
	, date_format = dDay +'.' +dMonth +'.' +dYear +' '+ dHour + ':' + dMinutes + ':' + dSeconds;
	
	return date_format;
}
// con("Started");

function rnd(min, max) {
	if(max===undefined) {
		max=min
		min=0
	}
	return Math.floor(min + Math.random() * (max + 1 - min));
}
// var rand = (minimum, maximum)=> Math.round( Math.random() * (maximum - minimum) + minimum);

var nowUNIX = ()=> (Math.floor(Date.now() / 1000)|0);

function setLine(cb) {
	if(!this.rl) {
		this.rl = ReadLine.createInterface(process.stdin, process.stdout);
		this.rl.setPrompt('_> ');
		this.rl.prompt();
	}
	this.rl.on('line', cb);
	return this.rl;
}

var sleep = (ms)=> new Promise(resolve => setTimeout(resolve, ms*1000));
var shuffle = function(array) {
	var clone = array.slice(0), pos, temp;
	for (var i = 0; i < clone.length; i++) {
		pos = Math.floor(Math.random() * clone.length);
		temp = clone[i];
		clone[i] = clone[pos];
		clone[pos] = temp;
	}
	return clone;
};

function getKeyByValue(object, value) {
	return Object.keys(object).find(key => object[key] === value);
}
var objFilter = (obj, predicate) => Object.keys(obj).filter( key => predicate(obj[key]) )
	.reduce( (res, key) => (res[key] = obj[key], res), {} );

global._ = module.exports = {
    ccon: ccon,
    con: con,
    log: con,
    rnd,
    rand: rnd,
    nowUNIX: nowUNIX,
    now: nowUNIX,
	
	dateF: dateF,

	setLine,
	sleep,
	shuffle: shuffle,
	getKeyByValue,
	objFilter,
};