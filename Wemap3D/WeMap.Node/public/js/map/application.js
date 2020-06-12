
//
function Application(areaMap2d, areaMap3d, currentMapType) {

	this.areaMap2d = areaMap2d;
	this.areaMap3d = areaMap3d;

	this.currentMapType = currentMapType;

	this.mapController2D = null;
	this.mapController3D = null;

	this.currentMapController = null;

	this.orthoActive = 2015;

	this.currentX = 409800.00;
	this.currentY = 232415.00;
	
	this.currentZoom = 11;  
}

Application.prototype.initialize = function() {
	this.initialize2D();
	this.initialize3D();
	
	// 현재 controller로 등록 후 수동으로 overviewmap을 추가시킨다.
	this.currentMapController = this.mapController2D;
	
	this.addOverviewMap();
}


/**
 * initialized 3D Map.
 */
Application.prototype.initialize3D = function() {
	if(this.mapController3D === null) {
		this.mapController3D = new MapController3D(this.areaMap3d, this.currentX, this.currentY);		
		this.mapController3D.initialize();
	}	
}

/** 2D Controllers 초기 화
      one 0 번만 두고 나머진 다 초기화만 시키고 pause 시킨다.
*/
Application.prototype.initialize2D = function() {
	if(this.mapController2D === null) {
		this.mapController2D = new MapController2D(this.areaMap2d, this.currentX, this.currentY, this.currentZoom);
		this.mapController2D.initialize();	
	}
}

Application.prototype.move = function(coordX, coordY, isConvertWTM, isAddMarker) {
	this.currentMapController.move(coordX, coordY, isConvertWTM, isAddMarker);
}

Application.prototype.addOverviewMap = function(){
	this.currentMapController.addOverviewMap();
}

// 2D에서 3D  갈때 
Application.prototype.configUIComponent3D = function() {
	// 우측  지도 활용 측정 기능 중 3d만 on
	$(".area-toolbar").find(".used-by-3d").removeClass("display-none");

	// 우측 하단 지도 활용 분석 기능 중 3d만 on
	$("#area-toolbar-bottom").removeClass("display-none");
	
	// 3차원 레이어 설정은 3D 모드에서만 활성화 시킨다. 
	$("#ul-3dLayer-list").removeClass("display-none");

	this.setVisibleMap("3d");
	this.clearMapFunction();
}

// 3d -> 2d 갈때 
Application.prototype.configUIComponent2D = function() {	
	// 좌측 지도 활용 기능 - 중 3d만 off
	$(".area-toolbar").find(".used-by-3d").addClass("display-none");

	// 우측 하단 지도 활용 분석 기능 중 3d만 on
	$("#area-toolbar-bottom").addClass("display-none");
	

	// 3차원 레이어 설정은 3D 모드에서만 활성화 시킨다.
	$("#ul-3dLayer-list").addClass("display-none");

	this.setVisibleMap("2d");
	this.clearMapFunction();
}

Application.prototype.clearMapFunction = function() {
	// ui selected 이벤트 모두 삭제. 및 현재 맵 기능 기능 취소.
	$(".area-toolbar").find(".btn-selected").removeClass("btn-selected");	
	// 현재 활성화 된 기능 취소.
	this.useMapFunction(6);
}

/**
 * 토글 되는 지도 모드에 따라 화면 visible 설정.
 * @param targetMapType
 */
Application.prototype.setVisibleMap = function(targetMapType) {
	switch(targetMapType) {
		case "2d":
			$("#" + this.areaMap2d).removeClass("display-none");
			$("#" + this.areaMap3d).addClass("display-none");
			break;
		case "3d":
			$("#" + this.areaMap3d).removeClass("display-none");
			$("#" + this.areaMap2d).addClass("display-none");
			break;
		default:
			break;
	}
}

Application.prototype.toggleMapType = function(targetType) {
	// TODO 3D에서 3D 로 가는 경우 추가로 넣음.
	if(this.currentMapType === targetType) { return; }
	
	// clear overview map
	this.currentMapController.removeOverviewMap();

	//
	this.clearMapFunction();
	
	// config future map.
	switch(targetType) {
		case "2d":					
			// 2d -> 2d
			if(this.currentMapType === "2d") {
				// TODO 코드 정리 필요함.
				this.config2DMap();
			// 3d -> 2d
			} else if(this.currentMapType === "3d") {	 
				// 2d - > 3d 전환 시 연속해서 전환을 하는 것을 막는다. (잠금)
				$("#btn-change-mode").attr("disabled", true);

				var duration = 2000;
				this.currentMapController.changeCameraTilt(90, 0, 2000);

				// 카메라 회전 시
				var currentMapView = this.currentMapController.getMap().getView();
				var rotation = toDegree(currentMapView.getRotation());
			
				if(rotation !== 0) {
					var toDegreeValue = 0;
					
					if(rotation >= 180 ) {
						toDegreeValue = toRadian(360);
					} else {
						toDegreeValue = toRadian(rotation - (rotation % 360));
					}
					
					currentMapView.setRotation(toDegreeValue);	
				}
				
				setTimeout(function() { 
					this.configUIComponent2D();
					this.config2DMap();

					// 2d - > 3d 전환 시 연속해서 전환을 하는 것을 막는다. (해제)
					$("#btn-change-mode").attr("disabled", false);
				}.bind(this), duration);
			}		
			break;
		case "3d":
			// 2d - > 3d 전환 시 연속해서 전환을 하는 것을 막는다. (잠금)
			$("#btn-change-mode").attr("disabled", true);
				
			this.configUIComponent3D();
			this.config3DMap();
			
			this.currentMapController.changeCameraTilt(45, undefined, 2000);

			// 2d - > 3d 전환 시 연속해서 전환을 하는 것을 막는다. (해제)
			setTimeout(function() { 
				$("#btn-change-mode").attr("disabled", false);
			}.bind(this), 2000);
			
			break;
		default:
			break;
	}
}

Application.prototype.config2DMap = function() {	
	this.configMap(this.mapController3D, this.mapController2D, "2d");

	this.currentMapController = this.mapController2D;

	this.currentMapType = "2d";
	this.addOverviewMap();
	this.updateMapSize();
}

//
Application.prototype.config3DMap = function() {	
	this.configMap(this.mapController2D, this.mapController3D, "3d");

	this.currentMapController = this.mapController3D;

	this.currentMapType = "3d";	
	this.addOverviewMap();
	this.updateMapSize();
}

/**
 * src map controller로부터 target controller의 정보를 변경한다.
 */
Application.prototype.configMap = function(srcMapController, targetMapController, targetMapType) {

	var map3dView = this.mapController3D.getMap().getView();
	
	var srcMap = srcMapController.getMap();
	var srcMapView = srcMap.getView();
	
	var targetMap = targetMapController.getMap();
	var targetMapView = targetMap.getView();
	
	var center = srcMapController.getCenter();
	targetMapView.setCenter([center[0], center[1]]);		

	switch(this.currentMapType) {
		case "2d":
			// 2d -> 2d
			if(targetMapType === "2d") {
				targetMap.setView(srcMapView);
			} 
			// 2d -> 3d
			else if(targetMapType === "3d") {
				var srcResolution = srcMapView.getResolution();
				var range = map3dView.getRangeForResolution(srcResolution);
				map3dView.setRange(range);
			} else {
				console.log("error");
			}
			break;
		case "3d":
			// 3d -> 2d
			if(targetMapType === "2d") {
				var resolution = map3dView.getResolutionForRange();
				targetMapView.setResolution(resolution);
			}
			// 3d- >3d
			else if(targetMapType === "3d") {
				console.log("loading......");
			} else {
				console.log("error");
			}
			break;
		default:
			break;
	}
}

/** updateMapSize 맵 갱신. */
Application.prototype.updateMapSize = function() {
	this.currentMapController.updateSize();
}

//
Application.prototype.changeHybirdLayer = function(layerID, isCheck) {
	this.currentMapController.changeHybirdLayer(layerID, isCheck);
}

/**
 * 지도 활용 기능 이용 하기.
 * @param functionID
 */
Application.prototype.useMapFunction = function(functionID) {
	this.currentMapController.useMapFunction(functionID);
}


// trip around
Application.prototype.setTripRoundSpeed = function(speed) {
	if(this.currentMapType === "3d") {
		var tripRoundInteraction = this.mapController3D.seoul3dmap.ol3dApp.interactions.tripRound;

		var isActive = tripRoundInteraction.getActive();
	
		if(isActive === true) {
			tripRoundInteraction.setSpeed(speed);
		}

	} else {
		alert("2d에서는 지원되지 않습니다.");
	}
}



// scenary shadow
Application.prototype.changeScenaryShadow = function(sunDate) {
	if(this.currentMapType === "3d") {
		this.mapController3D.seoul3dmap.ol3dApp.map.getView().setScenaryShadow({sunDate : sunDate.valueOf()});
	} else {
		alert("2d에서는 지원되지 않습니다.");
	}
}

// updateVisibilityParams
Application.prototype.updateVisibilityParams = function(position, rotation, tilt, far, fov) {
	if(this.currentMapType === "3d") {
		this.mapController3D.updateVisibilityParams(position, rotation, tilt, far, fov);
	} else {
		alert("2d에서는 지원되지 않습니다.");
	}
}


//on keyboard interaction
Application.prototype.onKeyboardInteraction = function() {
	if(this.currentMapType === "3d") {
		this.mapController3D.seoul3dmap.ol3dApp.interactions.Keyborad.setActive(true);
	} else {
		alert("2d에서는 지원되지 않습니다.");
	}
}


//off keyboard interaction
Application.prototype.offKeyboardInteraction = function() {
	if(this.currentMapType === "3d") {
		var isActive = this.mapController3D.seoul3dmap.ol3dApp.interactions.Keyborad.getActive();

		if (isActive) {
			this.mapController3D.seoul3dmap.ol3dApp.interactions.Keyborad.setActive(false);
		} 
	} else {
		alert("2d에서는 지원되지 않습니다.");
	}
}