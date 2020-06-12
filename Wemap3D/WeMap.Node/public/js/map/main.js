//
var application;
var mapCommon;

var canvas, context;
var wms2DLayerList = [];


// application 셋팅.
function initApplication() {

  initWMSLayerSetting();

	$.getScript( '/js/droneList.json', function( data, textStatus, jqxhr ) {
		
		var droneList = JSON.parse(data);

		if(droneList === undefined || droneList == null | droneList.length === 0) {
			return;
		}

		$("#drone_list").empty();

		for(var i = 0; i < droneList.length; i++) {
			
			var droneItem = droneList[i];
			var name = droneItem.name;
			var position = droneItem.position;
			var createdDate = droneItem.createdDate;

			
			var clonedDroneItem = $("#drone_item").clone();
			clonedDroneItem.attr("id", "drone_item_" + i);
			clonedDroneItem.removeClass("display-none");

			clonedDroneItem.find("#btn_drone_name").text((i+1) + ") " + name);
			clonedDroneItem.find("#btn_drone_name").attr("onclick", "movePosition(" + position[0] +", " + position[1] + ");");

			clonedDroneItem.find("#drone-date").text(createdDate);

			$("#drone_list").append(clonedDroneItem);
		}

	});
}

// create wms layer list from html tag
function initWMSLayerSetting() {
	var list = $("#ul-wms-layer-list").find("li > input");
	// 리스트 생성
	for(var i = 0; i < list.length; i++) {
		var value = $(list[i]).data("layername");
		var order = $(list[i]).data("order");
		
		var layer = {};
		layer.name = value;
		layer.isActive = false;
		
		wms2DLayerList[order] = layer;
	}
}

function movePosition(positionX, positionY) {
	if(positionX === 0 || positionY === 0) {
		alert("입력된 위치정보가 없습니다.");
		return;
	}

	application.move(positionX, positionY, false, false);
}

function getBaseURL() {
	var protocol = window.location.protocol;
	var host = window.location.host;
	
	var baseURL = protocol + "//" + host;
	return baseURL;
}

// 2D-3D
function onChangeHybridLayer(e) {
	var selectedValue = $(e).val();	

	switch(selectedValue) {
		case "naver":
			application.changeHybirdLayer(0, true);
			application.changeHybirdLayer(1, true);
			application.changeHybirdLayer(2, false);
			application.changeHybirdLayer(3, false);
			break;
		case "daum":
			application.changeHybirdLayer(0, false);
			application.changeHybirdLayer(1, false);
			application.changeHybirdLayer(2, true);
			application.changeHybirdLayer(3, false);
			break;
		case "debug":
			application.changeHybirdLayer(0, false);
			application.changeHybirdLayer(1, false);
			application.changeHybirdLayer(2, false);
			application.changeHybirdLayer(3, true);
			break;			
		case "none":
			application.changeHybirdLayer(0, false);
			application.changeHybirdLayer(1, false);
			application.changeHybirdLayer(2, false);
			application.changeHybirdLayer(3, false);			
			break;
		default:
			break;
	}	
}

function onChangeColorMode(e) {
	var selectedValue = $(e).val();	

	switch(selectedValue) {
		case "1":
			mapCommon.layers.terrainDem.getSource().setSepiaOrGray(1);
			mapCommon.layers.terrainDem.getSource().changed();
			break;
		case "2":
			mapCommon.layers.terrainDem.getSource().setSepiaOrGray(2);
			mapCommon.layers.terrainDem.getSource().changed();
			break;
		case "0":
			mapCommon.layers.terrainDem.getSource().setSepiaOrGray(0);
			mapCommon.layers.terrainDem.getSource().changed();
			break;			
		default:
			break;
	}	
}

function onChangeSeoulBuilding(e) {
	var isCheck = $(e).is(":checked");
	mapCommon.layers.building.setVisible(isCheck);
}

function onChangeOldBuilding(e) {
	var isCheck = $(e).is(":checked");
	mapCommon.layers.building_vw.setVisible(isCheck);
}

function onChangeLod1(e) {
	var isCheck = $(e).is(":checked");
	mapCommon.layers.lod1.setVisible(isCheck);
}

function onChangeLod2(e) {
	var isCheck = $(e).is(":checked");
	mapCommon.layers.lod2.setVisible(isCheck);
//	mapCommon.layers.terrainDem.getSource().setSepiaOrGray(isCheck?1:0);	
}

function onChangeLod1_vw(e) {
	var isCheck = $(e).is(":checked");
	mapCommon.layers.lod1_vw.setVisible(isCheck);
}

function onChangeLod2_vw(e) {
	var isCheck = $(e).is(":checked");
	mapCommon.layers.lod2_vw.setVisible(isCheck);
}

function onChangeStructure(e) {
	var isCheck = $(e).is(":checked");
	mapCommon.layers.structure.setVisible(isCheck);	
}

function onChangeLod2_str(e) {
	var isCheck = $(e).is(":checked");
	mapCommon.layers.lod2_str.setVisible(isCheck);
}

function onChangeAsset3d(e) {
	var isCheck = $(e).is(":checked");

	mapCommon.layers.asset3d.setVisible(isCheck);
	mapCommon.layers.asset3d.setVisible(!isCheck);
}

function onChangeSeoulOrtho(e) {
	var isCheck = $(e).is(":checked");
	mapCommon.layers.imagery.setVisible(isCheck);
}

function onChangeOldOrtho(e) {
	var isCheck = $(e).is(":checked");

	mapCommon.layers.imagery_vw.setVisible(isCheck);
}

function onChangeDaumOrtho(e) {
	var isCheck = $(e).is(":checked");

	mapCommon.layers.imagery_daum.setVisible(isCheck);
}

function onChangeNaverOrtho(e) {
	var isCheck = $(e).is(":checked");

	mapCommon.layers.imagery_naver.setVisible(isCheck);
}

function onChangeWMSOrtho(e) {
  var layerName = $(e).data("layername");
  var isCheck = $(e).is(":checked");
  
  var selectedLayers = [];

  wms2DLayerList.forEach(function(item, index) {
    var wmsLayerName = item.name;
    if(wmsLayerName === layerName) {
      item.isActive = isCheck;
    }
  });
  
  updateWMS2DLayer();
}

//
function updateWMS2DLayer() {
	var selectedLayers = getSelectedWMS2DLayers();	
	var layersLength = selectedLayers.length;

	var wmsLayer = mapCommon.layers.terrainWMS;	
	
	if (layersLength === 0) {
		wmsLayer.setVisible(false);
		return;	 
	}
	
	var layerParams = "";
	for (var i = 0; i < layersLength; i++) {
		var selectedLayer = selectedLayers[i];
		layerParams += selectedLayer;
		
		if (i !== layersLength - 1) {
			layerParams += ",";
		}
	}
	
	if (wmsLayer.getVisible() === false) {
		wmsLayer.setVisible(true);
	}
	
	// layer 파라미터 업데이트.
	wmsLayer.getSource().updateParams({
		LAYERS : layerParams
	});
}

// 현재 0 이 아닌 즉, 활성화된 레이어 리스트를 가져온다.
function getSelectedWMS2DLayers () {
	var wms2DLayerLength = wms2DLayerList.length;
	var selectedLayers = [];

	wms2DLayerList.forEach(function(item, index) {
		var wmsLayerName = item.name;
		var isActive = item.isActive;
		
		if(isActive === true) {
			selectedLayers.push(wmsLayerName);
		}
	});
	
	return selectedLayers;
}


// Only 3D
function onClickLookAround(){
	application.toggleLookAround();
}

//경사도 차트 닫기
function closeGoogleChart() {
	if($("#3dmap_options_slop_popup").hasClass("display-none") === false) {
		$("#3dmap_option_slope_popup").addClass("display-none");		
	}
}

// 둘러보기 가시화 셋팅.
function setVisibleTripRoundArea(isVisible) {
	if(isVisible === true) {
		if($("#area-tripRound").hasClass("display-none") === true) {
			$("#area-tripRound").removeClass("display-none");		
		}

	} else {
		if($("#area-tripRound").hasClass("display-none") === false) {
			$("#area-tripRound").addClass("display-none");		
		}

	}
}

// shadow area 가시화 셋팅
function setVisibleShadowArea(isVisible) {
	if(isVisible === true) {
		if($("#area-shadow").hasClass("display-none") === true) {
			$("#area-shadow").removeClass("display-none");		
		}

	} else {
		if($("#area-shadow").hasClass("display-none") === false) {
			$("#area-shadow").addClass("display-none");		
		}

	}
}

// visibility area 가시화 셋팅
function setVisibleVisibilityArea(isVisible) {
	if(isVisible === true) {
		if($("#area-visibility").hasClass("display-none") === true) {
			$("#area-visibility").removeClass("display-none");		
		}

	} else {
		if($("#area-visibility").hasClass("display-none") === false) {
			$("#area-visibility").addClass("display-none");		
		}

	}
}

// model dialog  값 변경하기 - callback으로 넘긴다.
function updateVisibilityAreaUI(position, rotation, tilt, far, fov) {
	var area = $("#area-visibility-body");
	
	if(position[0] !== null && position[1] !== null && position[0] !== null) {
		area.find("#cameraX").val(position[0]);
		area.find("#cameraY").val(position[1]);
		area.find("#cameraZ").val(position[2].toFixed(2));
	}
	
	if(rotation !== null) {
		// this is angle. 180 degree flip looking direction
		area.find("#rotation").val((-rotation).toFixed(0));	
	}
	
	if(tilt !== null) {
		area.find("#tilt").val(toDegree(tilt).toFixed(0));
	}
		
	if(fov !== null) {
		area.find("#fov").val(toDegree(fov).toFixed(0));
	}
}

// Shadow 기능 추가, Shadow 기능 관련한 UI 변경.
function changeScenaryShadowUI(measureDate) {
	var year = measureDate.getFullYear();
	var month = measureDate.getMonth() + 1;
	var date = measureDate.getDate();
	
	var hour = measureDate.getHours();
	var min = parseInt(measureDate.getMinutes());
	
	if(min < 10) {
		min = "0" + min;
	}
	
	// 상단 shadowTimeText 바꾸기
	var measureDateText = year + "년 " + month + "월 " + date + "일 " + hour + ":" + min;
	$("#shadowTimeText").text(measureDateText);
	
	// 데이터 피커 및 슬라이드 값 바꾸기.
	$("#sunDatePicker").datepicker("setDate", measureDate);
	$("#sliderTime").slider({value : (hour * 3600) });				
}

function changeScenaryShadowTextUI(measureDate) {
	var year = measureDate.getFullYear();
	var month = measureDate.getMonth() + 1;
	var date = measureDate.getDate();
	
	var hour = measureDate.getHours();
	var min = parseInt(measureDate.getMinutes());
	
	if(min < 10) {
		min = "0" + min;
	}
	
	// 상단 shadowTimeText 바꾸기
	var measureDateText = year + "년 " + month + "월 " + date + "일 " + hour + ":" + min;
	$("#shadowTimeText").text(measureDateText);
}

function changeScenaryShadow(measureDate) {
	application.changeScenaryShadow(measureDate);
	changeScenaryShadowTextUI(measureDate);
}

/**
 * 
 */


function onKeyDownVisibilityText(event) {
	var keyCode = event.which || event.keyCode;
    switch(keyCode) {
	    case 38:// 위
	    	increaseVisibilityFactor(event);
	    	break;
	    case 40: // 아래     
	    	decreaseVisibilityFactor(event);
	    	break;
	    default:
	    	break;
    }
}

// model dialog  값 변경하기 - callback으로 넘긴다.
// 뒤에 다 ui
function updateVisibilityAreaUI(position, rotation, tilt, far, fov) {
	var area = $("#area-visibility-body");
	
	if(position[0] !== null && position[1] !== null && position[0] !== null) {
		area.find("#cameraX").val(position[0]);
		area.find("#cameraY").val(position[1]);
		area.find("#cameraZ").val(position[2].toFixed(2));
	}
	
	if(rotation !== null) {
		// this is angle. 180 degree flip looking direction
		area.find("#rotation").val((-rotation).toFixed(0));	
	}
	
	if(tilt !== null) {
		area.find("#tilt").val(toDegree(tilt).toFixed(0));
	}
		
	if(fov !== null) {
		area.find("#fov").val(toDegree(fov).toFixed(0));
	}
}

// ok
function increaseVisibilityFactor(event) {	
	var inputName = event.currentTarget.id;
	
	var area = $("#area-visibility-body");
			
	// 현재 이벤트가 발생된 input에서 value를 가져온다.
	var inputText = area.find("#" + inputName);
	var val = inputText.val();
			
	switch(inputName) {
		case "cameraX":
		case "cameraY":
		case "cameraZ":
			val = (parseFloat(val) + 1).toFixed(2);
			inputText.val(val);
			updateVisibilityParamsFromUI();
			break;
		case "rotation":
		case "fov":
		case "tilt":
			val = (parseFloat(val) + 1).toFixed(0);
			if(val >= 360) {
				val = 0;
			}
			
			inputText.val(val);
			updateVisibilityParamsFromUI();
			break;
		default:
			break;
	}
}

// ok
function decreaseVisibilityFactor(event) {	
	var inputName = event.currentTarget.id;
	
	var area = $("#area-visibility-body");
			
	// 현재 이벤트가 발생된 input에서 value를 가져온다.
	var inputText = area.find("#" + inputName);
	var val = inputText.val();
			
	switch(inputName) {
		case "cameraX":
		case "cameraY":
		case "cameraZ":
			val = (parseFloat(val) - 1).toFixed(2);			
			inputText.val(val);
			updateVisibilityParamsFromUI();
			break;
		case "rotation":
		case "fov":
		case "tilt":
			val = (parseFloat(val) - 1).toFixed(0);
			if(val <= -360) {
				val = 0;
			}
			
			inputText.val(val);
			updateVisibilityParamsFromUI();
			break;
		default:
			break;
	}
}

// Parameter 변경하. From UI 부터.
function updateVisibilityParamsFromUI() {
	var area = $("#area-visibility-body");
	
	var cameraX = area.find("#cameraX").val();
	var cameraY = area.find("#cameraY").val();
	var cameraZ = area.find("#cameraZ").val();
	
	var position = [cameraX, cameraY, cameraZ];
	
	var rotation = toRadian(area.find("#rotation").val());
	var tilt = toRadian(area.find("#tilt").val());
	
	var far = toRadian(area.find("#far").val());
	// far 는 현재 높이를 이용해서 재 계산을 한다.
	far = getFarForEye(cameraZ , Math.sin(area.find("#tilt").val()));
	
	var fov = toRadian(area.find("#fov").val());
	
	// 실제 paramter를 적용 시킨다.
	application.updateVisibilityParams(position, rotation, tilt, far, fov);
}

// bind event
$(function() {
	// trip Round area 안에 속도 선택 토글 버튼 총 3개 (느리게, 보통, 빠르게)
	$("#area-toolbar-tripRound button").on("click", function(e) {
		var selectedButton = $(this);
		var isSelected = selectedButton.hasClass("selected");
		
		// 방금  선택된 애가 또 선택 되면 off 시키는 것이다.
		if (isSelected === true) {
			return;
		}
		
		selectedButton.toggleClass("selected");
		selectedButton.parent().siblings().find("button").removeClass("selected");
		
		var id = selectedButton.attr("id");  
		
		switch(id) {
			case "btn-1x":
				application.setTripRoundSpeed(52000);
				break;
			case "btn-2x":
				application.setTripRoundSpeed(36000);
				break;
			case "btn-3x":
				application.setTripRoundSpeed(20000);
				break;
			default:
				break;
		}
	});

	// 일조권 분석 기능에 관해서다.
	var hourLabels = ["0", "", "" , "", "", "6", "", "", "" , "",
	                  "12", "", "", "" , "", "18", "", "", "", "", "24"];
	
	var myHandler =  function(e) {
		var handle = $("#sliderTime").find(".ui-slider-handle");
		if(handle.hasClass("ui-state-focus")) {				
			if(e.which === 37 || e.which === 39 || e.which === 38 || e.which === 40) {
				
				var selectedDate = null;
				var dateValue = $("#sunDatePicker").datepicker("getDate");
				
				if(dateValue === null) {
					dateValue = new Date();	
				}
				
				var timeValue = $("#sliderTime").slider("value");
				
				var hour = timeValue / (60 * 60);
				var min = ((timeValue % (60 * 60))/60);
			
				var measureDate = new Date(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate(), hour, min, 0);
				changeScenaryShadow(measureDate);
			}
		}
	};

	// 태양 슬라이드 선택 시.
	$("#sliderTime").bind({
		slidestart : function() {
			application.offKeyboardInteraction();
			$(document).bind("keyup keydown", myHandler);	
		},
		slidestop : function() {
			application.onKeyboardInteraction();
			$(document).unbind("keyup keydown", myHandler);
		}
	}).slider({
		min : 0,
		max : 86400,
		value : 43200,
		step : 60
	}).slider("pips", {
		rest : "label",
		labels : hourLabels,	
	}).slider({
		change : function(event, ui) {
			var selectedDate = null;
			var dateValue = $("#sunDatePicker").datepicker("getDate");
			
			if(dateValue === null) {
				dateValue = new Date();	
			}
			
			var timeValue = ui.value;
			
			var hour = timeValue / (60 * 60);
			var min = ((timeValue % (60 * 60))/60);
		
			var measureDate = new Date(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate(), hour, min, 0);
			changeScenaryShadow(measureDate);
		}
	});
		
	// 태양 달력 클릭 시.
	$("#sunDatePicker").datepicker({
		showOn: "button",
		buttonImage: "/images/calendar.png",
		buttonImageOnly: true,
		buttonText: "Select date",
		dataFormat : "yy-mm-dd",
		onSelect : function(dateText) {
			var dateValue = new Date(this.value);
			var timeValue = $("#sliderTime").slider("value");
			
			var hour = timeValue / (60 * 60);
			var min = ((timeValue % (60 * 60))/60);

			var measureDate = new Date(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate(), hour, min, 0);
			
			changeScenaryShadow(measureDate);
		}
	});
	
	// 현재 시간으로 초기화한다.
	$("#btn-reset-shadow").on("click", function(e) {
		var now = new Date();
		
		$("#sunDatePicker").datepicker("setDate", now);
		$("#sliderTime").slider({value : (now.getHours() * 3600) });

		changeScenaryShadow(now);
	});
});