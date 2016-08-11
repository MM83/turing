var blipp = require("blippar").blipp;
var level = require("./level").level();
var scene = blipp.addScene();

//scene.addRequiredAssets(["overlay.html", "overlay.zip"]);

scene.onShow = function(){
    blipp.overlayHTML('', true, true, 'palette.html');
};