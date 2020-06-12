/**
 * 
 */

// TODO MapControoler3D -> this 로 변경할수있는거 바꾸기.
function MapController3D(target, currentWTMX, currentWTMY) {

  this.target = target;

  this.currentWTMX = currentWTMX;
  this.currentWTMY = currentWTMY;

  this.seoul3dmap = new Seoul3dmap(this.target, this.currentWTMX, this.currentWTMY);
  this.isInitialized = false;

  //
  this.currentActivedInteractions = [];

  this.usableInteractions = [this.seoul3dmap.ol3dApp.interactions.measureLine,
  this.seoul3dmap.ol3dApp.interactions.measureArea,
  this.seoul3dmap.ol3dApp.interactions.measureElev,
  this.seoul3dmap.ol3dApp.interactions.measureProf,
  this.seoul3dmap.ol3dApp.interactions.lookAround,
  this.seoul3dmap.ol3dApp.interactions.tripRound];
  //
  this.isTopView = true;

  this.quality = [];
  this.speed = [];

  //
  this.markerPoint = null
    ;
  //
  this.chart = null;

  //
  this.count = 0;
  this.timmerID = 0;

  this.currentActivedAnalysisInteraction = null;

  //
  this.pickMode = null;

}

MapController3D.prototype.setPickMode = function (pickMode, isSelected) {

  var self = this;
  if (isSelected === true) {

    this.pickMode = pickMode;

    // 각 PickMode에 대한 이벤트 처리.
    this.pointerUpEventKey = self.seoul3dmap.ol3dApp.map.on("click", function (e) {
      var position = self.seoul3dmap.ol3dApp.map.getCoordinate3dFromPixel(e.pixel, false);
      if (position === null) {
        return;
      }
      switch (pickMode) {
        case "visibility":

          var visibilityOptions = null;

          if (self.currentActivedAnalysisInteraction !== "visibility-active") {
            visibilityOptions = self.updateVisibilityParams(null, 10 * Math.PI / 180, 10 * Math.PI / 180, null, 62 * Math.PI / 180);

            // 실제로 Pick 을 해야지 활성화를 시킨다.
            self.seoul3dmap.ol3dApp.map.getView().toggleScenaryAnalysis(2);
            self.currentActivedAnalysisInteraction = "visibility-active";
          } else {
            visibilityOptions = self.updateVisibilityParams(null, 10 * Math.PI / 180, 10 * Math.PI / 180, null, 62 * Math.PI / 180);
          }


          // 가시권이 사용자 쪽을 바라보게한다.
          var eye = self.seoul3dmap.ol3dApp.map.getView().getEye();
          var angle = getAngle(position, eye);

          updateVisibilityAreaUI(position, angle, visibilityOptions.tilt, visibilityOptions.far, visibilityOptions.fov);
          updateVisibilityParamsFromUI();
        default:
          break;
      }
    });
  } else {
    ol.Observable.unByKey(this.pointerUpEventKey);
    this.pointerUpEventKey = null;
    this.pickMode = null;
  }
}

MapController3D.prototype.initializeFake = function () {
  this.seoul3dmap.createFake(this.target);
}

MapController3D.prototype.pause = function () {
  this.seoul3dmap.pause();
}

MapController3D.prototype.resume = function () {
  this.seoul3dmap.resume();
}

MapController3D.prototype.addOverviewMap = function () {
  this.seoul3dmap.addOverviewMap();
}

MapController3D.prototype.closeOverViewMap = function () {
  mapCommon.controls.overviewmap.setCollapsed(true);
}

MapController3D.prototype.removeOverviewMap = function () {
  this.seoul3dmap.removeOverviewMap();
}

MapController3D.prototype.getMarkerPoint = function () {
  return this.markerPoint;
}

// 초기화 함수.
MapController3D.prototype.initialize = function () {

  this.seoul3dmap.create(this.target, this.currentX, this.currentY);

  // viewChangeFinished
  this.seoul3dmap.ol3dApp.interactions.measureProf.setCallback(MapController3D.onMeasureProf.bind(this));

  this.loadGoogleChart();
}

// load google chart
MapController3D.prototype.loadGoogleChart = function () {
  google.charts.load("current", {
    "packages": ["corechart"]
  });
}

// 2D -> 3D, 3D -> 2D 전환
MapController3D.prototype.changeCameraTiltAndRotation = function (toTilt, toRotation, duration) {

  var view3d = this.seoul3dmap.ol3dApp.map.getView();

  if (toTilt != undefined) {
    view3d.animate({
      duration: duration,
      tilt: toRadian(toTilt),
      easing: ol.easing.inAndOut
    }, function (e) {
      console.log('end');
    });
  }

  if (toRotation != undefined) {
    view3d.animate({
      duration: duration,
      rotation: toRadian(toRotation),
      easing: ol.easing.inAndOut
    });
  }
}

// 측정 기능 - 경사도의 콜벡 - private
MapController3D.onMeasureProf = function (coordinates) {

  if (this.usableInteractions[3].getActive() === false) {
    return;
  }

  var coordArray = new Array();
  var coordinateLength = coordinates.length;

  for (var i = 0; i < coordinateLength; i++) {
    coordArray[i] = coordinates[i].z.toFixed(1);
  }

  var loadCallback = this.drawChart(coordinates, coordArray);
  google.charts.setOnLoadCallback(loadCallback);
}

// google chart (경사도) 그리기
MapController3D.prototype.drawChart = function (coordinates, coordArray) {

  var dataTable = new google.visualization.DataTable();
  dataTable.addColumn("string", "");
  dataTable.addColumn("number", "지형 높이");

  var coordArrayLength = coordArray.length;
  for (var i = 0; i < coordArray.length; i++) {
    dataTable.addRow(["", parseFloat(coordArray[i])]);
  }

  var chartOptions = {
    legend: "none",
    width: "600",
    height: "302",
    vAxis: {
      format: "# m",
      minValues: 0,
      textStyle: {
        color: "#FFF"
      }
    },
    hAxis: {
      textPosition: "none"
    },
    backgroundColor: "transparent",
    chartArea: {
      left: "10%",
      bottom: "5%",
      top: "5%",
      width: "90%",
      height: "95%"
    }
    , tooltip: { trigger: 'selection' }
    , pointSize: 1
  };

  var chartElement = document.getElementById("chart_div");
  this.chart = new google.visualization.AreaChart(chartElement);
  this.chart.draw(dataTable, chartOptions);

  google.visualization.events.addListener(this.chart, "onmouseover", MapController3D.onMouseOverInChart.bind(this, coordinates));

  // show slop popup.
  $("#3dmap_option_slope_popup").on("mouseleave", MapController3D.onMouseLeaveInSlopePopup.bind(this));
  $("#3dmap_option_slope_popup").removeClass("display-none");
}

// 경사도 팝업에서 마우스를 떠날 때 - private
MapController3D.onMouseLeaveInSlopePopup = function () {
  // TODO 애니메이션 넣고, 잔상이 시간차로 안지워지는 문제 해결.
  setTimeout(function () {
    context.clearRect(0, 0, canvas.width, canvas.height);
  }, 500);

  if (this.chart !== null)
    this.chart.setSelection([]);
}

// 구글 차트위에서 마우스 오버를 할 때. - rivate
MapController3D.onMouseOverInChart = function (coordinates, e, a) {

  this.chart.setSelection([{ row: e.row, column: e.column }]);

  var container = document.querySelector('#chart_div > div:last-child');
  var circle = container.querySelector('div > svg > g > g:nth-child(3) > g > circle');

  if (circle === null) {
    return;
  }

  //
  if (this.timmerID !== 0) {
    clearInterval(this.timmerID);
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  var slopeDivLeft = $("#3dmap_option_slope_popup").css("left").replace("px", "");
  var slopeDivTop = $("#3dmap_option_slope_popup").css("top").replace("px", "");

  var asideWidth = 0; //$(".aside").width();
  var headerHeight = $(".top-menu").height();
  var chartHeaderHeight = $(".area-chart-header").height();


  var leftMargin = slopeDivLeft - asideWidth;
  var topMargin = (slopeDivTop - headerHeight) + chartHeaderHeight;

  // TODO 이 숫자 상대적인 위치. 하드 코딩 수정하기.
  var cx = circle.cx.baseVal.value + leftMargin; // ( left - 좌측 너비 ) 
  var cy = circle.cy.baseVal.value + 142; // ( top - 높이 + 경사도 헤더)

  var coordinate = coordinates[e.row];
  var pixel = this.seoul3dmap.ol3dApp.map.getPixelFromCoordinate([coordinate.x, coordinate.y, coordinate.z]);

  var mapClientX = pixel[0];
  var mapClientY = pixel[1];

  context.strokeStyle = "rgba(211, 231, 0, 0.7)";
  context.lineWidth = 1;
  context.fillStyle = "rgba(173, 0, 0, 0.7)";

  context.clearRect(0, 0, canvas.width, canvas.height);

  context.beginPath();
  context.arc(cx, cy, 2, 0, Math.PI * 2, true);
  context.fill();

  context.arc(mapClientX, mapClientY, 2, 0, Math.PI * 2, true);
  context.fill();

  //
  var xCoordArray = [];
  var yCoordArray = [];

  for (var i = 0; i <= 10; i++) {
    xCoordArray[i] = cx + (((mapClientX - cx) / 10.0) * (i));
    yCoordArray[i] = cy + (((mapClientY - cy) / 10.0) * (i));
  }


  var animateDrawLine = this.animateDrawLine.bind(this, context, xCoordArray, yCoordArray);

  this.count = 0;
  this.timmerID = setInterval(animateDrawLine, 50);
}

//
MapController3D.prototype.animateDrawLine = function (context, xCoordArray, yCoordArray) {

  var arrayLength = xCoordArray.length;

  if (this.count === arrayLength - 1) {
    clearInterval(this.timmerID);
  }

  context.beginPath();

  context.moveTo(xCoordArray[this.count], yCoordArray[this.count]);
  context.lineTo(xCoordArray[this.count + 1], yCoordArray[this.count + 1]);

  context.stroke();

  this.count++;
}

// 측정 기능 모두 제거 하기
MapController3D.prototype.clearMeasureInteraction = function () {

  if (this.currentActivedInteractions === undefined) {
    return;
  }

  var currentActivedInteractionLength = this.currentActivedInteractions.length;
  if (currentActivedInteractionLength == 0) {
    return;
  }

  for (var i = 0; i < currentActivedInteractionLength; i++) {
    this.currentActivedInteractions[i].setActive(false);
  }

  this.currentActivedInteractions.length = 0;

  // 만약 현재 3D 지도 측정 기능인 3D 경사도 팝업이 열려있으면 닫는다.
  closeGoogleChart();

  // 만약 둘러보기가 켜져있으면 닫는다. 
  // TODO 이걸 위 조건문에 넣어야 한다. 

  setVisibleTripRoundArea(false);
}

// 현재 지도에 그려져있는 내용을 제거 하기
MapController3D.prototype.clearDrawnInteraction = function () {
  this.markerPoint = null;
  this.seoul3dmap.ol3dApp.map.clearInteractionSketch(true, true);
}

// TODO DELTE.
MapController3D.prototype.getCenter = function () {
  var view = this.seoul3dmap.ol3dApp.map.getView();
  var center = view.getCenter();

  return center;
}

MapController3D.prototype.clearAnalysisInteraction = function () {

  if (this.currentActivedAnalysisInteraction == null) {
    //console.log("clearAnalysisInteraction - this.currentActivedAnalysisInteraction  is null.");
  } else {

    switch (this.currentActivedAnalysisInteraction) {
      case "shadow":
        //console.log("toggle shadow interaction");
        this.seoul3dmap.ol3dApp.map.getView().toggleScenaryAnalysis(1);
        this.currentActivedAnalysisInteraction = null;
        setVisibleShadowArea(false);
        break;
      case "visibility-ready":
        setVisibleVisibilityArea(false);
        this.currentActivedAnalysisInteraction = null;
        this.setPickMode("visibility", false);
        break;
      case "visibility-active":
        //console.log("toggle visibility interaction");
        this.seoul3dmap.ol3dApp.map.getView().toggleScenaryAnalysis(2);
        this.currentActivedAnalysisInteraction = null;
        setVisibleVisibilityArea(false);

        //
        this.setPickMode("visibility", false);
        break;
      default:
        break;
    }
  }

}

// rotation values * -1 
MapController3D.prototype.updateVisibilityParams = function (position, rotation, tilt, far, fov) {
  return this.seoul3dmap.ol3dApp.map.getView().setScenaryVisibility({ origin: position, rotation: -rotation, tilt: tilt, far: far, fov: fov });
}


// useMapFunction, 맵 활용 기능.
MapController3D.prototype.useMapFunction = function (functionID) {

  if (functionID !== 99) {
    this.clearDrawnInteraction();
    this.clearMeasureInteraction();
    this.clearAnalysisInteraction();
  }

  switch (functionID) {
    case 0:
    case 1: // 면적
    case 2: // 표고
    case 3: // 경사도
      this.usableInteractions[functionID].setActive(true);
      this.currentActivedInteractions.push(this.usableInteractions[functionID]);
      break;
    case 4: // 경관
      this.usableInteractions[functionID].setActive(!this.seoul3dmap.ol3dApp.interactions.lookAround.getActive());

      if (this.usableInteractions[functionID].getActive() === true) {

        this.currentActivedInteractions.push(this.usableInteractions[functionID]);
      }
      break;
    case 5: // 둘러보기

      this.usableInteractions[functionID].setActive(!this.seoul3dmap.ol3dApp.interactions.tripRound.getActive());
      this.currentActivedInteractions.push(this.usableInteractions[functionID]);

      if (this.usableInteractions[functionID].getActive() === true) {
        setVisibleTripRoundArea(true);
        this.currentActivedInteractions.push(this.usableInteractions[functionID]);
      }

      break;
    case 11: // 그림자
      if (this.currentActivedAnalysisInteraction !== "shadow") {
        //console.log("this.currentActivedAnalysisInteraction is not shadow.");

        setVisibleShadowArea(true);

        var now = new Date();
        this.changeScenaryShadow(now);
        changeScenaryShadowUI(now);

        this.seoul3dmap.ol3dApp.map.getView().toggleScenaryAnalysis(1);
        this.currentActivedAnalysisInteraction = "shadow";
      }

      break;
    case 12: // 가시권

      if (this.currentActivedAnalysisInteraction !== "visibility-ready") {
        setVisibleVisibilityArea(true);
        this.setPickMode("visibility", true);

        this.currentActivedAnalysisInteraction = "visibility-ready";
      }
      break;
    case 99: // 화면 저장
      this.seoul3dmap.ol3dApp.map.saveImage("download_map.png");
      break;
    case 100: // 취소
      break;
    default:
      break;
  }
}

MapController3D.prototype.changeScenaryShadow = function (sunDate) {
  this.seoul3dmap.ol3dApp.map.getView().setScenaryShadow({ sunDate: sunDate.valueOf() });
}


MapController3D.prototype.addMarker = function (wtmPoint) {
  this.seoul3dmap.ol3dApp.map.addMarker(wtmPoint, mapCommon.styles.markerSearch);
  this.markerPoint = wtmPoint;
}

// 지도 이동하기.
MapController3D.prototype.move = function (coordX, coordY, isConvertWTM, isAddMarker) {

  this.clearDrawnInteraction();

  var wtmPoint;

  if (isConvertWTM === true) {
    wtmPoint = mapCommon.transferUTMToWTM([coordX, coordY]);
  } else {
    wtmPoint = [coordX, coordY];
  }

  this.seoul3dmap.ol3dApp.map.getView().setCenter(wtmPoint);

  // 기울임 각도 초기화.
  this.seoul3dmap.ol3dApp.map.getView().setTilt(convertToRadians(50));

  // 회전 시 고정 시킨다. 3d 회전 시 그냥 이동만 하면, 화면이 돌아가 있어서 어색하다.
  var currentRotation = convertToDegree(this.seoul3dmap.ol3dApp.map.getView().getRotation());

  if (currentRotation !== 0) {
    var toDegree = convertToRadians(currentRotation - (currentRotation % 360));
    this.seoul3dmap.ol3dApp.map.getView().setRotation(toDegree);
  }

  // marker
  if (isAddMarker === true)
    this.advanceAddMarker(wtmPoint, isAddMarker);
}

// change hybird layer
MapController3D.prototype.changeHybirdLayer = function (layerID, isCheck) {
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

MapController3D.prototype.getMap = function () {
  return this.seoul3dmap.ol3dApp.map;
}

// 화면 갱신 하기.
MapController3D.prototype.updateSize = function () {
  var timeOutCallback = function () {
    this.seoul3dmap.ol3dApp.map.updateSize();
  };
  setTimeout(timeOutCallback.call(this), 100);
}

// on keyboard interaction
MapController3D.prototype.onKeyboardInteraction = function () {
  this.seoul3dmap.ol3dApp.interactions.Keyborad.setActive(true);
}

// off keyboard interaction
MapController3D.prototype.offKeyboardInteraction = function () {
  var isActive = this.seoul3dmap.ol3dApp.interactions.Keyborad.getActive();

  if (isActive) {
    this.seoul3dmap.ol3dApp.interactions.Keyborad.setActive(false);
  }
}