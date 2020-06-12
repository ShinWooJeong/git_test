//document.write("<script src='js/map/main.js'></script>");

var isMobile = (/mobile|tablet|ip(ad|hone|od)|android/i).test(navigator.userAgent);

proj4.defs('EPSG:5179', '+ellps=GRS80 +proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=1000000 +y_0=2000000 +units=m +no_defs');
proj4.defs('EPSG:5181', '+ellps=GRS80 +proj=tmerc +lat_0=38 +lon_0=127   +k=1      +x_0=200000  +y_0=500000  +units=m +no_defs');
proj4.defs('urn:ogc:def:crs:EPSG:5186', '+ellps=GRS80 +proj=tmerc +lat_0=38 +lon_0=127   +k=1      +x_0=200000  +y_0=600000  +units=m +no_defs');
proj4.defs('EPSG:5187' ,'+ellps=GRS80  +proj=tmerc +lat_0=38 +lon_0=129   +k=1      +x_0=200000  +y_0=600000  +units=m +no_defs');
proj4.defs('EPSG:KATEC','+ellps=bessel +proj=tmerc +lat_0=38 +lon_0=128   +k=0.9999 +x_0=400000  +y_0=600000  +units=m +no_defs +towgs84=-115.80,474.99,674.11,1.16,-2.31,-1.63,6.43');
proj4.defs('EPSG:4326' ,'+ellps=WGS84  +proj=longlat +datum=WGS84 +no_defs');
proj4.defs("EPSG:3857","+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs");
proj4.defs('EPSG:32652' ,'+proj=utm +zone=52 +ellps=WGS84 +datum=WGS84 +units=m +no_defs');

// TODO
// 기존 코드 2D 중심.
var projLocal = ol.proj.get('urn:ogc:def:crs:EPSG:5186');
projLocal.setExtent([153468, 513944, 219004, 579480]);
projLocal.setDefaultTileGrid(new ol.tilegrid.TileGrid({
  origin: [153468, 513944],
  extent: [153468, 513944, 219004, 579480],
  resolutions: [256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5, 0.25, 0.125, 0.0625],
  tileSize: [256, 256]
}));

var projDaum = ol.proj.get('EPSG:5181');
projDaum.setExtent([-30000, -60000, 1018576, 988576]);
projDaum.setDefaultTileGrid(new ol.tilegrid.TileGrid({
  origin: [-30000, -60000],
  extent: projDaum.getExtent(),
  resolutions: [2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5, 0.25],
  minZoom: 2,  
  tileSize: [256, 256]
}));

/* var projNaver = ol.proj.get('EPSG:5179');
projNaver.setExtent([90112, 1192896, 1138688, 2241472]);
projNaver.setDefaultTileGrid(new ol.tilegrid.TileGrid({
  origin: [90112, 1192896],//1192896 2241472
  extent: projNaver.getExtent(),
  resolutions: [4096, 2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5, 0.25],
  //resolutions: [2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5, 0.25, 0.125],
  minZoom: 3,
  maxZoom: 13,
  tileSize: [256, 256]
})); */

var projNaver = ol.proj.get('EPSG:3857');
//projNaver.setExtent([-20037508.3427892, -20037508.3427892, 20037508.3427892, 20037508.3427892]);
/* projNaver.setDefaultTileGrid(new ol.tilegrid.TileGrid({
  //origin: [0, 0],
  origin: [-20037508.3427892, -20037508.3427892],
  extent: projNaver.getExtent(),
  //resolutions: [4096, 2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5, 0.25],
  resolutions: [156543.0339, 78271.51697, 39135.75849, 19567.87924, 9783.939622, 4891.969811, 2445.984905, 1222.992453, 611.4962264, 305.7481132, 152.8740566, 76.4370283, 38.21851415, 19.10925707, 9.554628537, 4.777314268, 2.388657134, 1.194328567, 0.597164284, 0.298582142, 0.149291071, 0.074645535],
  minZoom: 7,
  maxZoom: 21,
  tileSize: [256, 256]
})); */
/* projNaver.setDefaultTileGrid(new ol.tilegrid.TileGrid.XYZ({
  maxZoom: 21
})); */


var poiTileGrid = new ol.tilegrid.TileGrid({
  origin: [153468, 513944],
  extent: [153468, 513944, 219004, 579480],
  resolutions: [256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5, 0.25],
  tileSize: [256, 256],
  minZoom: 0,
  maxZoom: 10
});


var rotateImage = new Image();
/* rotateImage.src = 'data:image/png;base64,'
  + 'iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAA7EAAAOxAGVKw4bAAAC8klEQVRIiY3WW29WVRAG4Gc2X1VsKwWDloakScUqieEQ0MQTeIiJJqJX/BEu/Qkm/A8Tb4yJp8QjBhMNCEEOEdSoCMWmArWlAm0ZL9YqLV++XVjJTvZea+add2bNu9YO9zAycwibMHCZvkFu9nENExFxdTXfuAvwdmzHIKZnmRs4eHDcvn0XFsfHcw3rMIsTEXHsngNk5jDeQB+O4FxEzEDyLj4IvsvMQTyO3VjAxxFxaTXSMnM8Mw9k5iuZ2bljjbHk2+SdLp9OtT+QmU+uXOt0GY7iLXwWET/1iL8H92N3sj64AhGxgC8z82+8mZk/R0RCswK8v4J/1Qs8S7lewDwexdPdNhFxCp9j79JcU8E3VHYTEXG0B3PYii1KrRu81MsoIo5jZ2Y+vDKD5/AYvmgBVwk8UJIxjx1ZWrfX+BXPQlM3crSyv9LLOnmwkpivU7cwVOd6jSMYzcy+BiO4id9WYb8Dm+v7YH0a7MnerX6pYo402ICrmGxh3+BtDJdP79VnHi/iqW6fiLhVMTd00I/riiJ7jQaHcAK/BN/XwIcUkV1v8fsP/Z2Wxdvj/czcxNQN5tbRmWEjHKVvmotrmRPtJ05HObRGMIDpboP9ZUPH8AxuYAZ28ZCydq4Fey0uNIoah/BIL6uqyB+Uml5XlHyfsgenI+J8t09mNhXzcoML1WGsNU/+UJqgwWJlnjjZYj9cMS829Rw5j5HMXN+SxQLOWBZmo5TzbEuAXfgrIuaXHA4rOnh5lSxOK50RWIOzEXGtxXZLxSyMIuIffIPNmbmzJYtJ/Kk0xgJO9bLLzG04HhFTtwNUgFl8iFczc2sLs5PVZ1LZl27wJ/Aavl6au0MHEfF7Zn6E1zNzIw5HxOIKk7P4F2fqviwBr8HzSu0/XboLaL8yNylXZoMflXrP1rW9OBURU5k5oKh5l9JZn0TExB2kW0ohM0M55LZZFuGM0n6LipCGFKGewLGVzO8aoCvYevW3RbnZblr+bel5xC+N/wFYZRmTpx8usQAAAABJRU5ErkJggg==';
 */
rotateImage.src='data:image/png;base64,'
  + 'iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAA7EAAAOxAGVKw4bAAAC8klEQVRIiY3WW29WVRAG4Gc2X1VsKwWDloakScUqieEQ0MQTeIiJJqJX/BEu/Qkm/A8Tb4yJp8QjBhMNCEEOEdSoCMWmArWlAm0ZL9YqLV++XVjJTvZea+add2bNu9YO9zAycwibMHCZvkFu9nENExFxdTXfuAvwdmzHIKZnmRs4eHDcvn0XFsfHcw3rMIsTEXHsngNk5jDeQB+O4FxEzEDyLj4IvsvMQTyO3VjAxxFxaTXSMnM8Mw9k5iuZ2bljjbHk2+SdLp9OtT+QmU+uXOt0GY7iLXwWET/1iL8H92N3sj64AhGxgC8z82+8mZk/R0RCswK8v4J/1Qs8S7lewDwexdPdNhFxCp9j79JcU8E3VHYTEXG0B3PYii1KrRu81MsoIo5jZ2Y+vDKD5/AYvmgBVwk8UJIxjx1ZWrfX+BXPQlM3crSyv9LLOnmwkpivU7cwVOd6jSMYzcy+BiO4id9WYb8Dm+v7YH0a7MnerX6pYo402ICrmGxh3+BtDJdP79VnHi/iqW6fiLhVMTd00I/riiJ7jQaHcAK/BN/XwIcUkV1v8fsP/Z2Wxdvj/czcxNQN5tbRmWEjHKVvmotrmRPtJ05HObRGMIDpboP9ZUPH8AxuYAZ28ZCydq4Fey0uNIoah/BIL6uqyB+Uml5XlHyfsgenI+J8t09mNhXzcoML1WGsNU/+UJqgwWJlnjjZYj9cMS829Rw5j5HMXN+SxQLOWBZmo5TzbEuAXfgrIuaXHA4rOnh5lSxOK50RWIOzEXGtxXZLxSyMIuIffIPNmbmzJYtJ/Kk0xgJO9bLLzG04HhFTtwNUgFl8iFczc2sLs5PVZ1LZl27wJ/Aavl6au0MHEfF7Zn6E1zNzIw5HxOIKk7P4F2fqviwBr8HzSu0/XboLaL8yNylXZoMflXrP1rW9OBURU5k5oKh5l9JZn0TExB2kW0ohM0M55LZZFuGM0n6LipCGFKGewLGVzO8aoCvYevW3RbnZblr+bel5xC+N/wFYZRmTpx8usQAAAABJRU5ErkJggg==';
 
 

var pointStyle = new ol.style.Style({
  image: new ol.style.Circle({
    radius: 5,
    stroke: new ol.style.Stroke({
      color: 'rgba(0, 0, 0, 0.7)'
    }),
    fill: new ol.style.Fill({
      color: 'rgba(255, 255, 0, 0.8)'
    })
  })
});


var drawStartStyle = new ol.style.Style({
  fill: new ol.style.Fill({
    color: 'rgba(255, 255, 255, 0.5)',
    width: 5
  }),
  stroke: new ol.style.Stroke({
    color: 'rgba(255, 0, 0, 0.5)',
    lineDash: [10, 10],
    width: 5
  })
});

var drawEndStyle = new ol.style.Style({
  fill: new ol.style.Fill({
    color: 'rgba(255, 255, 255, 0.5)',
    width: 6
  }),
  stroke: new ol.style.Stroke({
    color: 'rgba(255, 0, 0, 0.5)',
    width: 6,
  }),
});

// map 공통
function MapCommon() {
  this.layers = {};
  this.controls = {};

  this.controls.overviewmap = new ol.control.OverviewMap({
    className: 'ol-overviewmap ol-custom-overviewmap',
    layers:
     [new ol.layer.Tile({
      visible: true,
      opacity: 1.0,
      preload: 0,
      source: new ol.source.XYZ({
        reprojectionErrorThreshold: 256,
        crossOrigin: 'anonymous',
        cacheSize: 32,
         projection: projNaver,
        tileUrlFunction: function (tileCoord, pixelRatio, projection) {
          if (!tileCoord) { return undefined; }
          //return ('https://map.pstatic.net/nrb/styles/basic/1582182342/{z}/{x}/{y}.png?mt=bg.ol.sw')
          return ('https://map.pstatic.net/nrb/styles/basic/1587637016/{z}/{x}/{y}@2x.jpg')
          //return ('https://map.pstatic.net/nrb/styles/basic/1582182342/{z}/{x}/{y}.jpg')
            //.replace('{s}', (tileCoord[1] % 4 + 1))
           .replace('{z}', tileCoord[0])
           //.replace('{y}', (1 << tileCoord[0]) + tileCoord[2] + 1)
           .replace('{y}', - tileCoord[2] - 1)
           .replace('{x}', tileCoord[1]);
        }
/*         projection: projDaum,
        tileUrlFunction: function (tileCoord, pixelRatio, projection) {
          if (!tileCoord) { return undefined; }
          return ('/MAPPIPE/http://map{d}.daumcdn.net/map_2d/1912uow/L{z}/{-y}/{x}.png')
            .replace('{d}', 0)
            .replace('{z}', 14 - tileCoord[0])
            .replace('{x}', (1 << tileCoord[0]) + tileCoord[1])
            //.replace('{-y}', tileCoord[2]);
            .replace('{-y}', (2 << tileCoord[0]) + tileCoord[2])
        }
 */      })
    })] 
    , view: new ol.View({
      projection: projLocal,
      /* maxZoom: 5,
      minZoom: 5,
      zoom: 5, */
      rotation: 0
    }),
    collapseLabel: undefined,
    label: undefined,
    collapsed: false
  });

  this.styles = {};

  // dem 
  this.layers.terrainDem = new ol.layer.Tile({
    visible: true,
    preload: isMobile ? 1 : 1,
    source: new ol.source.Terrain3dTile({
      //attributions : attrbSeoul,
      modelClass: ol.model3d.EpolarTerrain,
      keepCacheZoom: 5,
      sepiaOrGray : 0,
      startupPreload: 3, // 4^3 = 64
      crossOrigin: 'anonymous',
      cacheSize: 512,
      projection: projLocal,
      tileGrid: new ol.tilegrid.TileGrid({
        origin: [153468, 513944],
        extent: [153468, 513944, 219004, 579480],
//        resolutions: [1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1],//, 0.5, 0.25],
        resolutions: [1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5, 0.25],
//        resolutions: [10485.760,5242.880,2621.440,1310.720,655.360,327.680,163.840,81.920,40.960,20.480,10.240,5.120,2.560,1.280,0.64,0.32],
        tileSize: [64, 64]
      }),
      tileUrlFunction: function (tileCoord, pixelRatio, projection) {
        if (!tileCoord) { return undefined; }
        return ('tile.sqlite/dem/{z}/{x}/{-y}.wgl')
          //return ('http://192.168.0.{ip}:3006/tile.sqlite/terrain_vw/{z}/{x}/{-y}.wgl')
          .replace('{z}', tileCoord[0])
          .replace('{-y}', tileCoord[2])
          .replace('{x}', tileCoord[1])
          .replace('{ip}', (tileCoord[1] % 2) ? '21' : '21');
      }
    })
  });
  
  // Terrain-Texture
  this.layers.imagery = new ol.layer.Tile({
    visible: true,
    opacity: 1.0,
    preload: isMobile ? 1 : 1,
    source: new ol.source.XYZ({
      crossOrigin: 'anonymous',
      cacheSize: 10,
      projection: projLocal,
//      tileGrid    : gridLocal,
       tileGrid: new ol.tilegrid.TileGrid({
        origin: [153468, 513944],
        extent: [153468, 513944, 219004, 579480],
        resolutions: [256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5, 0.25, 0.125],
        tileSize: [256, 256]
      }),
      tileUrlFunction: function (tileCoord, pixelRatio, projection) {
        if (!tileCoord) { return undefined; }
        return ('tile.sqlite/imagery/{z}/{x}/{-y}.jpg')
          .replace('{z}', tileCoord[0])
          .replace('{-y}', tileCoord[2])
          .replace('{x}', tileCoord[1])
      }
    }),
    operation: function(pixels, data) {
      var hcl = rgb2hcl(pixels[0]);
  
      var h = hcl[0] + Math.PI * data.hue / 180;
      if (h < 0) {
        h += twoPi;
      } else if (h > twoPi) {
        h -= twoPi;
      }
      hcl[0] = h;
  
      hcl[1] *= (data.chroma / 100);
      hcl[2] *= (data.lightness / 100);
  
      return hcl2rgb(hcl);
    },
    lib: {
      rgb2hcl: rgb2hcl,
      hcl2rgb: hcl2rgb,
      rgb2xyz: rgb2xyz,
      lab2xyz: lab2xyz,
      xyz2lab: xyz2lab,
      xyz2rgb: xyz2rgb,
      Xn: Xn,
      Yn: Yn,
      Zn: Zn,
      t0: t0,
      t1: t1,
      t2: t2,
      t3: t3,
      twoPi: twoPi
    }
  });
  
  
  // Terrain-Texture V-World
  this.layers.imagery_vw = new ol.layer.Tile({
    visible: false,
    preload: isMobile ? 1 : 1,
    source: new ol.source.XYZ({
      crossOrigin: 'anonymous',
      cacheSize: 10,
      projection: projLocal,
//      tileGrid    : gridLocal,
       tileGrid: new ol.tilegrid.TileGrid({
        origin: [153468, 513944],
        extent: [153468, 513944, 219004, 579480],
        resolutions: [256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5, 0.25, 0.125],
        tileSize: [256, 256]
      }),
      tileUrlFunction: function (tileCoord, pixelRatio, projection) {
        if (!tileCoord) { return undefined; }
        return ('tile.sqlite/imagery_vw/{z}/{x}/{-y}.jpg')
          .replace('{z}', tileCoord[0])
          .replace('{-y}', tileCoord[2])
          .replace('{x}', tileCoord[1])
      }
    })
  });
  

  //Building 
  this.layers.building = new ol.layer.Tile({
    visible: true,
    preload: isMobile ? 1 : 4,
    source: new ol.source.Model3dTile({
      modelClass: ol.model3d.EpolarBuilding,
      keepCacheZoom: 3,
      startupPreload: 0,
      crossOrigin: 'anonymous',
      cacheSize: isMobile ? 128 : 512,
      projection: projLocal,
      tileGrid: new ol.tilegrid.TileGrid({
        origin: [153468, 513944],
        extent: [153468, 513944, 219004, 579480],
        resolutions: [256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5, 0.25],
        tileSize: [256, 256],
        minZoom: 5
      }),
      tileUrlFunction: function (tileCoord, pixelRatio, projection) {
        if (!tileCoord) { return undefined; }
        return ('tile.sqlite/building/{z}/{x}/{-y}.{ext}')
          .replace('{z}', tileCoord[0])
          .replace('{-y}', tileCoord[2])
          .replace('{x}', tileCoord[1])
      }
    })
  });

  //Building V-World
  this.layers.building_vw = new ol.layer.Tile({
    visible: false,
    preload: isMobile ? 1 : 4,
    source: new ol.source.Model3dTile({
      modelClass: ol.model3d.EpolarBuilding,
      keepCacheZoom: 3,
      startupPreload: 0,
      crossOrigin: 'anonymous',
      cacheSize: isMobile ? 128 : 512,
      projection: projLocal,
      tileGrid: new ol.tilegrid.TileGrid({
        origin: [153468, 513944],
        extent: [153468, 513944, 219004, 579480],
        resolutions: [256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5, 0.25],
        tileSize: [256, 256],
        minZoom: 5
      }),
      tileUrlFunction: function (tileCoord, pixelRatio, projection) {
        if (!tileCoord) { return undefined; }
        return ('tile.sqlite/building_vw/{z}/{x}/{-y}.{ext}')
          .replace('{z}', tileCoord[0])
          .replace('{-y}', tileCoord[2])
          .replace('{x}', tileCoord[1])
      }
    })
  });
 

  //LOD1 
  this.layers.lod1 = new ol.layer.Tile({
    visible: false,
    opacity: 0.8,
    preload: isMobile ? 1 : 4,
    source: new ol.source.Model3dTile({
      modelClass: ol.model3d.OutlineMesh,
      keepCacheZoom: 3,
      startupPreload: 0,
      crossOrigin: 'anonymous',
      cacheSize: isMobile ? 128 : 512,
      projection: projLocal,
      tileGrid: new ol.tilegrid.TileGrid({
        origin: [153468, 513944],
        extent: [153468, 513944, 219004, 579480],
        resolutions: [256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5, 0.25],
        tileSize: [256, 256],
        minZoom: 5
      }),
      tileUrlFunction: function (tileCoord, pixelRatio, projection) {
        if (!tileCoord) { return undefined; }
        return ('tile.sqlite/lod1/{z}/{x}/{-y}.{ext}')
          .replace('{z}', tileCoord[0])
          .replace('{-y}', tileCoord[2])
          .replace('{x}', tileCoord[1])
      }
    })
  });
  
  //LOD2 
  this.layers.lod2 = new ol.layer.Tile({
    visible: false,
    opacity: 0.8,
    preload: isMobile ? 1 : 4,
    source: new ol.source.Model3dTile({
      modelClass: ol.model3d.OutlineMesh,
      keepCacheZoom: 3,
      startupPreload: 0,
      crossOrigin: 'anonymous',
      cacheSize: isMobile ? 128 : 512,
      projection: projLocal,
      tileGrid: new ol.tilegrid.TileGrid({
        origin: [153468, 513944],
        extent: [153468, 513944, 219004, 579480],
        resolutions: [256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5, 0.25],
        tileSize: [256, 256],
        minZoom: 5
      }),
      tileUrlFunction: function (tileCoord, pixelRatio, projection) {
        if (!tileCoord) { return undefined; }
        return ('tile.sqlite/lod2/{z}/{x}/{-y}.{ext}')
          .replace('{z}', tileCoord[0])
          .replace('{-y}', tileCoord[2])
          .replace('{x}', tileCoord[1])
      }
    })
  });
  
  //LOD1 VW
  this.layers.lod1_vw = new ol.layer.Tile({
    visible: false,
    opacity: 0.8,
    preload: isMobile ? 1 : 4,
    source: new ol.source.Model3dTile({
      modelClass: ol.model3d.OutlineMesh,
      keepCacheZoom: 3,
      startupPreload: 0,
      crossOrigin: 'anonymous',
      cacheSize: isMobile ? 128 : 512,
      projection: projLocal,
      tileGrid: new ol.tilegrid.TileGrid({
        origin: [153468, 513944],
        extent: [153468, 513944, 219004, 579480],
        resolutions: [256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5, 0.25],
        tileSize: [256, 256],
        minZoom: 5
      }),
      tileUrlFunction: function (tileCoord, pixelRatio, projection) {
        if (!tileCoord) { return undefined; }
        return ('tile.sqlite/lod1_vw/{z}/{x}/{-y}.{ext}')
          .replace('{z}', tileCoord[0])
          .replace('{-y}', tileCoord[2])
          .replace('{x}', tileCoord[1])
      }
    })
  });
  
  //LOD2 VW
  this.layers.lod2_vw = new ol.layer.Tile({
    visible: false,
    opacity: 0.8,
    preload: isMobile ? 1 : 4,
    source: new ol.source.Model3dTile({
      modelClass: ol.model3d.OutlineMesh,
      keepCacheZoom: 3,
      startupPreload: 0,
      crossOrigin: 'anonymous',
      cacheSize: isMobile ? 128 : 512,
      projection: projLocal,
      tileGrid: new ol.tilegrid.TileGrid({
        origin: [153468, 513944],
        extent: [153468, 513944, 219004, 579480],
        resolutions: [256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5, 0.25],
        tileSize: [256, 256],
        minZoom: 5
      }),
      tileUrlFunction: function (tileCoord, pixelRatio, projection) {
        if (!tileCoord) { return undefined; }
        return ('tile.sqlite/lod2_vw/{z}/{x}/{-y}.{ext}')
          .replace('{z}', tileCoord[0])
          .replace('{-y}', tileCoord[2])
          .replace('{x}', tileCoord[1])
      }
    })
  });
  

  // Structure
  this.layers.structure = new ol.layer.Tile({
    visible: false,
    preload: 0,
    source: new ol.source.Model3dTile({
      modelClass: ol.model3d.EpolarBuilding,
      keepCacheZoom: 4,
      startupPreload: 0,
      crossOrigin: 'anonymous',
      cacheSize: isMobile ? 64 : 256,
      projection: projLocal,
      tileGrid: new ol.tilegrid.TileGrid({
        origin: [153468, 513944],
        extent: [153468, 513944, 219004, 579480],
        resolutions: [256, 128, 64, 32, 16],
        tileSize: [256, 256],
        minZoom: 4
      }),
      tileUrlFunction: function (tileCoord, pixelRatio, projection) {
        if (!tileCoord) { return undefined; }
        return ('tile.sqlite/structure/{z}/{x}/{-y}.{ext}')
          .replace('{z}', tileCoord[0])
          .replace('{-y}', tileCoord[2])
          .replace('{x}', tileCoord[1]);
      }
    })
  });

  // Seoul-ro
  this.layers.seoulro = new ol.layer.Tile({
    visible: false,
    preload: 0,
    source: new ol.source.Model3dTile({
      modelClass: ol.model3d.EpolarBuilding,
      keepCacheZoom: 4,
      startupPreload: 0,
      crossOrigin: 'anonymous',
      cacheSize: isMobile ? 64 : 256,
      projection: projLocal,
      tileGrid: new ol.tilegrid.TileGrid({
        origin: [153468, 513944],
        extent: [153468, 513944, 219004, 579480],
        resolutions: [256, 128, 64, 32, 16],
        tileSize: [256, 256],
        minZoom: 4
      }),
      tileUrlFunction: function (tileCoord, pixelRatio, projection) {
        if (!tileCoord) { return undefined; }
        return ('tile.sqlite/seoulro/{z}/{x}/{-y}.{ext}')
          .replace('{z}', tileCoord[0])
          .replace('{-y}', tileCoord[2])
          .replace('{x}', tileCoord[1]);
      }
    })
  });  
 
 // LOD2 Structure
 this.layers.lod2_str = new ol.layer.Tile({
  visible: false,
  preload: 0,
  source: new ol.source.Model3dTile({
    modelClass: ol.model3d.OutlineMesh,
    keepCacheZoom: 4,
    startupPreload: 0,
    crossOrigin: 'anonymous',
    cacheSize: isMobile ? 64 : 256,
    projection: projLocal,
    tileGrid: new ol.tilegrid.TileGrid({
      origin: [153468, 513944],
      extent: [153468, 513944, 219004, 579480],
      resolutions: [256, 128, 64, 32, 16],
      tileSize: [256, 256],
      minZoom: 4
    }),
    tileUrlFunction: function (tileCoord, pixelRatio, projection) {
      if (!tileCoord) { return undefined; }
      return ('tile.sqlite/lod2_str/{z}/{x}/{-y}.{ext}')
        .replace('{z}', tileCoord[0])
        .replace('{-y}', tileCoord[2])
        .replace('{x}', tileCoord[1]);
    }
  })
});
 

  // Daum-BaseMap
  this.layers.imagery_daum = new ol.layer.Tile({
    visible: false,
    opacity: 0.5,
    preload: 1,
    source: new ol.source.XYZ({
      reprojectionErrorThreshold: 512,
      crossOrigin: 'anonymous',
      cacheSize: 1024,
      projection: projDaum,
      tileGrid: projDaum.getDefaultTileGrid(),
      tileUrlFunction: function (tileCoord, pixelRatio, projection) {
        if (!tileCoord) { return undefined; }
        return ('/MAPPIPE/http://map{d}.daumcdn.net/map_2d/1912uow/L{z}/{-y}/{x}.png')
          .replace('{d}', (((tileCoord[1] % 4) + 4) % 4) + 1)
          .replace('{z}', 14 - tileCoord[0])
          .replace('{x}', tileCoord[1])
          .replace('{-y}', tileCoord[2]);
      }
    })
  });

// Naver-BaseMap
this.layers.imagery_naver = new ol.layer.Tile({
  visible: false,
  opacity: 0.8,
  preload: 0,
  source: new ol.source.XYZ({
    reprojectionErrorThreshold: 1024,
    crossOrigin: 'anonymous',
    cacheSize: 2048,
    projection: projNaver,
    tileUrlFunction: function (tileCoord, pixelRatio, projection) {
      if (!tileCoord) { return undefined; }
      return ('https://map.pstatic.net/nrb/styles/basic/1582182342/{z}/{x}/{y}.png?mt=bg.ol.sw')
        .replace('{z}', tileCoord[0])
        .replace('{y}', -tileCoord[2] - 1)
        .replace('{x}', tileCoord[1]);
    }
  })
});


  // Daum-Hybrid
  this.layers.terrainDaumHybrid = new ol.layer.Tile({
    visible: false,
    opacity: 1.0,
    preload: 0,
    source: new ol.source.XYZ({
      reprojectionErrorThreshold: 512,
      crossOrigin: 'anonymous',
      cacheSize: 1024,
      projection: projDaum,
      tileGrid: projDaum.getDefaultTileGrid(),
      tileUrlFunction: function (tileCoord, pixelRatio, projection) {
        if (!tileCoord) { return undefined; }
//        return ('/MAPPIPE/http://map{d}.daumcdn.net/map_hybrid/2fso/L{z}/{-y}/{x}.png')
        return ('/MAPPIPE/http://map{d}.daumcdn.net/map_hybrid/1906plw/L{z}/{-y}/{x}.png')
          .replace('{d}', (((tileCoord[1] % 4) + 4) % 4) + 1)
          .replace('{z}', 14 - tileCoord[0])
          .replace('{x}', tileCoord[1])
          .replace('{-y}', tileCoord[2]);
      }
    })
  });

  // Naver-Hybrid
  this.layers.terrainNaverHybrid = new ol.layer.Tile({
    visible: false,
    opacity: 1.0,
    preload: 0,
    source: new ol.source.XYZ({
      reprojectionErrorThreshold: 1024,
      crossOrigin: 'anonymous',
      cacheSize: 2048,
      projection: projNaver,
      tileUrlFunction: function (tileCoord, pixelRatio, projection) {
        if (!tileCoord) { return undefined; }
        return ('https://map.pstatic.net/nrb/styles/satellite/1587637016/{z}/{x}/{y}.png?mt=ol.sw')
        //return ('/MAPPIPE/https://map.pstatic.net/nrb/styles/basic/1582182342/{z}/{x}/{y}@2x.jpg')
        //return ('https://map.pstatic.net/nrb/styles/basic/1582182342/{z}/{x}/{y}.png?mt=bg.ol.sw')
          //.replace('{s}', (tileCoord[1] % 4 + 1))
          .replace('{z}', tileCoord[0])
          .replace('{y}', -tileCoord[2] - 1)
          .replace('{x}', tileCoord[1]);
      }
    })
  });

  this.layers.terrainNaverHybrid_poi = new ol.layer.Tile({
    visible: false,
    opacity: 1.0,
    preload: 0,
    source: new ol.source.XYZ({
      reprojectionErrorThreshold: 1024,
      crossOrigin: 'anonymous',
      cacheSize: 2048,
      projection: projNaver,
      tileUrlFunction: function (tileCoord, pixelRatio, projection) {
        if (!tileCoord) { return undefined; }
        return ('https://map.pstatic.net/ozone/raster/49e4aeb2-e1c4-47d3-94e7-d38812ad57c3/{z}/{x}/{y}?mapType=HYBRID&pixelRatio=1&language=ko&layers=TRANSIT,POI')
        //return ('/MAPPIPE/https://map.pstatic.net/nrb/styles/basic/1582182342/{z}/{x}/{y}@2x.jpg')
        //return ('https://map.pstatic.net/nrb/styles/basic/1582182342/{z}/{x}/{y}.png?mt=bg.ol.sw')
          //.replace('{s}', (tileCoord[1] % 4 + 1))
          .replace('{z}', tileCoord[0])
          .replace('{y}', -tileCoord[2] - 1)
          .replace('{x}', tileCoord[1]);
      }
    })
  });

  // WMS Layer
 // var WMS_URL = '/MAPPIPE/http://3dgis.seoul.go.kr/';

  // 만약, 웹서버 크로스 오리진 설정이 안되어있다면, node 서버를 통해서 받아야함.
  WMS_URL = 'http://all4ace507.iptime.org:8180/';
  
  this.layers.terrainWMS = new ol.layer.Tile({
    extent: projLocal.getExtent(),
    preload: 1,
    opacity: 1.0,
    visible: false,
    source: new ol.source.TileWMS(({
      cacheSize: 128,
      projection: projLocal,
      tileGrid: new ol.tilegrid.TileGrid({
        origin: [153468, 513944],
        extent: [153468, 513944, 219004, 579480],
        resolutions: [256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5, 0.25, 0.125, 0.0625],
        tileSize: [256, 256]
      }),
      url: WMS_URL + "geoserver/data/wms",
      crossOrigin: 'anonymous',
      params: {
        'SERVICE': 'WMS', 'VERSION': '1.1.1', 'TILED': true, 'CRS': 'EPSG:5186',
        'TRANSPARENT': true, 'BGCOLOR': '0x000000', 'WIDTH': 256, 'HEIGHT': 256, 'FORMAT_OPTIONS': 'ANTIALIASING:OFF',
        'FORMAT': 'image/png8',
        'LAYERS': 'data:cityhall'
      },
      serverType: 'geoserver'
    }))
  });

  // Asset 3D(3ds) model
  this.layers.asset3d = new ol.layer.Model3d({
    visible: false,
    opacity: 1.0,
    source : new ol.source.Model3d({
      projection  : projLocal
    })
  });
  
  // DbugTile
  this.layers.debug = new ol.layer.Tile({
    visible: false,
    opacity: 0.9,
    source: new ol.source.TileDebug3d({
      projection: projLocal,
      tileGrid: projLocal.getDefaultTileGrid()
    })
  });




/**
 * Color manipulation functions below are adapted from
 * https://github.com/d3/d3-color.
 */
var Xn = 0.950470;
var Yn = 1;
var Zn = 1.088830;
var t0 = 4 / 29;
var t1 = 6 / 29;
var t2 = 3 * t1 * t1;
var t3 = t1 * t1 * t1;
var twoPi = 2 * Math.PI;


/**
 * Convert an RGB pixel into an HCL pixel.
 * @param {Array<number>} pixel A pixel in RGB space.
 * @return {Array<number>} A pixel in HCL space.
 */
function rgb2hcl(pixel) {
  var red = rgb2xyz(pixel[0]);
  var green = rgb2xyz(pixel[1]);
  var blue = rgb2xyz(pixel[2]);

  var x = xyz2lab(
    (0.4124564 * red + 0.3575761 * green + 0.1804375 * blue) / Xn);
  var y = xyz2lab(
    (0.2126729 * red + 0.7151522 * green + 0.0721750 * blue) / Yn);
  var z = xyz2lab(
    (0.0193339 * red + 0.1191920 * green + 0.9503041 * blue) / Zn);

  var l = 116 * y - 16;
  var a = 500 * (x - y);
  var b = 200 * (y - z);

  var c = Math.sqrt(a * a + b * b);
  var h = Math.atan2(b, a);
  if (h < 0) {
    h += twoPi;
  }

  pixel[0] = h;
  pixel[1] = c;
  pixel[2] = l;

  return pixel;
}


/**
 * Convert an HCL pixel into an RGB pixel.
 * @param {Array<number>} pixel A pixel in HCL space.
 * @return {Array<number>} A pixel in RGB space.
 */
function hcl2rgb(pixel) {
  var h = pixel[0];
  var c = pixel[1];
  var l = pixel[2];

  var a = Math.cos(h) * c;
  var b = Math.sin(h) * c;

  var y = (l + 16) / 116;
  var x = isNaN(a) ? y : y + a / 500;
  var z = isNaN(b) ? y : y - b / 200;

  y = Yn * lab2xyz(y);
  x = Xn * lab2xyz(x);
  z = Zn * lab2xyz(z);

  pixel[0] = xyz2rgb(3.2404542 * x - 1.5371385 * y - 0.4985314 * z);
  pixel[1] = xyz2rgb(-0.9692660 * x + 1.8760108 * y + 0.0415560 * z);
  pixel[2] = xyz2rgb(0.0556434 * x - 0.2040259 * y + 1.0572252 * z);

  return pixel;
}

function xyz2lab(t) {
  return t > t3 ? Math.pow(t, 1 / 3) : t / t2 + t0;
}

function lab2xyz(t) {
  return t > t1 ? t * t * t : t2 * (t - t0);
}

function rgb2xyz(x) {
  return (x /= 255) <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}

function xyz2rgb(x) {
  return 255 * (x <= 0.0031308 ?
    12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);
}

/************************* Color Manipulation *****************************/

var controls = {};
var raster = this.layers.imagery;

raster.on('beforeoperations', function(event) {
var data = event.data;
for (var id in controls) {
  data[id] = Number(controls[id].value);
}

var controlIds = ['hue', 'chroma', 'lightness'];
controlIds.forEach(function(id) {
var control = document.getElementById(id);
var output = document.getElementById(id + 'Out');
control.addEventListener('input', function() {
  output.innerText = control.value;
  raster.changed();
});
output.innerText = control.value;
controls[id] = control;

});

});


}
