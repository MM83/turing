$(function(){
    
    //======================================== GET REFERENCES
    
    var $actionPanel = $("#action-panel"), $routinePanel = $("#routine-panel");
    var $execButton = $('#exec-button'), $viewButton = $("#view-button");
    var $panels = $("#action-panel, #routine-panel"), $stepButton = $("#step-button");
    
    var ANIM_TIME = 300;
    
    var running = false, viewLevel = false;
    
    function animateOutUI(){
        $actionPanel.css({
            opacity : 1
        }).animate({
            bottom : "100%",
            opacity : 0
        }, ANIM_TIME, "easeInOutQuad");
        $routinePanel.css({
            opacity : 1
        }).animate({
            opacity : 0.5,
            bottom : "13vw"
        }, ANIM_TIME);
        $viewButton.animate({
            left : "-50vw",
            opacity: 0
        }, ANIM_TIME);
        $execButton.animate({
            color : "red",
            borderColor : "red"
        });
        $stepButton.delay(ANIM_TIME).animate({
            right : "1vw"
        });
    };
    
    function animateInUI(){
        $actionPanel.animate({
            bottom : "25vw",
            opacity : 1
        }, ANIM_TIME, "easeInOutQuad");
        $routinePanel.delay(ANIM_TIME).animate({
            opacity : 1,
            bottom : "1vw"
        }, ANIM_TIME);
        $viewButton.animate({
            left : "1vw",
            opacity : 1
        }, ANIM_TIME);
        $execButton.animate({
            color : "#62af91",
            borderColor : "#62af91"
        });
        $stepButton.animate({
            right : "-50vw"
        });
    };
    
    function toggleExecute(){
        if(!running){
            //TODO - Init running
            animateOutUI();
        } else {
            //TODO - Cancel and reset
            animateInUI();
        }
        running = !running;
        $execButton.html(running ? "ABORT" : "EXECUTE");
    };
    
    function toggleView(){
        viewLevel = !viewLevel;
        $panels.animate({
            opacity : +(!viewLevel)
        }, 300);
        $viewButton.html(viewLevel ? "VIEW ROUTINE" : "VIEW LEVEL");
    };
    
    //======================================== BIND TOUCH EVENTS
    
    $execButton.on("touchstart", toggleExecute);
    $viewButton.on("touchstart", toggleView);
    
    
    
});