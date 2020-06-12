var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var request = require('request');
var app = express();
var ejs = require('ejs');
var util = require('util');
var fs = require('fs');

var sqlite3 = require('sqlite3');
var cluster = require('cluster');
var http = require('http');
var os = require('os');
var sqlite3 = require('sqlite3');

// file 관련 기능있는 함수.
var file_manager = require("./file_manager");

var numCPUs = os.cpus().length-1;

var isForked = false;

app.set('port', process.env.PORT || 3009);
app.set('views', path.join(__dirname, 'views'));
app.engine('html', ejs.__express);

// 호출 순서 중요.
app.use(express.cookieParser());
app.use(express.session({
	secret : 'secret key',
	key :'rint',
	cookie : {
		maxAge :  60 * 1000 * 60
	}
}));

// 크로스 도메인 설정. 외부 에서 접근 가능 하도록 허용.
var allowCrossDomain = function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
	res.header("Access-Control-Allow-Headers", "Content-Type");

	next();
}

app.use(allowCrossDomain);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.bodyParser());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}


/** 3D DATA SERVICE */
var sqlite3 = require('sqlite3');

if (cluster.isMaster) {
    // 클러스터 워커 프로세스 포크
    if(isForked)
	return;

     cluster.schedulingPolicy = cluster.SCHED_RR;
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', function(worker, code, signal) {
        console.log('worker ' + worker.process.pid + ' died');
    });

    isForked = true;
    return;
}
else {
	var server = http.createServer(app).listen(app.get('port'), function (req, res) {
		console.log('Express server listening on port ' + app.get('port'));
	});
}

var cached  = {};
var dirName = __dirname;
//var pathDb  = __dirname+'/contents/tiles/'
var pathDb  = path.join(__dirname,'..','/contents/tiles/')
//var tileDb  = new sqlite3.Database(pathDb + 'tile.content.sqlite');
console.log(pathDb);

var dicLayers = {};
//--------------------------------
// Terrain(DEM)
// NOTE! DEM layer should be singleton!
//--------------------------------
// dicLayers['dem'] = {group:'dem', version:2019, file:'tile.dem.2019.sqlite', db:null, stmt:null};
//--------------------------------
// Imagery
//--------------------------------
//  dicLayers['imagery'] = {group:'ortho', version:2019, file:'tile.imagery.2019.8cm.sqlite', db:null, stmt:null};
//  dicLayers['imagery_vw'] = {group:'ortho', version:2016, file:'tile.imagery.vw.sqlite', db:null, stmt:null};
//  dicLayers['imagery'] = {group:'ortho', version:2019, file:'tile.imagery.2019.25cm.sqlite', db:null, stmt:null};
  dicLayers['ortho_vw'] = {group:'ortho', version:2016, file:'trueortho.vw.seoul.sqlite', db:null, stmt:null};
  dicLayers['ortho_L18'] = {group:'ortho', version:2016, file:'seoul_ortho_L18_512.sqlite', db:null, stmt:null};
//--------------------------------
// Building
//--------------------------------
//  dicLayers['building'] = {group:'building', version:2019, file:'tile.building.2019.sqlite', db:null, stmt:null};
//  dicLayers['building_vw'] = {group:'building', version:2019, file:'tile.building.vw.sqlite', db:null, stmt:null};
//--------------------------------
// structure(Bridge)
//--------------------------------
//  dicLayers['structure'] = {group:'structure', version:2016, file:'tile.structure.2017.sqlite', db:null, stmt:null};
//  dicLayers['seoulro'] = {group:'structure', version:2016, file:'tile.seoulro_2048.sqlite', db:null, stmt:null};
//   dicLayers['structure'] = {group:'structure', version:2019, file:'tile.seoulro_2048.sqlite', db:null, stmt:null};
//  dicLayers['lod2_str'] = {group:'structure', version:2016, file:'tile.lod2.vw_str.sqlite', db:null, stmt:null};
//--------------------------------
// LOD(footprint)
//--------------------------------
//dicLayers['lod1'] = {group:'lod1', version:2019, file:'tile.lod1.2019.sqlite', db:null, stmt:null};
//dicLayers['lod1_vw'] = {group:'lod1', version:2019, file:'tile.lod1.vw.sqlite', db:null, stmt:null};
dicLayers['lod2'] = {group:'lod2', version:2019, file:'tile.lod2.2019.sqlite', db:null, stmt:null};
//dicLayers['lod2_vw'] = {group:'lod2', version:2019, file:'tile.lod2.vw.sqlite', db:null, stmt:null};

 // tuning
// db-memory(8G) = page_size(65536)*cache_size(8192)*cores(8) = 4G
//
//tileDb.run('PRAGMA cache_size=5461;');
//
// GET TILE By SQLite3
//

app.get('/tile.sqlite/:layer/:level/:col/:row.:ext', function(req, res) {
	//console.log(req.params.layer, req.params.level, req.params.col, req.params.row);
	if( dicLayers[req.params.layer] === undefined ) {
		res.writeHead(404, { "Content-Type": "text/plain"});
		res.end();
	}
	else {
		var cachedLayer = dicLayers[req.params.layer];
		if( cachedLayer.db === null ) {
			// Open SQLite Database
			try {
				cachedLayer.db = new sqlite3.Database(pathDb + cachedLayer.file, sqlite3.OPEN_READONLY);
				// Estimate SALite CacheSize
				var dbPageSize = 65536;
				var sysMemory  = os.totalmem()*0.7;//16 * 1024*1024*1024; // Must be in range (70%~80%)
				var cntLayers  = (Object.keys(dicLayers).length*0.7+0.5)|0;
				var cacheSize  = (sysMemory / cntLayers / numCPUs / dbPageSize)|0; // count of cache pages
				//console.log('cacheSize='+cacheSize+'(pages) cacheMemory='+(cacheSize*dbPageSize/1024/1024).toFixed(0)+'(M)');
				cachedLayer.db.run('PRAGMA cache_size={s};'.replace('{s}', cacheSize));
			}
			catch(e) {
				console.log('Failed - Open database at the layer' + req.params.layer);
				res.writeHead(404, { "Content-Type": "text/plain"});
				res.end();
			}
		}
		if ((req.params.layer === 'building_vw') || (req.params.layer === 'structure')) {
//		if (req.params.layer === 'building_vw') {
			if( cachedLayer.stmt === null && cachedLayer.db !== null ) {
				cachedLayer.stmt = cachedLayer.db.prepare('SELECT data_mesh, data_texture FROM g3d_tile_content WHERE tile_id=? limit 1');
			}
			if( cachedLayer.stmt === null ) {
				res.writeHead(404, { "Content-Type": "text/plain"});
				res.end();
			}
			else {
				cachedLayer.stmt.get([((req.params.level<<26)|(req.params.col<<13)|(req.params.row<<0))],
					function(error, row) {
						if(error || !row){
							res.writeHead(404, { "Content-Type": "text/plain"});
							res.end();
						}
						else {
							//res.header('Cache-Control', 'public, max-age=31557600');
							if( req.params.ext === 'wgl' ) {
								res.header("Content-Encoding", "gzip");
								res.end(row.data_mesh);
							}
							else if( req.params.ext === 'png' ) {
							res.writeHead(200, {'Content-Type': 'image/png'});
							res.end(row.data_texture);
							}
							else {
								res.writeHead(200, {'Content-Type': 'image/jpeg'});
								res.end(row.data_texture);
							}
						}
				});
			}
		}
		else {
			if( cachedLayer.stmt === null && cachedLayer.db !== null ) {
				cachedLayer.stmt = cachedLayer.db.prepare('SELECT data_mesh, data_tex FROM g3d_tile_content WHERE tile_z=? and tile_x=? and tile_y=? limit 1');
			}
			if( cachedLayer.stmt === null ) {
				res.writeHead(404, { "Content-Type": "text/plain"});
				res.end();
			}
			else {
				cachedLayer.stmt.get([req.params.level, req.params.col, req.params.row],
					function(error, row) {
						if(error || !row){
							res.writeHead(404, { "Content-Type": "text/plain"});
							res.end();
						}
						else {
							//res.header('Cache-Control', 'public, max-age=31557600');
							if( req.params.ext === 'wgl' ) {
								res.header("Content-Encoding", "gzip");
								res.end(row.data_mesh);
							}
							else if( req.params.ext === 'png' ) {
				  				res.writeHead(200, {'Content-Type': 'image/png'});
				  				res.end(row.data_tex);
							}
							else {
								res.writeHead(200, {'Content-Type': 'image/jpeg'});
								res.end(row.data_tex);
							}
						}
					});
			}
		}
	}

});

/*
app.get('/tile.sqlite/:layer/:level/:col/:row.:ext', function(req, res) {
	//console.log(req.params.layer, req.params.level, req.params.col, req.params.row);
	if( dicLayers[req.params.layer] === undefined ) {
		res.writeHead(404, { "Content-Type": "text/plain"});
		res.end();
	}
	else {
		var cachedLayer = dicLayers[req.params.layer];
		if( cachedLayer.db === null ) {
			// Open SQLite Database
			try {
				cachedLayer.db = new sqlite3.Database(pathDb + cachedLayer.file, sqlite3.OPEN_READONLY);
				// Estimate SALite CacheSize
				var dbPageSize = 65536;
				var sysMemory  = os.totalmem()*0.7;//16 * 1024*1024*1024; // Must be in range (70%~80%)
				var cntLayers  = (Object.keys(dicLayers).length*0.7+0.5)|0;
				var cacheSize  = (sysMemory / cntLayers / numCPUs / dbPageSize)|0; // count of cache pages
				//console.log('cacheSize='+cacheSize+'(pages) cacheMemory='+(cacheSize*dbPageSize/1024/1024).toFixed(0)+'(M)');
				cachedLayer.db.run('PRAGMA cache_size={s};'.replace('{s}', cacheSize));
			}
			catch(e) {
				console.log('Failed - Open database at the layer' + req.params.layer);
				res.writeHead(404, { "Content-Type": "text/plain"});
				res.end();
			}
		}
		if( cachedLayer.stmt === null && cachedLayer.db !== null ) {
			cachedLayer.stmt = cachedLayer.db.prepare('SELECT data_mesh, data_tex FROM g3d_tile_content WHERE tile_z=? and tile_x=? and tile_y=? limit 1');
		}
		if( cachedLayer.stmt === null ) {
			res.writeHead(404, { "Content-Type": "text/plain"});
			res.end();
		}
		else {
			cachedLayer.stmt.get([req.params.level, req.params.col, req.params.row],
				function(error, row) {
					if(error || !row){
						res.writeHead(404, { "Content-Type": "text/plain"});
						res.end();
					}
					else {
						//res.header('Cache-Control', 'public, max-age=31557600');
						if( req.params.ext === 'wgl' ) {
							res.header("Content-Encoding", "gzip");
							res.end(row.data_mesh);
						}
            else if( req.params.ext === 'png' ) {
              res.writeHead(200, {'Content-Type': 'image/png'});
              res.end(row.data_tex);
            }
						else {
							res.writeHead(200, {'Content-Type': 'image/jpeg'});
							res.end(row.data_tex);
						}
					}
			});
		}
	}
}); */


// Pipe
app.get('/MAPPIPE/*', function(req, res) {
	request.get(req.path.replace('/MAPPIPE/','')).on('error', function(err) {
	console.log(err + ' ' + req.path.replace('/MAPPIPE/',''));
	}).pipe(res);
});

// Router
app.get('/contents/*.(jpg|png|mp4|pkm)', function(req, res) {
	var fileName = dirName+ req.path;
	var fileStream = fs.createReadStream(fileName);
	fileStream.on('open', function (error) {
		fileStream.pipe(res);
	});
	fileStream.on('error', function (error) {
		res.writeHead(404);
		res.end();
	});
});




// index
 app.get('/', function(req, res) {
 	res.render('index.html');
 });

// file manager에 public root 설정. 공유.
//file_manager.init(__dirname);

// Get PCD List
// model directory를 읽어서 프로젝트 리스트들을 불러온다.
/*
app.get('/getPCDList', function(req, res) {
	file_manager.getPCDList(function(err, result) {
		if(err) {
			res.send({error:err});
		} else {
			res.send({pcdList : result});
		}

	});
});
*/