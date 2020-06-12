function Seoul3dmap(target, centerX, centerY) {
	this.target = target;
	this.Active = false;
	
	this.ol3dApp = {};
	this.ol3dApp.defaults = {};
	
	this.ol3dApp.defaults.center   = [centerX, centerY];
	//
	// interactions
	//
	this.ol3dApp.interactions = {};
	
	// Keyborad
	this.ol3dApp.interactions.Keyborad  = new ol.interaction.Keyboard3d({panDelta:64, zoomDelta:0.05, rotateDelta:0.5, tiltDelta:-0.5,rotateDuration:0});
	// lookAround camera
	this.ol3dApp.interactions.lookAround  = new ol.interaction.FpsCamera3d({duration:3000,lodQaulity:1.0});
	// Measure Elevation
	this.ol3dApp.interactions.measureElev = new ol.interaction.MeasureElevation3d();
	// Measure Line
	this.ol3dApp.interactions.measureLine = new ol.interaction.MeasureLine3d();
	// Measure Area
	this.ol3dApp.interactions.measureArea = new ol.interaction.MeasureArea3d();
	// Measure Verivcal Profile
	this.ol3dApp.interactions.measureProf = new ol.interaction.MeasureProfile3d();

	// trip around
	this.ol3dApp.interactions.tripRound = new ol.interaction.TripRound();

	// Main Cameara
	this.ol3dApp.interactions.camera      = new ol.interaction.FreeCamera3d({kinetic:new ol.Kinetic(-0.005, 0.05, 100)});
}

Seoul3dmap.prototype.create = function() {
	this.isActive = true;

	var attributionControl = new ol.control.Attribution({className : "ol-attribution ol-custom-attribution"});
	attributionControl.setCollapsed(false);

	var controls = [new ol.control.Zoom3d({className:"ol-custom-zoom-control"})
			,new ol.control.Rotate({className:"ol-custom-compass-control",label:rotateImage,autoHide:false})
			,attributionControl];

	this.ol3dApp.map = new ol.Map3d({
	logo : false  
	,keyboardEventTarget:document
	,interactions: [
	this.ol3dApp.interactions.measureLine,
	this.ol3dApp.interactions.measureArea,
	this.ol3dApp.interactions.measureElev,
	this.ol3dApp.interactions.measureProf,
	this.ol3dApp.interactions.lookAround,
	this.ol3dApp.interactions.camera,
	this.ol3dApp.interactions.Keyborad,
	this.ol3dApp.interactions.tripRound]
	// controls
	,controls: controls      	 						
	,layers: [
		mapCommon.layers.terrainDem,
		mapCommon.layers.imagery,
		mapCommon.layers.imagery_vw,
		mapCommon.layers.imagery_daum,
		mapCommon.layers.imagery_naver,
		mapCommon.layers.lod1,
		mapCommon.layers.lod2,
		mapCommon.layers.lod1_vw,
		mapCommon.layers.lod2_vw,		
		mapCommon.layers.building,
		mapCommon.layers.building_vw,
		mapCommon.layers.lod2_str,				
		mapCommon.layers.structure,
		mapCommon.layers.seoulro,
		mapCommon.layers.terrainDaumHybrid,
		mapCommon.layers.terrainNaverHybrid,
		mapCommon.layers.terrainNaverHybrid_poi,
		mapCommon.layers.terrainWMS,
		mapCommon.layers.asset3d,
		mapCommon.layers.debug		
	]
	,target  : this.target,
	renderer: 'webgl',
	loadTilesWhileInteracting: true,
	loadTilesWhileAnimating  : !isMobile,
	loadBuildingAfterTerrain :  isMobile,
	skybox : {
		rayleigh       :1
	   ,turbidity      :1
	   ,luminance      :1
	   ,mieCoefficient :0.055
	   ,mieDirectionalG:0.8
	 }
    , 
	view    : new ol.View3d({
		projection : projLocal,
		center  : [196303,550411],
		extent  : [179190,536547,216242,566864],
		zoom    : 9,
		resolutions:[256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5,0.25,0.125,0.0625],
		rotation: 0*Math.PI/180, // direction of north
		tilt    : 40*Math.PI/180,
		range   : 512,
		constrainRotation:false,
		constrainTilt :[(isMobile?15:15)*Math.PI/180,90*Math.PI/180],
		constrainRange:[10, 35000],
		lodQuality    : 1.0		})
	});
}

// using 3d map function.
Seoul3dmap.prototype.createFake = function() {
	this.ol3dApp.map = new ol.Map3d({
	   logo : false  
	  ,keyboardEventTarget:document
	  ,interactions:[]
	  ,controls: []      	 						
	  ,layers: []
	  ,target  : this.target
	  ,renderer: 'webgl'
	  ,loadTilesWhileInteracting: true
	  ,loadTilesWhileAnimating  : true
	  ,loadBuildingAfterTerrain : false
	  ,view    : new ol.View3d({
	     projection : projLocal
	    ,center  : this.ol3dApp.defaults.center
	    ,extent  : projLocal.getExtent()
	    ,zoom    : 11
	    ,minZoom : 0
	    ,maxZoom : 14
	    ,rotation: 0*Math.PI/180
	    ,tilt    : 90*Math.PI/180
	    ,range   : 2048
	    ,constrainRotation:false
	    ,constrainTilt :[(mapCommon.isMobile?22:10)*Math.PI/180,90*Math.PI/180]
	    ,constrainRange:[10,  524288*2.2]
	    ,lodQuality : 0.9
	    ,lodSpeed   : 0.1
	  })
	});
}

Seoul3dmap.prototype.pause = function() {
	this.ol3dApp.map.setTarget(null);
	this.isActivie = false;
}

//
Seoul3dmap.prototype.resume = function() {
	if(this.isActive === false) {
		this.ol3dApp.map.setTarget(this.target);
		this.isActive = true;
	}
}

//
Seoul3dmap.prototype.getMap = function() {
	return this.ol2dApp.map;
}

//
Seoul3dmap.prototype.addOverviewMap = function() {
	this.ol3dApp.map.addControl(mapCommon.controls.overviewmap);
}

//
Seoul3dmap.prototype.removeOverviewMap = function() {
	this.ol3dApp.map.removeControl(mapCommon.controls.overviewmap);
}