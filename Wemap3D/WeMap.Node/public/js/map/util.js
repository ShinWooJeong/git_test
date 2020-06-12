/**
 * 
 */

var myWindow = window;

// 쿠키 설정.
function setCookie(cname, cvalue, exdays) {
	var d = new Date();
	d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
	var expires = "expires=" + d.toUTCString();
	document.cookie = cname + "=" + cvalue + "; " + expires;
}

// 쿠키 가져오기.
function getCookie(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}

function getWindow() {
	return myWindow;
}

function linearFindNearest(arr, target, direction) {
	var n = arr.length;
	if (arr[0] <= target) {
		return 0;
	} else if (target <= arr[n - 1]) {
		return n - 1;
	} else {
		var i;
		if (direction > 0) {
			for (i = 1; i < n; ++i) {
				if (arr[i] < target) {
					return i - 1;
				}
			}
		} else if (direction < 0) {
			for (i = 1; i < n; ++i) {
				if (arr[i] <= target) {
					return i;
				}
			}
		} else {
			for (i = 1; i < n; ++i) {
				if (arr[i] == target) {
					return i;
				} else if (arr[i] < target) {
					if (arr[i - 1] - target < target - arr[i]) {
						return i - 1;
					} else {
						return i;
					}
				}
			}
		}
		return n - 1;
	}
}

// Converts from degrees to radians.
function convertToRadians(degrees) {
  return degrees * Math.PI / 180;
}

// Converts from radians to degrees.
function convertToDegree(radians) {
  return radians * 180 / Math.PI;
}

function saveAsImage(event, downloadFileName) {
	window.saveAs || ( window.saveAs = (window.navigator['msSaveBlob'] !== undefined ? 
			function(b,n){ return window.navigator['msSaveBlob'](b,n); } : false) 
		|| window['webkitSaveAs'] || window['mozSaveAs'] || window['msSaveAs']
		|| (function() {
			window.URL = window.URL || window['webkitURL'];
			  if(!window.URL){
			    return false;
			  }
		  return function(blob,name){
		    var url = window.URL.createObjectURL(blob);
		    
		    // Test for download link support
		    if( "download" in document.createElement("a") ){
		
		      var a = document.createElement("a");
		      a.setAttribute("href", url);
		      a.setAttribute("download", name);
		
		      // Create Click event
		      var clickEvent = document.createEvent ("MouseEvent");
		      clickEvent.initMouseEvent ("click", true, true, window, 0, 
		        clickEvent.screenX, clickEvent.screenY, clickEvent.clientX , clickEvent.clientY, 
		        clickEvent.ctrlKey, clickEvent.altKey , clickEvent.shiftKey, clickEvent.metaKey, 
		        0, null);
		
		      // dispatch click event to simulate download
		      a.dispatchEvent (clickEvent);
		    }
		    else{
		      // fallover, open resource in new tab.
		      window.open(url, "_blank", "");
		    }
		  };
		})() );
		
		var canvas = event.context.canvas;
		
		// First create a dataURL string from the canvas in jpeg format.
		var dataURL = canvas.toDataURL("image/png");
		// Split the dataURL and decode it from ASCII to base-64 binary.
		var binArray = atob(dataURL.split(',')[1]);
		// Create an 8-bit unsigned array
	
		var array = [];
		// Add the unicode numeric value of each element to the new array.
		for (var i = 0; i < binArray.length; i++) {
			array.push(binArray.charCodeAt(i));
		}
		
		var blobObject = new Blob([new Uint8Array(array)], { type: 'image/png' }); 

		
		return window.saveAs(blobObject, downloadFileName);	
}

// getFarForEye
function getFarForEye(eyeZ, cosTilt) {
	var h = Math.max(Math.abs(eyeZ * Math.max(cosTilt, 0.1)), 1);
	return Math.sqrt((2 * 6378137 + h) *h);
}

// get Angle between from and to
function getAngle(from, to) {
	var dx = to[0] - from[0];
	var dy = to[1] - from[1];
	
	var rad = -Math.atan2(dx, dy); // from north clockwise.
	var degree = (rad*180)/Math.PI;
	
	return degree;
}

// Converts from degrees to radians.
function toRadian(degrees) {
  return degrees * Math.PI / 180;
}

// Converts from radians to degrees.
function toDegree(radians) {
  return radians * 180 / Math.PI;
}