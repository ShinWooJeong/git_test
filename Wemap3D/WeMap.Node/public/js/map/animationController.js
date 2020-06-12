
function AnimationController(container, containerBody, mapController) {
	// HTML
	this.container = $("#" + container);
	this.containerBody = $("#" + containerBody);
	this.animationListView = document.getElementById(containerBody);
	
	// Map Object
	this.mapController = mapController;
	this.mapController3D = mapController.mapController3D;

	// Animation
	this.animations = [];

	// Etc
	this.isSubPlaying = false;
	this.isFixScrollDown = true;
	
	this.playingAnimationIndex = 0;
	this.isVisible = false;
}

// get animation list from animation list view.
AnimationController.prototype.refreshAnimationList  = function() {
	// clear global variable
	this.playingAnimationIndex = -1;
	this.animations.length = 0;
	
	var items = this.animationListView.childNodes;
	for (var i = 0; i < items.length; i++) {
		// dynamically bind event.
		var item = $(items[i]);
		item.find("#btn-delete").attr("onclick", "onDeleteAnimcation(" + i + ")");
		item.find("#img").attr("onclick", "onSelectAnimation(" + i + ")");
		item.find("#img").attr("ondblclick", "onCapureImage(" + i + ")");
		item.find("#easing").attr("onchange", "onChangeEasingFunction(" + i +")");
		item.find("#duration").attr("onchange", "onChangeDuration(" + i + ")");
		item.find("#subPlay").attr("onclick", "onSubPlayAnimation(" + i + ")");
		item.find("#speed").attr("onchange", "onChangeSpeed(" + i + ")");
		item.find("#speed").val("");
		item.find(".progress-bar").attr("id", "progress-bar-" + i);
		item.attr("id", "animation-item-" + i);
		
		// get animation value from ui.
		var animation = this.getAnimationFromUI(i);
		animation.onProgress = function(fraction, completedCount) {
			var playingAnimationIndex = this.playingAnimationIndex;
			
			if(this.isSubPlaying === false) {
				playingAnimationIndex = completedCount + 1;
		
				if(this.playingAnimationIndex !== playingAnimationIndex) {
					this.playingAnimationIndex = playingAnimationIndex;
				}
			}
			
			var progressbar = $("#progress-bar-" + playingAnimationIndex);
			progressbar.css("height", (fraction * 100) + "%");	
		}.bind(this);
		
		// update 동적 bind 된 함수들은 다시 binding 해준다.
		this.animations[i] = animation;
	}
}

// UPDATE Animation with newAnimation
AnimationController.prototype.updateAnimationByID = function(index, newAnimation) {
	var animation = this.animations[index];

	if(newAnimation.center) {
		animation.center = newAnimation.center;
	}

	if(newAnimation.rotation) {
		animation.rotation = newAnimation.rotation;
	}

	if(newAnimation.tilt) {
		animation.tilt = newAnimation.tilt;
	}

	if(newAnimation.range) {
		animation.range = newAnimation.range;
	}

	if(newAnimation.duration) {
		animation.duration = newAnimation.duration;
	}

	if(newAnimation.easing) {
		switch(newAnimation.easing) {
			case "ol.easing.easeIn":
				animation.easing = ol.easing.easeIn;
				animation.easingString = newAnimation.easing;
				break;	
			case "ol.easing.easeOut":
				animation.easing = ol.easing.easeOut;
				animation.easingString = newAnimation.easing;
				break;	
			case "ol.easing.inAndOut":
				animation.easing = ol.easing.inAndOut;
				animation.easingString = newAnimation.easing;
				break;	
			case "ol.easing.linear":
				animation.easing = ol.easing.linear;
				animation.easingString = newAnimation.easing;
				break;	
			case "ol.easing.upAndDown":
				animation.easing = ol.easing.upAndDown;
				animation.easingString = newAnimation.easing;
				break;	
			default:
				break;
		}
	}
}


AnimationController.prototype.updateAnimationFromUI = function(index) {
	this.animations[index] = this.getAnimationFromUI(index);
	this.applyAnimationToMapByID(index);
}

AnimationController.prototype.getAnimationFromUI = function(index) {
	var animation = {};

	var item = $("#animation-item-" + index);	
	var center_x = parseFloat(item.find("#center_x").val());
	var center_y = parseFloat(item.find("#center_y").val());
	var center_z = parseFloat(item.find("#center_z").val());

	animation.center = [center_x, center_y, center_z];
	animation.rotation = parseFloat(toRadian(item.find("#rotation").val()));
	animation.tilt = parseFloat(toRadian(item.find("#tilt").val()));
	animation.range = parseFloat(item.find("#range").val());
	animation.duration = parseInt(item.find("#duration").val());
	animation.name = item.find("#name").val();

	var easingValue = item.find("#easing").val();

	if(easingValue) {
		switch(easingValue) {
			case "ol.easing.easeIn":
				animation.easing = ol.easing.easeIn;
				animation.easingString = easingValue;
				break;	
			case "ol.easing.easeOut":
				animation.easing = ol.easing.easeOut;
				animation.easingString = easingValue;
				break;	
			case "ol.easing.inAndOut":
				animation.easing = ol.easing.inAndOut;
				animation.easingString = easingValue;
				break;	
			case "ol.easing.linear":
				animation.easing = ol.easing.linear;
				animation.easingString = easingValue;
				break;	
			case "ol.easing.upAndDown":
				animation.easing = ol.easing.upAndDown;
				animation.easingString = easingValue;
				break;	
			default:
				break;
		}
	}
	
	return animation;
}

AnimationController.prototype.applyAnimationToMapByID = function(index) {
	var animation = this.animations[index];	

	var view = this.mapController3D.getMap().getView();
	
	view.setCenter([animation.center[0], animation.center[1]], animation.center[2]);
	view.setRotation(animation.rotation);
	view.setTilt(animation.tilt);
	view.setRange(animation.range);
}

AnimationController.prototype.createElement = function(index, animation, isFromFile) {
	var element = $("#animation-item").clone();
	element.removeClass("display-none");
	element.attr("id", "animation-item-" + index);
	element.find("#center_x").val(animation.center[0].toFixed(2));
	element.find("#center_y").val(animation.center[1].toFixed(2));
	element.find("#center_z").val(animation.center[2].toFixed(2));
	element.find("#rotation").val(toDegree(animation.rotation).toFixed(2));
	element.find("#tilt").val(toDegree(animation.tilt).toFixed(2));
	element.find("#range").val(animation.range.toFixed(2));
	element.find("#duration").val(animation.duration.toFixed(0));
	element.find("#name").text((index+1) +" Animation.");

	if(!isFromFile) {
		var target = this.mapController3D.getMap().getTargetElement();
		var canvas = $("#" + target.id).find(".ol-unselectable")[0];
		var dataURL = canvas.toDataURL("image/png");
		element.find("#img")[0].src = dataURL;
	} else {
		element.find("#easing").val(animation.easingString);
	}
	
	element.find("#btn-delete").attr("onclick", "onDeleteAnimcation(" + index + ")");
	element.find("#img").attr("onclick", "onSelectAnimation(" + index + ")");
	element.find("#img").attr("ondblclick", "onCapureImage(" + index + ")");
	element.find("#easing").attr("onchange", "onChangeEasingFunction(" + index +")");
	element.find("#duration").attr("onchange", "onChangeDuration(" + index + ")");
	element.find("#center_x").attr("onkeydown", "onKeydown(this, " + index +")");
	element.find("#center_y").attr("onkeydown", "onKeydown(this, " + index +")");
	element.find("#rotation").attr("onkeydown", "onKeydown(this, " + index +")");
	element.find("#tilt").attr("onkeydown", "onKeydown(this, " + index +")");
	element.find("#range").attr("onkeydown", "onKeydown(this, " + index +")");
	element.find("#subPlay").attr("onclick", "onSubPlayAnimation(" + index + ")");
	element.find("#speed").attr("onchange", "onChangeSpeed(" + index + ")");
	element.find(".progress-bar").attr("id", "progress-bar-" + index);
	
	this.containerBody.append(element);
}

AnimationController.prototype.saveAnimation = function() {
	var view = this.mapController3D.getMap().getView();
	
	var animation = {};
	
	animation.center = view.getCenter3d();
	animation.rotation = view.getRotation();
	animation.range = view.getRange();
	animation.tilt = view.getTilt();
	animation.duration = 3000;
	animation.easing = ol.easing.linear;
	animation.easingString = "ol.easing.linear";
	animation.name = (this.animations.length + 1) + " Animation";	
	animation.onProgress = function(fraction, completedCount) {
		var playingAnimationIndex = this.playingAnimationIndex;
		
		if(this.isSubPlaying === false) {
			playingAnimationIndex = completedCount + 1;
	
			if(this.playingAnimationIndex !== playingAnimationIndex) {
				this.playingAnimationIndex = playingAnimationIndex;
			}
		}
		
		var progressbar = $("#progress-bar-" + playingAnimationIndex);
		progressbar.css("height", (fraction * 100) + "%");	
	}.bind(this);
	
	this.animations.push(animation);
	
	this.createElement((this.animations.length - 1), animation);
	if(this.isFixScrollDown) {
		this.animationListView.scrollTop = this.animationListView.scrollHeight;
	}
}

AnimationController.prototype.toggleAnimation = function() {
	var view = this.mapController3D.getMap().getView();
	view.toggleAnimation();
}

AnimationController.prototype.resetProgress = function() {
	$(".progress-bar").css("height", "0%");
}

AnimationController.prototype.playAnimation = function(subIndex) {
	
	// 새로운 play 전 stopAnimation 후 progress 초기화.
	this.stopAnimation();
	this.resetProgress();
	
	setTimeout(function() {
		// 1. null animation 제거
		var view = this.mapController3D.getMap().getView();

		if(subIndex) {
			if(this.animations[subIndex - 1]) {
				var startAnimation = this.animations[subIndex - 1];
				
				view.setCenter(startAnimation.center);
				view.setRotation(startAnimation.rotation);
				view.setTilt(startAnimation.tilt);
				view.setRange(startAnimation.range);
			}
			
			this.isSubPlaying = true;
			this.playingAnimationIndex = subIndex;
			
			
			if(this.animations[subIndex]) {
				var subAnimations = [this.animations[subIndex]];
				view.animate.apply(view, subAnimations);
			}
		} else {
			// 2. 1번 animation으로 이동
			if(this.animations.length > 0) {
				var startAnimation = this.animations[0];
		
				view.setCenter(startAnimation.center);
				view.setRotation(startAnimation.rotation);
				view.setTilt(startAnimation.tilt);
				view.setRange(startAnimation.range);
			}
			
			this.isSubPlaying = false;
			this.playingAnimationIndex = -1;
			
			//
			if($("#progress-bar-0"))
				$("#progress-bar-0").css("height", "100%");
			
			// 3. animation chain 실행
			if(this.animations.length >1) {	
				view.animate.apply(view, this.animations.slice(1));
			}
		}
		
	}.bind(this), 0);
}

AnimationController.prototype.adjustDurationBySpeed = function(index) {
	var element = $("#animation-item-" + index);
	
	var speedValue = element.find("#speed").val();
	if(speedValue == "") {
		return;
	}
	
	var durationValue = element.find("#duration").val();
	
	if(!this.animations[index - 1]) {
		element.find("#speed").val("");
		return;
	}
	
	var preAnimation = this.animations[index - 1];
	if(preAnimation) {
		var currentAnimation = this.animations[index];
		
		var currentCenter = currentAnimation.center;
		var currentCenter_z = currentAnimation.range;
		
		var preCenter = preAnimation.center;
		var preCenter_z = preAnimation.range;

		var sum =	(currentCenter[0]  - preCenter[0]) * (currentCenter[0] - preCenter[0]) 
		+ (currentCenter[1] - preCenter[1]) * (currentCenter[1] - preCenter[1]) 
		+ (currentCenter_z - preCenter_z) * (currentCenter_z - preCenter_z);
		
		var distance = Math.sqrt(sum);
		var calcDuration = (distance / speedValue) * 1000;
		element.find("#duration").val(calcDuration.toFixed(2));	
		
		var animation = {};
		animation.duration = parseInt(calcDuration);
		this.updateAnimationByID(index, animation);
	}
}

// Export animation to File.
AnimationController.prototype.exportAnimation = function() {
	var liveAnimations = [];
	for(var i = 0; i < this.animations.length; i++) {
		if(this.animations[i] !== undefined && this.animations[i] !== null) {
			//this.animations[i].easing = this.animations[i].easingString;
			liveAnimations.push(this.animations[i]);
		}
	}
	exportToJsonFile(liveAnimations);
}

// Import animation from file.
AnimationController.prototype.importAnimation = function(animationText) {
	
	this.clearAnimation();
	
	var jsonObject = JSON.parse(animationText);

	for(var i = 0; i < jsonObject.length; i++) {
		var animation = jsonObject[i];

		switch(animation.easingString) {
			case "ol.easing.easeIn":
				animation.easing = ol.easing.easeIn;
				break;	
			case "ol.easing.easeOut":
				animation.easing = ol.easing.easeOut;
				break;	
			case "ol.easing.inAndOut":
				animation.easing = ol.easing.inAndOut;
				break;	
			case "ol.easing.linear":
				animation.easing = ol.easing.linear;
				break;	
			case "ol.easing.upAndDown":
				animation.easing = ol.easing.upAndDown;
				break;	
			default:
				break;
		}
		
		animation.onProgress = function(fraction, completedCount) {
			var playingAnimationIndex = this.playingAnimationIndex;
			
			if(this.isSubPlaying === false) {
				playingAnimationIndex = completedCount + 1;
		
				if(this.playingAnimationIndex !== playingAnimationIndex) {
					this.playingAnimationIndex = playingAnimationIndex;
				}
			}
			
			var progressbar = $("#progress-bar-" + playingAnimationIndex);
			progressbar.css("height", (fraction * 100) + "%");	
		}.bind(this);
		
		this.animations.push(animation);
		
		this.createElement(this.animations.length - 1, animation, true);
	}
}

AnimationController.prototype.clearAnimation = function() {
	this.stopAnimation();
	this.animations.length = 0;
	
	this.playingAnimationIndex = -1;
	
	this.containerBody.empty();
}

AnimationController.prototype.stopAnimation = function() {
	var view = this.mapController3D.getMap().getView();
	view.cancelAnimations();
}

AnimationController.prototype.toggleFixScrollDown = function() {
	this.isFixScrollDown = (this.isFixScrollDown === true) ? false : true;
}

AnimationController.prototype.setVisible = function(isVisible) {
	if(isVisible) {
		if(this.container.hasClass("display-none")) {
			this.container.removeClass("display-none");
			
			this.isVisible = true;
		}
	} else {
		
		this.clearAnimation();
		
		if(!this.container.hasClass("display-none")) {
			this.container.addClass("display-none");
			
			this.isVisible = false;
		}
	}
}

AnimationController.prototype.getVisible = function() {
	return this.isVisible;
}

function onSubPlayAnimation(index) {
	animationController.playAnimation(index);
}

function onKeydown(evt, index) {
	var keyCode = event.which || event.keyCode;
	var id = evt.id;

	var element = $("#animation-item-" + index);
	var isUpdate = true;
	
	var textElement = element.find("#" + id);
	
	switch(id) {
		case "center_x":
		case "center_y":
			
			switch(keyCode) {
				case 38:
					var newValue = textElement.val();
					newValue = parseFloat(newValue) + 0.10;
					textElement.val(newValue.toFixed(2));
				case 40:
					var newValue = textElement.val();
					newValue = parseFloat(newValue) + 0.10;
					textElement.val(newValue.toFixed(2));
					break;
				default:
					isUpdate = false;
					break;
			}
			break;
			
		case "rotation":
		case "tilt":
			
			switch(keyCode) {
				case 38:
					var newValue = textElement.val();
					newValue = parseFloat(newValue) + 0.10;
					textElement.val(newValue.toFixed(2));
					break;
				case 40:
					var newValue = textElement.val();
					newValue = newValue - 0.10;
					textElement.val(newValue.toFixed(2));
					break;
				default:
					isUpdate = false;
					break;
			}
			break;
		case "range":
			
			switch(keyCode) {
				case 38:
					var newValue = textElement.val();
					newValue = parseFloat(newValue) + 10.0;
					textElement.val(newValue.toFixed(2));
					break;
				case 40:
					var newValue = textElement.val();
					newValue = parseFloat(newValue) - 10.0;
					textElement.val(newValue.toFixed(2));
					break;
				default:
					isUpdate = false;
					break;
			}
			break;
			
		default:
			isUpdate = false;
			break;
	}

	if(isUpdate) {
		animationController.updateAnimationFromUI(index);
	}
}

function onChangeSpeed(index) {
	animationController.adjustDurationBySpeed(index);
}

//toggle animation
function onToggleAnimation() {
	animationController.toggleAnimation();
}

//save animation
function onSaveAnimation() {
	animationController.saveAnimation();	
}

// play animation
function onPlayAnimation() {
	animationController.playAnimation();
}

function onSubPlayAnimation(index) {
	animationController.playAnimation(index);
}

// 파일 첨쉬
function onChangeAnimationFile(event) {
	var input = event.target;

	var reader = new FileReader();
	reader.onload = function(){
		var text = reader.result;
		animationController.importAnimation(text);
	};
	reader.readAsText(input.files[0]);
};

// remove animation.
function onDeleteAnimcation(index) {
	if(confirm("삭제하시겠습니까?")) {
		animationController.stopAnimation();
		
		var element = $("#animation-item-" + index);
		element.remove();
		
		animationController.refreshAnimationList();
	}
}

// select animation
function onSelectAnimation(index) {
	animationController.applyAnimationToMapByID(index);
}

// on chapture image
function onCapureImage(index) {
	var element = $("#animation-item-" + index);
	var canvas = document.getElementsByClassName("ol-unselectable")[2]; // this is 3d map canvais
	var dataURL = canvas.toDataURL("image/png");
	element.find("#img")[0].src = dataURL;
}

function onChangeEasingFunction(index) {
	var element = $("#animation-item-" + index);
	var selectedValue = element.find("#easing").val();
	
	var animation = {};
	animation.easing = selectedValue;

	animationController.updateAnimationByID(index, animation);
}

function onChangeDuration(index) {
	var element = $("#animation-item-" + index);
	var selectedValue = element.find("#duration").val();
	
	var animation = {};
	animation.duration = parseInt(selectedValue);

	animationController.updateAnimationByID(index, animation);
}

function exportToJsonFile(jsonData) {
	let dataStr = JSON.stringify(jsonData);
	let dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

	let exportFileDefaultName = 'data.json';

	let linkElement = document.createElement('a');
	linkElement.setAttribute('href', dataUri);
	linkElement.setAttribute('download', exportFileDefaultName);
	linkElement.click();
}

function onClearAnimation() {
	animationController.clearAnimation();
}

function onStopAnimation() {
	animationController.stopAnimation();
}

function onExportAnimation() {
	animationController.exportAnimation();
}

function onToggleFixScrollDown() {
	animationController.toggleFixScrollDown();
}