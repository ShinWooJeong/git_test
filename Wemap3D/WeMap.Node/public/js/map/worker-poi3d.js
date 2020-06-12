//
// Implementation Of Epipolar POI Webgl Engine
// FIXME! Migrate to inline webworker when Security Error Of IE11 is fixed!
//
self.onmessage = function(event) {
    if( event.data['command'] === 'compile' ) {
        eval(event.data['script']);
        return;
    }
};

