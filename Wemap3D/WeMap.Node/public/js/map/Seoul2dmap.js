function Seoul2dmap(target, currentX, currentY, currentZoom) {

  this.target = target;

  this.currentZoom = currentZoom;

  this.ol2dApp = {};
  this.ol2dApp.defaults = {};
  this.ol2dApp.defaults.center = [currentX, currentY];

  this.isActive = false;
}

Seoul2dmap.prototype.create = function () {

  this.isActive = true;

  var controls = [new ol.control.Zoom({ className: "ol-custom-zoom-control-2d" })];

  this.ol2dApp.map = new ol.Map({
    log: false,
    keyboardEventTarget: document,
    controls: controls,
    layers: [
      mapCommon.layers.imagery,
      mapCommon.layers.imagery_vw,
      mapCommon.layers.imagery_daum,
      mapCommon.layers.imagery_naver,
      mapCommon.layers.terrainDaumHybrid,
      mapCommon.layers.terrainNaverHybrid,
      mapCommon.layers.terrainNaverHybrid_poi,
      mapCommon.layers.terrainWMS,
      mapCommon.layers.debug		
    ],

    interactions: [new ol.interaction.DragPan({ kinetic: false }),
    new ol.interaction.MouseWheelZoom(),
    new ol.interaction.KeyboardPan()
    ],
    target: this.target,
    renderer: 'canvas',
    loadTilesWhileInteracting: true,
    loadTilesWhileAnimating: true,
    view: new ol.View({
      projection: projLocal,
      center: [198031, 551873],
      zoom: 9,
      minZoom: 3,
      maxZoom: 12

    })
  });
}

//
Seoul2dmap.prototype.pause = function () {
  this.ol2dApp.map.setTarget(null);
  this.isActive = false;
}

//
Seoul2dmap.prototype.resume = function () {
  if (this.isActive === false) {
    this.ol2dApp.map.setTarget(this.target);
    this.isActive = true;
  }
}

//
Seoul2dmap.prototype.getMap = function () {
  return this.ol2dApp.map;
}

//
Seoul2dmap.prototype.addKeyboardZoomInteraction = function () {
  // up arrow 38
  // down arrow 40
  // ol 기본인 +, - 키보드 이벤트를 shift + up, shift + down 이벤트로 변경한다.
  var keyboardZoomInteraction = new ol.interaction.KeyboardZoom({
    condition: function (e) {
      if (this.isActive === false) {
        return;
      }

      var keyCode = e.originalEvent.keyCode;
      var isPressedCtrlKey = e.originalEvent.ctrlKey;

      switch (keyCode) {
        case 38:
          if (isPressedCtrlKey) {
            var map = e.map;
            var view = map.getView();

            var fromZoom = view.getZoom();
            var toZoom = fromZoom + 1;

            view.setZoom(toZoom);
          }
          return true;
          break;
        case 40:
          if (isPressedCtrlKey) {
            var map = e.map;
            var view = map.getView();

            var fromZoom = view.getZoom();
            var toZoom = fromZoom - 1;

            view.setZoom(toZoom);
          }
          return true;
          break;
        default:
          return false;
          break;
      }
    }
  });
  this.ol2dApp.map.addInteraction(keyboardZoomInteraction);
}

Seoul2dmap.prototype.addOverviewMap = function () {
  // overview map의 회전 각도를 0도로 맞춘다.
  var map = mapCommon.controls.overviewmap.getOverviewMap().getView().setRotation(0);
  this.ol2dApp.map.addControl(mapCommon.controls.overviewmap);
}

Seoul2dmap.prototype.removeOverviewMap = function () {
  this.ol2dApp.map.removeControl(mapCommon.controls.overviewmap);
}