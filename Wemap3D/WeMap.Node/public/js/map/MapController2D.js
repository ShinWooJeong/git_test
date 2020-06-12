/**
 * 
 */
function MapController2D(target, currentX, currentY, currentZoom, isUseCommonLayer, isAddMoveEndEvent, isAddAttribution) {
	
	this.target = target;
	
	this.currentWTMX = currentX;
	this.currentWTMY = currentY;	
	
	// 공통 레이어를 사용 할 지, moveend 이벤트를 넣을지.
	this.isUseCommonLayer = isUseCommonLayer;
	this.isAddMoveEndEvent = isAddMoveEndEvent;
	
	this.isAddAttribution = isAddAttribution;
	
	// 맵 생성
	this.seoul2dmap = new Seoul2dmap(this.target, currentX, currentY, currentZoom, this.isUseCommonLayer, this.isAddAttribution);	

	this.isInitialized = false;
	
	// 측정 기능 관련
	this.listener = null;
	this.sketch = null;
	
	this.measureIntercation = null;
	this.measureTooltipElement = null;
	this.measureTooltip = null;
	
	this.features = null;
	this.featureOverlay = null;
	
	this.marker = null;
	this.markerPoint = null;
	
	this.isDrawingLine = false;
	this.isDrawingPolygon = false;
	this.isMeasured = 0;
	
	this.totalMeasuredDistance = 0;
	this.preTotalMeasuredDistance = 0;
	
	this.measureType = null;
	
	this.drawedLinePointCount = 0;
	this.drawedPolygonPointCount = 0;
	
	this.timmerID = 0;   
}

// resume map
MapController2D.prototype.resume = function() {
	this.seoul2dmap.resume();
}

// pause map
MapController2D.prototype.pause = function() {
	this.seoul2dmap.pause();
}

// add overview map
MapController2D.prototype.addOverviewMap = function() {
	this.seoul2dmap.addOverviewMap();
}

MapController2D.prototype.closeOverViewMap = function() {
	mapCommon.controls.overviewmap.setCollapsed(true);
}

// remove overveiw map
MapController2D.prototype.removeOverviewMap = function() {
	this.seoul2dmap.removeOverviewMap();
}

// add scale line
MapController2D.prototype.addScaleLine = function() {
	this.seoul2dmap.addScaleLine();
}

// remove scale line
MapController2D.prototype.removeScaleLine = function() {
	this.seoul2dmap.removeScaleLine();
}

// add keyboard zoom interaction
MapController2D.prototype.addKeyboardZoomInteraction = function() {
	this.seoul2dmap.addKeyboardZoomInteraction();
}

MapController2D.prototype.initialize = function() {
	this.seoul2dmap.create();
}

// Geometry에 Point 갯 수가 증가 시.
MapController2D.prototype.createInterimMeasureTooltip = function(coordinate) {
	// 클릭 시 점을 찍는다.
	if(this.isDrawingPolygon === true || this.isDrawingLine === true) {
		this.addPointFeature(coordinate);
		
		if(this.isDrawingPolygon === true)
			return;
	} else {
		return;
	}
	
	// 전체 토탈(누적) 거리와 이전까지 누적된 총 거리를 이용해 상대 거리를 구한다.
	var differ = parseInt((this.totalMeasuredDistance - this.preTotalMeasuredDistance).toFixed(2));
	
	// differ 0 이면 취소한다.
	if(differ === 0) 
		return;
	
	// 상대 거리 거리 구하기.// 최종 거리 구하기
	var differOutput,totalSumOutput = null;
	
	if (differ > 1000) {
      differOutput = (Math.round(differ / 1000 * 100) / 100) + " " + "km";
    } else {
      differOutput = (Math.round(differ * 100) / 100) + " " + "m";
    }
	
	if(this.totalMeasuredDistance > 1000) {
		totalSumOutput = (Math.round(this.totalMeasuredDistance / 1000 * 100) / 100) + " " + "km";
	} else {
		totalSumOutput = (Math.round(this.totalMeasuredDistance * 100) / 100) + " " + "m";
	}
	
	if(this.measureTooltipElement === null) {
		this.createMeasureTooltip();
	}
	
	this.measureTooltipElement.innerHTML = "<p>" + differOutput + "</p> <p> \u03A3 " + totalSumOutput +"</p>";
	this.measureTooltipElement.className = 'tooltip tooltip-measure';

	this.measureTooltipElement = null;
	this.createMeasureTooltip();	
	
	// 현재 측정된 
	this.preTotalMeasuredDistance = this.totalMeasuredDistance;	
}

// add Mearsuer Point
MapController2D.prototype.addPointFeature = function(coord) {
	var geom = new ol.geom.Point(coord);
	var pointFeature = new ol.Feature({
        geometry: geom,
        radius: 2
    });
    pointFeature.setStyle(pointStyle);
    
    this.features.push(pointFeature);
}

// tooltip 추가 시킨다.
MapController2D.prototype.createMeasureTooltip = function() {
	this.removeMeasureTooltip();
	
	this.measureTooltipElement = document.createElement("div");
	this.measureTooltipElement.className = "tooltip tooltip-measure";
	
	this.measureTooltip = new ol.Overlay({
		element: this.measureTooltipElement,
		offset: [0, -15],
		positioning: "bottom-center"
    });
	
    this.seoul2dmap.ol2dApp.map.addOverlay(this.measureTooltip);
}

// reemove measure tooltip html.
MapController2D.prototype.removeMeasureTooltip = function() {
	if (this.measureTooltipElement) {
		this.measureTooltipElement.parentNode.removeChild(this.measureTooltipElement);
		this.measureTooltipElement = null;
	}	
}

// remove all measure ovelays
MapController2D.prototype.removeMeasureOvelay = function() {
	var overlays = this.seoul2dmap.ol2dApp.map.getOverlays();
	var overlayLength = overlays.getLength();
	
	var temp = [];
	
	// save temp overlay
	for(var i = 0; i < overlayLength; i++) {
		var overlayItem = overlays.item(i);
		temp.push(overlayItem);
	}
	
	// remove overlay
	for(var i = 0; i < overlayLength; i++) {
		this.seoul2dmap.ol2dApp.map.removeOverlay(temp[i]);
	}
	
	temp.length = 0;	
}

// get Measure distance
MapController2D.prototype.getMeasuredDistance = function(line) {
    var distance = Math.round(line.getLength() * 100) / 100;
    return distance;
}

// format Area
MapController2D.prototype.formatArea = function(polygon) {
    var area = polygon.getArea();
    	
    var output;
    if (area > 10000) {
      output = (Math.round(area / 1000000 * 100) / 100) +
          ' ' + 'km<sup>2</sup>';
    } else {
      output = (Math.round(area * 100) / 100) +
          ' ' + 'm<sup>2</sup>';
    }
       
    if(area === 0) {
    	output = "start";
    }
    
    return output;
};

// add measure interaction
MapController2D.prototype.addMeasureInteraction = function(type) {
	this.measureType = (type == 'polygon' ? 'Polygon' : 'LineString');
	
	this.features = new ol.Collection();
	var polygonSource = new ol.source.Vector({features: this.features});
	
	this.featureOverlay = new ol.layer.Vector({
		source: polygonSource
	});
	
	this.featureOverlay.setMap(this.seoul2dmap.getMap());
	
	var measureType = this.measureType;
	
	this.measureIntercation = new ol.interaction.Draw({
		features : this.features,
	    type: measureType,
	    style: drawStartStyle
	});
	
	this.seoul2dmap.getMap().addInteraction(this.measureIntercation);
	
	// 먼저 레이어 를 만들어 놓는다.
	this.createMeasureTooltip.call(this);
	
	this.measureIntercation.on("drawstart", MapController2D.onDrawStart.bind(this));
	this.measureIntercation.on("drawend", MapController2D.onDrawEnd.bind(this));
}
   
// on Draw Start
MapController2D.onDrawStart = function(evt) {
	this.sketch = evt.feature;
	var tooltipCoord; 
	 
	// drawstart 후 첫 좌표만 점을 찍는다.
	if (this.measureType === "Polygon") {
		tooltipCoord = this.sketch.getGeometry().getLastCoordinate();		
		this.addPointFeature(tooltipCoord);
	} else if(this.measureType === "LineString") {
		tooltipCoord = this.sketch.getGeometry().getCoordinates();
		this.addPointFeature(tooltipCoord[0]);      
	}

	// 이후 geometry 변할 때마다 의 리스너를 등록 한다.
	this.listener = this.sketch.getGeometry().on("change", MapController2D.onChangeGeometry.bind(this));
	
	this.drawedLinePointCount = 0;
	this.drawedPolygonPointCount = 0;
}

// on Change Geometry
MapController2D.onChangeGeometry = function(evt) {
	
	var geom = evt.target;
	var output, distance, tooltipCoord = null;
	var currentDrawedPointCount;
	
	switch(this.measureType) {
		case "Polygon":
			output = this.formatArea(geom);
			tooltipCoord = geom.getInteriorPoint().getCoordinates();
			
			this.isDrawingPolygon = true;
			this.isDrawingLine = false;
			
			currentDrawedPointCount = this.sketch.getGeometry().getCoordinates()[0].length;;
			
			// 새로운 점 추가시 중간 지점 값을 표시해주고 해당 지점에 포인트 점을 찍는다.
			if(currentDrawedPointCount > this.drawedPolygonPointCount) {
				var lastCoordinate = geom.getLastCoordinate();
				
				this.createInterimMeasureTooltip(lastCoordinate);
				this.drawedPolygonPointCount = currentDrawedPointCount;
			}
			
			break;
		case "LineString":
			distance = this.getMeasuredDistance(geom);			
			tooltipCoord = geom.getLastCoordinate();	
			
			this.totalMeasuredDistance = distance;
			
			this.isDrawingLine = true;
			this.isDrawingPolygon = false;
			
			if(this.totalMeasuredDistance === 0) {
				output = "start";
			} else {
				// 상대거리를 구한다.
				var differ = (this.totalMeasuredDistance - this.preTotalMeasuredDistance).toFixed(2);
			
				if (differ > 1000) {
		          output = (Math.round(differ / 1000 * 100) / 100) +' ' + 'km';
		        } else {
		          output = (Math.round(differ * 100) / 100) +' ' + 'm';
		        }
			}
			
			// 새로운 점 추가시 중간 지점 값을 표시해주고 해당 지점에 포인트 점을 찍는다.
			currentDrawedPointCount = this.sketch.getGeometry().getCoordinates().length;
			
			if(currentDrawedPointCount > this.drawedLinePointCount) {
				
				var lastCoordinate = tooltipCoord;
				
				this.createInterimMeasureTooltip(tooltipCoord);
				this.drawedLinePointCount = this.sketch.getGeometry().getCoordinates().length;
			}
			break;
		default:
			break;
	}
	
	// measureTooltipElement 없으면 새로 생성하기.
	if(this.measureTooltipElement == null) {
		this.createMeasureTooltip();
	}
	
	this.measureTooltipElement.innerHTML = output;	
	this.measureTooltip.setPosition(tooltipCoord);
	
	// 맨 첫 번째 점에 대한 처리.
	if(this.isMeasured === 0) {
		this.measureTooltipElement.className = "tooltip tooltip-measure";
		this.measureTooltipElement = null;
		
		this.measureTooltip.setOffset([0, -7]);

		this.createMeasureTooltip();
		this.preTotalMeasuredDistance = 0;
		
		this.isMeasured++;
	} else {
		this.tooltipPosition = tooltipCoord;
	}
}

MapController2D.onDrawEnd = function(evt) {
	if(this.isDrawingLine === true) {
		// remove last item
		var overlayers = this.seoul2dmap.ol2dApp.map.getOverlays();
		var lastOverlayIndex = overlayers.getLength() - 1;
		var lastOverlay = overlayers.item(lastOverlayIndex);
		
		this.seoul2dmap.ol2dApp.map.removeOverlay(lastOverlay);
	}
	
	// set style. 다 그리고 나서 스타일 셋팅.
	evt.feature.setStyle(drawEndStyle);
	
	this.isMeasured = 0;
	this.preTotalMeasuredDistance = 0;
	
	this.sketch = null;
	
    this.isDrawingPolygon = false;
    this.isDrawingLine = false;
    
    ol.Observable.unByKey(this.listener);
   
    this.measureTooltipElement = null;		
    this.createMeasureTooltip();
}

// TODO
MapController2D.prototype.clearMeasureInteraction = function() {
	if(this.measureIntercation !== null) {
		this.seoul2dmap.ol2dApp.map.removeInteraction(this.measureIntercation);
	}
	
	this.isDrawingLine = false;
	this.isMeasured = 0;
	this.preTotalMeasuredDistance = 0;
}

// 현재 지도에 그려져있는 내용을 제거 하기
MapController2D.prototype.clearDrawnInteraction = function() {
	if(this.features == null) 
		return;
	
	if(this.features.getLength() > 0) {
		this.features.clear();
	}
	
	this.removeMeasureOvelay();
	this.removeMeasureTooltip();
	
	// 만약에 마커가 남아있다면, 마커 삭제 하기.
	if(this.marker !== null) {
		this.seoul2dmap.ol2dApp.map.removeLayer(this.marker);
		this.marker = null;
	}
	
	this.markerPoint = null;
}

MapController2D.prototype.addMeasureLineInteraction = function() {
	this.addMeasureInteraction("line");
}

MapController2D.prototype.addMeasurePolygonInteraction = function() {
	this.addMeasureInteraction("polygon");
}

//save Image.
MapController2D.prototype.saveImage = function(downloadFileName) {
	this.seoul2dmap.ol2dApp.map.once('postcompose', function(event) {
		saveAsImage(event, downloadFileName);
	});

	this.seoul2dmap.ol2dApp.map.renderSync();
}

// get map Center
MapController2D.prototype.getCenter = function() {
	var view = this.seoul2dmap.ol2dApp.map.getView();
	var center = view.getCenter();
	
	return center;
}

// 지도 활용 기능
MapController2D.prototype.useMapFunction = function(functionID) {
	
	// 초기화
	this.isDrawingPolygon = false;
	this.isDrawingLine = false;
	
	if (functionID !== 5) {
		this.clearDrawnInteraction();
		this.clearMeasureInteraction();
	}

	switch (functionID) {
		case 0:
			this.addMeasureLineInteraction();
			break;
		case 1: // 면적
			this.addMeasurePolygonInteraction();
			break;
		case 99: // 화면 저장
			this.saveImage("download_map.png");
			break;
		case 100: // 취소
			break;
		default:
			break;
	}
}

// 지도 이용하기.
MapController2D.prototype.move = function(coordX, coordY, isConvertWTM, isAddMarker) {
	this.clearDrawnInteraction.call(this);
	
	var wtmPoint;
	
	if(isConvertWTM === true) {
		wtmPoint = mapCommon.transferUTMToWTM([ coordX, coordY ]);
	} else {
		wtmPoint = [ coordX, coordY ];
	}
	
	this.seoul2dmap.ol2dApp.map.getView().setCenter(wtmPoint);
	
	if(isAddMarker === true)
		this.addMarker(wtmPoint);
}

// add marker
MapController2D.prototype.addMarker = function(wtmPoint) {
	if(this.marker !== null) {
		this.seoul2dmap.ol2dApp.map.removeLayer(this.marker);
		this.marker = null;
	}
	
	var markerFeature = new ol.Feature({
		geometry : new ol.geom.Point(wtmPoint)
	});
	markerFeature.setStyle(mapCommon.styles.markerSearch);
	
	var vectorSource = new ol.source.Vector({
		features : [markerFeature]
	});
	
	this.marker = new ol.layer.Vector({
			source : vectorSource
	});
	
	this.seoul2dmap.ol2dApp.map.addLayer(this.marker);
	this.markerPoint = wtmPoint;
}

// get marker point.
MapController2D.prototype.getMarkerPoint = function() {
	return this.markerPoint;
}

// change hybird layer
MapController2D.prototype.changeHybirdLayer = function(layerID, isCheck) {
	switch (layerID) {
		case 0: // naver 하이브리드
			mapCommon.layers.terrainNaverHybrid.setVisible(isCheck);
			break;
		case 1: // naver 하이브리드 - POI
			mapCommon.layers.terrainNaverHybrid_poi.setVisible(isCheck);
			break;			
		case 2: // daum 하이브리드 
			mapCommon.layers.terrainDaumHybrid.setVisible(isCheck);
			break;
		case 3: // Debug Tile
			mapCommon.layers.debug.setVisible(isCheck);
			break;			
		default:
			break;
	}
}

MapController2D.prototype.getMap = function() {
	return this.seoul2dmap.ol2dApp.map;
}

MapController2D.prototype.updateSize = function() {
	var timeOutCallback = function() {
		this.seoul2dmap.ol2dApp.map.updateSize();
	};
	
	setTimeout(timeOutCallback.call(this), 100);
}

// on keyboard interaction
MapController2D.prototype.onKeyboardInteraction = function() {
	this.seoul2dmap.ol2dApp.interactions.KeyboardPan.setActive(true);
	this.seoul2dmap.ol2dApp.interactions.KeyboardZoom.setActive(true);
}

// off keyboard interaction
MapController2D.prototype.offKeyboardInteraction = function() {
	
	var isActivePan = this.seoul2dmap.ol2dApp.interactions.KeyboardPan.getActive();
	if (isActivePan) {
		this.seoul2dmap.ol2dApp.interactions.KeyboardPan.setActive(false);
	}
	
	var isActiveZoom = this.seoul2dmap.ol2dApp.interactions.KeyboardZoom.getActive();
	if (isActiveZoom) {
		this.seoul2dmap.ol2dApp.interactions.KeyboardZoom.setActive(false);
	}
}