var util = require("util");
var path = require("path");
var fs = require("fs");

var webRoot = null;
var publicRoot = null;

var examplePrefix = "/data/examples";
var resourcePrefix = "/data/resources";
var pointCloudePrefix = "/data/resources/pointclouds";  //resourcePrefix + "/pointclouds";

var vm = require("vm");

var file_manager = module.exports = {
	init : function(webRoot_) {
		webRoot = webRoot_;
		publicRoot = webRoot_ + "/public/";
	},

	getPCDList : function(callback) {

		var exampleDir = path.normalize(util.format('%s%s', publicRoot, examplePrefix));
		//console.log("search example dir : " + exampleDir);

		// exampledDir 이 없으면 종료한다.
		var isExists = fs.existsSync(exampleDir);
		if(isExists === false) {	
			callback("Directory in not exists.", null);
			return;
		}		

		// exampleDir의 파일 리스트를 읽어온다.
		var fileList = fs.readdir(exampleDir, function(err, files) {
			if(err) {
				callback(err, null);
				return;
			}

			var pcdList = [];
			var readCount = 0;

			files.forEach(function(file) {
				var fileFullPath = path.normalize(util.format('%s%s/%s', publicRoot, examplePrefix, file));
				//console.log(fileFullPath);

				var pdcItem = {};

				// 1.js 들만 가지고 온다. 사실 html은 없어도 된다.
				if(fileFullPath.indexOf(".js") !== -1) {
					sceneProperties = null; // 변수 초기화
					
					// 해당 js 파일을 읽어서 컴파일을 시키고 javascript object로 변환한다.
					try {
						var text = fs.readFileSync(fileFullPath,'utf8')
						var script = vm.createScript(text);
						script.runInThisContext();

					} catch (e) {
						callback("read " + fileFullPath + " error", null);
						return;
					}
				
					// 만약 null이면 sceneProperties 속성이 없는 것이다.
					if(sceneProperties === null) {
						console.log(fileFullPath + "  have not sceneProperties. skip.!!");
					} else {
						var scenePropertiesJSURLPath = examplePrefix +  "/" + file;
						//console.log(scenePropertiesJSURLPath);

						// 없을 일은 없다.
						if(sceneProperties.path !== undefined) {
							
							// pcd item 설정.
							pdcItem.name = file;
							pdcItem.scenePropertiesJSFullPath = fileFullPath;
							pdcItem.scenePropertiesJS  = scenePropertiesJSURLPath;

							pdcItem.rescoureJSPath = sceneProperties.path;
						} else {
							console.log("path is undefined.");
						}

						var pointCloudURLPath = pointCloudePrefix + "/" + file.replace(".js","");

						var positionJSON = pointCloudURLPath + "/position.json";
						
						// 위치 정보 있는 json file.
						var positionJSONFullPath = util.format("%s%s", publicRoot, positionJSON);

						// position file을 읽어서 position을 셋팅을 한다.
						if(fs.existsSync(positionJSONFullPath)) {
							try {
								var text = fs.readFileSync(positionJSONFullPath,'utf8')
								var json = JSON.parse(text);

								var position = [];

								if(json.wtmX !== undefined && json.wtmX !== null) {
									position[0] = json.wtmX;
								} else {
									console.log("x is null.");
								}

								if(json.wtmY !== undefined && json.wtmZ !== null) {
									position[1] = json.wtmY;
								} else {
									console.log("y is null.");
								}


								pdcItem.position = position;

							}catch(e) {
								console.log("skip!");		
							}
						}

						// 로그 파일들이 있는 DIR 만 넘긴다.
						pdcItem.resoureDir= pointCloudURLPath;

						// 결과 프로젝트 리스트에 등록을 한다.
						pcdList.push(pdcItem);
					}	
				}

				readCount++;

				if(files.length === readCount) {
					callback(null, pcdList);
				}
			});
		});

	},

	getLogList : function(req, callback) {

		var resoureDir = null;

		// Get Parameter
		try {
			resoureDir = req.query.resoureDir;
		} catch(e) {
			resoureDir = null;
		}

		// Check Parameter
		if(resoureDir === undefined || resoureDir === null) {
			callback("[ERROR] parameter error", null);
		} else {
			var resoureFullPath = path.normalize(util.format('%s%s', publicRoot, resoureDir));
			var isExists = fs.existsSync(resoureFullPath);

			// resource 디렉토리가 없으면, 
			if(isExists === false) {	
				callback("Directory in not exists.", null);
				return;
			}	


			// exampleDir의 파일 리스트를 읽어온다.
			var fileList = fs.readdir(resoureFullPath, function(err, files) {
				var logList = [];
				var readCount = 0;

				files.forEach(function(file) {
					var fileFullPath = path.normalize(util.format('%s/%s', resoureFullPath, file));
					var logListItem = {};

					// 1.js 들만 가지고 온다. 사실 html은 없어도 된다.
					if(fileFullPath.indexOf(".log") !== -1 || fileFullPath.indexOf(".LOG") !== -1) {
						logListItem.logURLPath = resoureDir + "/" + file
						logList.push(logListItem);
					}

					readCount++;

					if(files.length === readCount) {
						callback(null, logList);
					}
				});
			});
		}
	}
}