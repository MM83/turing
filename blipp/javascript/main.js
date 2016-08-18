var blipp = require("blippar").blipp;
var Level = require("./level").level;

var scene = blipp.addScene();
var level = new Level(scene, blipp);

//scene.addRequiredAssets(["overlay.html", "overlay.zip"]);

function rnd(){
    return Math.round(Math.random()*999999);
};

scene.onShow = function(){
    blipp.overlayHTML('', true, true, 'palette.html?rnd=' + rnd());
    level.init();
};