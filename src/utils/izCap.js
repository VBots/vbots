var fs = require('fs');

var izCS = [];

/*
	MOD ver 2.4 - 04.10.2018
*/

class izCap {
	
	constructor(filePath = false, saveChanged = true, _h = false) {
		this._ = _h
		
		izCS.push(this)
		this.isExitSave = false
		
		this.filePath = filePath;

		if(filePath) {
			this.saveChanged = saveChanged;
			
			this.arrayCap = {};
			this.loaded = false;
			this.onLoad = [];

			this.load()
		}
	}
	
	addLoad(f) {
		this.onLoad.push(f);
		return this;
	}

	setBeforeExitSave(f) {
		this.saveExitCB = f;
		return this;
	}
	
	load() {
		var self = this;
		fs.exists(this.filePath+'.json', function(exists) {
			if(!exists) return;
			fs.readFile(self.filePath+'.json', function (err, data) {
				if(err) return console.error(err);

				self.arrayCap = JSON.parse(data.toString())
				self.loaded = true;

				for (var i = 0; i < self.onLoad.length; i++) {
					self.onLoad[i] && self.onLoad[i]();
				}
			});
		});
		return this;
	}
	
	save(zExit=false, infot=true, _cb=false) {
		var self = this;
		if(this.saveExitCB && zExit) this.saveExitCB();
		fs.writeFile(this.filePath+'.json', JSON.stringify(this.arrayCap, null, '\t'), function(err) {
			if(err) throw err;
			if(zExit) self.isExitSave = true;
			if (infot) {
				if(self._) self._.con("Saved: "+self.filePath, "green");
				else if(typeof con == "function") con("Saved: "+self.filePath, "green");
				else console.log("Saved: "+self.filePath);
			}
			if(_cb) _cb();
		});
		return this;
	}

	get(data, def) {
		let val = this.arrayCap[data]
		return (val === undefined && def !== undefined) ? def : val;
	}
	set(data, value, ssave=false) {
		this.arrayCap[data] = value;
		if(this.saveChanged || ssave)
			this.save(false, ssave);
		return this;
	}
	
	static fastSave(cachefile, value) {
		var self = this
			, _cachepath = cachefile+'.json'
		
		fs.writeFile(_cachepath, JSON.stringify(value, null, '\t'), function(err){
			if (err) throw err;
		});
		return this;
	}	
	static fastLoad(_cb) {
        var self = this
			, _cachepath = cachefile+'.json'
		
		fs.exists(_cachepath, function(exists) {
			if(exists) {
				fs.readFile(_cachepath, function (err, data) {
					if(err) throw err
					_cb(JSON.parse(data.toString()))
				});
			}
			else
				_cb(false)
		});
        return this;
	}
	
	static izCap() {
		return new izCap();
	}
	
	static save() {
		izCS.forEach((data)=> {
			data.save(false, true);
		})
	}
	static reizCS() {
		izCS = []
	}
	static izCS() {
		return izCS
	}
};

module.exports = izCap