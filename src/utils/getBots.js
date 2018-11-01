var fs = require('fs')

var directory = "./bots/"

class getBots {

	constructor(autoLoad = true) {

		this.arrayData = [];

		this.isEnd = 0;
		this.endCount = 0;
		this.loaded = false;
		this.onLoad = ()=> { console.log("no listener LOADED"); };

		if(autoLoad)	
			this.load()

		return this;
	}
	
	addLoad(f) {
		this.onLoad = f;
		return this;
	}
	
	load() {
		var self = this;
		
		fs.readdir(directory, function(err, files) {
			if(err)
				return console.error(err);
			
			if(files.length == 0)
				return console.error("Bots length NULL");

			files
			.map(function(v) { 
				return {
					name: v,
					// С первого раза не в том порядке... нужен перезапуск
					time: fs.statSync(directory + v).mtime.getTime()
				}; 
			})
			.sort( (a, b) => (a.time - b.time) )
			.map(v => v.name)
			.forEach((file, key, files) => {
			
				if(/*file == "old" || */file.startsWith("."))
					return;
				
				self.endCount++;
				
				self.arrayData.push(file);

				if (key === files.length - 1) {
					self.loaded = true;
					if(self.onLoad)
						self.onLoad(self.arrayData);
				}

			});
		});

		return this;
	}

	get(data=false) {
		if(!data)
			return this.arrayData
		
		return this.arrayData[data] || false
	}
	
	static getBots() {
		return new getBots();
	}
};

module.exports = getBots