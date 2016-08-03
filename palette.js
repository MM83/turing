$(function(){
    
    //======================================== GET REFERENCES
    
    var $actionPanel = $("#action-panel"), $routinePanel = $("#routine-panel");
    var $execButton = $('#exec-button'), $viewButton = $("#view-button");
    var $panels = $("#action-panel, #routine-panel"), $stepButton = $("#step-button");
    var $panelScroll = $("#panel-scroll"), $routineList = $("#routine-list");
    var $actionItems = $(".action-item"), $dragBar = $("#drag-bar");
    var $routineDropArea = $("#routine-drop-area"), $routineScroll = $("#routine-scroll");
    
    var ANIM_TIME = 300;
    
    var running = false, viewLevel = false;
    
    function animateOutUI(){
        $actionPanel.css({
            opacity : 1
        }).delay(ANIM_TIME).animate({
            bottom : "100%",
            opacity : 0
        }, ANIM_TIME, "easeInOutQuad");
        $routinePanel.animate({
            bottom : "13vw",
            top : "50vh"
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
        $panelScroll.animate({
            scrollTop : "0px"
        }, ANIM_TIME);
        $routineScroll.animate({ scrollTop : 0 }, "easeInOutCirc");
        $routineScroll.each(function(){
            console.log("stepping");
            var $elem = $(this);
            $elem.animate({
                opacity : 0.25
            });
        });
    };
    
    function animateInUI(){
        $actionPanel.animate({
            bottom : "25vw",
            opacity : 1
        }, ANIM_TIME, "easeInOutQuad");
        $routinePanel.delay(ANIM_TIME).animate({
            bottom : "1vw",
            top : "1vw"
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
        $routineScroll.each(function(){
            console.log("stepping");
            var $elem = $(this);
            $elem.animate({
                opacity : 1
            });
        });
    };
    
    function toggleExecute(){
        buildTree();
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
        $viewButton.html(viewLevel ? "VIEW CODE" : "VIEW LEVEL");
    };
    
    var Action = {
        "Move Forward" : 0,
        "Move Backward" : 1,
        "Turn Right" : 2,
        "Turn Left" : 3,
        "Wait" : 4,
        "Loop" : 5,
        "Condition" : 6,
        "Restart" : 7
    };
    
    function addActionToRoutine(action, elemToAppendTo){
        
        var indent = !elemToAppendTo;
        elemToAppendTo = elemToAppendTo || $routineList;
        
        var $action, $close = $('<div class="x-box">X</div>');
        
        switch(action){
            case "Loop":
            case "If":
                $action = $('<li class="routine-condition"/>');
                var $condBottom = $('<div class="routine-item cond-bottom"/>');
                var $condTop = $('<div class="routine-item cond-top">').html(action);
                var $dropArea = $('<div class="list-drop-area"></div>');
                var $innerList = $('<ul class="inner-list"/>');
                
                $condTop.css({
                    color : "#ebca3e"
                });
                
                $action.append($dropArea);
                $action.append($condTop);
                $condTop.append($close);
                $action.append($innerList);
                $action.append($condBottom);
                
                $innerList.sortable();
                
                $action[0].__list = $innerList[0];
                $dropArea[0].__$list = $innerList;//Hacky but it's JS eh?
                $innerList[0].__$list = $innerList;
                
                
                break;
            default:
                $action = $('<li class="routine-item"></li>').html(action);
                $action.append($close);
                
                break;
        }
        
        if(action == "Restart")
            $action.css({
                color : "#eb3e3e"
            });
        
        $close.on("touchstart", function(){
                    $action.remove();
                });
        
        $action[0].__action = action;
        elemToAppendTo.append($action);
    };
    
    var draggingAction = false;
    var actionToMake;
    var lastTouch;
    
    function touchStartAction(e){
        
        $dragBar.css({
            visibility : "visible"
        });
        
        var $elem = $(this);
        
        var offset = $elem.offset();
        console.log(offset);
        
        actionToMake = $elem.html();
        
        fadeAllActions(this);
        draggingAction = true;
    };
    function touchMoveBody(e){
        lastTouch = e.touches[0];
    };    
    function touchEndBody(e){
        
        $dragBar.css({
            visibility : "hidden"
        });
       
        if(!lastTouch)
            return;
        if(draggingAction){
            var dropElement = document.elementFromPoint(lastTouch.pageX, lastTouch.pageY);
            var $drop = $(dropElement);
            if(dropElement.id == "routine-drop-area"){
                addActionToRoutine(actionToMake);
                    //
            } else if($drop.hasClass("list-drop-area") || $drop.hasClass("inner-list")){
                addActionToRoutine(actionToMake, dropElement.__$list);
            }
            
        }
        showAllActions();
        draggingAction = false;
        
    }
      
    function showAllActions(){
        $actionItems.animate({
            opacity : 1
        });
        
    };   
    function fadeAllActions(elem){
        $actionItems.css({
            opacity : 0.3
        });
        $(elem).css({
            opacity : 1
        });
    };
    
    
    function buildTree(){
    
        var tree = [];
        var elem = $routineList[0];
        
        var depth = 0;
        function parse(elem){
            ++depth;
            //elem is assumed to have a list of child li nodes
            $(elem).children("li").each(function(){
                console.log("li", depth, this.__action);
                switch(this.__action){
                case "Loop":
                case "If":
                    parse(this.__list);
                    break;
                default:
                    
                    break;
            }
            });
            --depth;
        };
        
        parse($routineList[0]);
        
    
    };
    
    
    
    //======================================== BIND TOUCH EVENTS
    
    $execButton.on("touchstart", toggleExecute);
    $viewButton.on("touchstart", toggleView);
    
    //TEMP REMOVE
    $routineList.sortable();
    
    $("body").on("touchend", touchEndBody);
    $("body").on("touchmove", touchMoveBody);
    $(".action-item").on("touchstart", touchStartAction);
    
    $(".drop-area").on("mouseleave", function(){
        console.log("shit");
    });
    
});