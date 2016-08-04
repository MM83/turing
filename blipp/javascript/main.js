var blipp = require("blippar").blipp;
var scene = blipp.addScene();

scene.addRequiredAssets(["overlay.html", "overlay.zip"]);

scene.onShow = function(){
    blipp.overlayHTML('', true, true, 'overlay.html.');
};