$(function(){
    
    $.fn.insertAt = function(index, $parent) {
        return this.each(function() {
            if (index === 0) {
                $parent.prepend(this);
            } else {
                $parent.children().eq(index - 1).after(this);
            }
        });
    }
    
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
            bottom : "125vw",
            top : "-223vw",
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
        
    };
    
    function animateInUI(){
        $actionPanel.animate({
            bottom : "25vw",
            top : "1vw",
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
            right : "-71vw"
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
        if(!running){
            //TODO - Init running
            animateOutUI();
            buildTree();
            console.log(tree);
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
    
    var conditions = [
        "the way is clear",
        "the way is dangerous",
        "behind is clear",
        "behind is dangerous",
        "the floor ahead is black",
        "the floor ahead is white",
        "the floor behind is black",
        "the floor behind is white",
    ];
    
    function switchCondType(){
        this.innerHTML = conditions[this.__condTypeIndex = ++this.__condTypeIndex % conditions.length];
    };
    
    function collapse(){
        var c = this.__collapsed =! this.__collapsed;
        $(this).css({
            width : c ? "50%" : "100%"
        });
        this.__$innerList.css({
            display : c ? "none" : "inline"
        });
        this.__$dropArea.css({
            display : c ? "none" : "inline"
        });
    };
    
    var counterElem, counterValue, initX, div = $("body").width() / 30000;
    
    function initCounter(e){
        counterElem = this;
        counterValue = this.__value;
        initX = e.touches[0].pageX;
    };
    
    function updateCounter(e){
        if(counterElem == this)
            this.__value += (e.touches[0].pageX - initX) * div;
        this.innerHTML = Math.round(this.__value);
        initX = e.touches[0].pageX;
    };
    
    function addActionToRoutine(action, elemToAppendTo){
        
        var indent = !elemToAppendTo;
        elemToAppendTo = elemToAppendTo || $routineList;
        
        var $action, $close = $('<div class="x-box">X</div>');
        
        var lastElementIndex = 0;
        
        elemToAppendTo.children().each(function(i){
            var c = $(this).offset();
            console.log("check", c.top, lastTouch.pageY);
            if(c.top < lastTouch.pageY)
                lastElementIndex = i + 1;
        });
        
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
                
                $innerList.sortable({
                    cancel : ".loop-number"
                });
                
                $action[0].__list = $innerList[0];
                $dropArea[0].__$list = $innerList;//Hacky but it's JS eh?
                $innerList[0].__$list = $innerList;
               
                $condBottom[0].__$dropArea = $dropArea;
                $condBottom[0].__$innerList = $innerList;
                $condBottom.on("touchstart", collapse);
                
                var initY, initVal;
                
                if(action == "Loop"){
                    var $counter = $('<div class="loop-number">0</div>');
                    $counter[0].__value = 0;
                    $counter.on("touchstart", initCounter);
                    $counter.on("touchmove", updateCounter);
                    //TODO - endCounter to null references
                    $condTop.append($counter);
                    $condTop.append('<span class="times-label">times</span>');
                } else {
                    var $condType = $('<span class="condition-type"/>').html(conditions[0]);
                    $condTop.append($condType);
                    $condType[0].__condTypeIndex = 0;
                    $condType.on("touchstart", switchCondType);
                    
                }
                
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
        
        
        //elemToAppendTo.append($action);
        
        $action.insertAt(lastElementIndex, elemToAppendTo);
        
        
    };
    
    var draggingAction = false;
    var actionToMake;
    var lastTouch;
    var dragDims = {
        w : 0, h : 0
    };
    
    function touchStartAction(e){
        
        e.preventDefault();
        e.stopImmediatePropagation();
        
        var $elem = $(this);
        
        var offset = $elem.offset();
        console.log(offset);
        
        actionToMake = $elem.html();
        
        fadeAllActions(this);
        draggingAction = true;
        
        $dragBar.empty();
        $dragBar.append($elem.clone());
        dragDims.w = $dragBar.width() / 2;
        dragDims.h = $dragBar.height() / 2;
        
    };
    function touchMoveBody(e){
        lastTouch = e.touches[0];
        $dragBar.css({
            left: (lastTouch.pageX - dragDims.w) + "px",
            top : (lastTouch.pageY - dragDims.h) + "px"
        });
        
    };    
    function touchEndBody(e){
        
        $dragBar.empty();
        
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
    
    var tree;
    var ti = 0;
    var root;
    
    function buildTree(){
    
        var depth = 0;
        
        function parse(elem, parent){
            ++depth;
            var list = [];
            $(elem).children("li").each(function(){
                var obj;
                switch(this.__action){
                    case "Loop":
                        obj = parse(this.__list, obj);
                        obj.__iter = 10;
                    case "If":
                        obj = parse(this.__list, obj);
                        obj.__type = this.__action;
                        obj.__depth = depth;
                        obj.__condition = {
                            dir : "Forward",
                            type : "clear",
                            check : true
                        };//TODO
                    break;
                    default:
                        obj= {
                            __type : this.__action,
                            __depth : depth
                        };
                    break;
                }
                obj.__parent = parent;
                obj.elem = this;
                list.push(obj);
            });
            --depth;
            return list;
        };
        
        tree = parse($routineList[0], "RAHBET STRINGORR");
        console.log("TREE", tree);
    
    };
    
    
    //=====PARSER
    var indent = 0, step = 0, node = 0;
    
    function resetParser(){
        indent = step = 0;
        node = tree;
    };
    
    function getNextAction(){
        var parent = node.__parent;
    };
    
    
    
    //======================================== BIND TOUCH EVENTS
    
    $execButton.on("touchstart", toggleExecute);
    $viewButton.on("touchstart", toggleView);
    
    $routineList.sortable({
        cancel : ".loop-number, .condition-type"
    });
    
    $("body").on("touchend", touchEndBody);
    $("body").on("touchmove", touchMoveBody);
    $(".action-item").on("touchstart", touchStartAction);
    
    
    $(".drop-area").on("mouseleave", function(){
        console.log("shit");
    });
    
});