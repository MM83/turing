var blippCallback;

$(function(){
    
    window.blippCallback = 
    this.blippCallback   = 
    blippCallback        = function(data){
    };
    
    
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
    var $execButton = $('#exec-button'), $viewButton = $("#view-button"), $exitButton = $("#exit-button");
    var $panels = $("#action-panel, #routine-panel"), $stepButton = $("#step-button");
    var $panelScroll = $("#panel-scroll"), $routineList = $("#routine-list");
    var $actionItems = $(".action-item"), $dragBar = $("#drag-bar");
    var $routineDropArea = $("#routine-drop-area"), $routineScroll = $("#routine-scroll");
    
    var ANIM_TIME = 300;
    
    var running = false, viewLevel = false;
    
    var turingTree;
    
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
        $exitButton.animate({
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
            top : "13vw",
            opacity : 1
        }, ANIM_TIME, "easeInOutQuad");
        $routinePanel.delay(ANIM_TIME).animate({
            bottom : "1vw",
            top : "50vh"
        }, ANIM_TIME);
        $viewButton.animate({
            left : "1vw",
            opacity : 1
        }, ANIM_TIME);
        $exitButton.delay(ANIM_TIME).animate({
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
            turingTree = buildTree(buildData());
            
        } else {
            //TODO - Cancel and reset
            animateInUI();
        }
        running = !running;
        $execButton.html(running ? "ABORT" : "EXECUTE");
    };
    
    $stepButton.on("touchstart", function(){
        if(!running)
            return;
        if(!turingTree.executeNode()){
            toggleExecute();
        }
    });
    
    
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
        "<br/>the way is clear",
        "<br/>the way is blocked",
        "<br/>the way is dangerous",
        "<br/>behind is clear",
        "<br/>behind is blocked",
        "<br/>the way is dangerous"
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
    
    function addActionToRoutine(type, name, data, elemToAppendTo){
        
        var indent = !elemToAppendTo;
        elemToAppendTo = elemToAppendTo || $routineList;
        
        var $action, $close = $('<div class="x-box">X</div>');
        
        var lastElementIndex = 0;
        
        elemToAppendTo.children().each(function(i){
            var c = $(this).offset();
            if(c.top < lastTouch.pageY)
                lastElementIndex = i + 1;
        });
        
        switch(type){
                
            case "Loop":
            case "If":
                
                $action = $('<li class="routine-condition"/>').attr("id", newID());
                
                var $condBottom = $('<div class="routine-item cond-bottom"/>');
                
                var $condTop = $('<div class="routine-item cond-top">').html(type + " " + name);
                
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
                
                if(type == "Loop"){
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
                $action = $('<li class="routine-item"></li>').html(name + " " + data).attr("id", newID());
                $action.append($close);
                
                break;
        }
        
       
        switch(name){
            case "Restart":
            case "Break":
            case "Next":
                $action.css({
                    color : "#eb3e3e"
                });
                break;
        }
        
        $close.on("touchstart", function(){
            $action.remove();
        });
        
    //    $action[0].__action = action;//TODO - ADD PROPER ATTRIBUTES AND PARSE
        $action[0].__type = type;
        $action[0].__data = data;
        $action[0].__name = name;
        
        
        //elemToAppendTo.append($action);
        
        $action.insertAt(lastElementIndex, elemToAppendTo);
        
        
    };
    
    var _idN = -1;
    function newID(){
        return "elem" + ++_idN;
    };
    
    var draggingAction = false;
    var actionToMake;//TODO REMOVE AS OBSOLETE
    var lastTouch;
    var dragDims = {
        w : 0, h : 0
    };
    
    var _name, _type, _data;
    
    function touchStartAction(e){
        
        e.preventDefault();
        e.stopImmediatePropagation();
        
        var $elem = $(this);
        
        var offset = $elem.offset();
        
        actionToMake = $elem.html();
        
        var elemHTML = $elem.html();
        var splitHTML = elemHTML.split(" ");
        
        if(splitHTML[0] == "Move"){
            _type = "Action";
            _name = "Move";
            _data = splitHTML[1];
        };
        
        //Defaults, currently not null for HTML
        _name = _data = "";
        
        switch(splitHTML[0]){
            case "If":
            case "Loop":
                _type = splitHTML[0];
                break;
            case "Move":
                _type = "Action";
                _name = "Move";
                _data = splitHTML[1];
                break;
            case "Press":
            case "Sleep":
            case "Turn":
                _type = "Action";
                _name = splitHTML[0];
                _data = splitHTML[1] || "";
                break;
            case "Restart":
            case "Next":
            case "Break":
                _type = "Flow";
                _name = splitHTML[0];
                _data = "";
                break;
        };
        
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
            //    addActionToRoutine(actionToMake);
                addActionToRoutine(_type, _name, _data);
                    //
            } else if($drop.hasClass("list-drop-area") || $drop.hasClass("inner-list")){
            //    addActionToRoutine(actionToMake, dropElement.__$list);
                addActionToRoutine(_type, _name, _data, dropElement.__$list);
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
    
    function buildData(){
        
        function parseElement(elem, isRoot){
            
            var obj = {};
            
            if(isRoot){
                obj.type = "List";
                elem.__list = elem;
                obj.name = "ROOT";
            }
            else
                obj.type = elem.__type;
            
            obj.name = elem.__name;
            obj.data = elem.__data;
            obj.id = elem.id;
            
            switch(obj.type){
                case "Loop":
                    obj.data = +$(elem).find(".loop-number").first().html();
                case "If":
                case "List":
                    obj.list = [];
                    $(elem.__list).children("li").each(function(){
                        obj.list.push(parseElement(this));
                    });
                    break;
            };
            
            return obj;
        };
        
        return parseElement($routineList[0], true);
        
    };
    
    
    
    //=====PARSER
    var indent = 0, step = 0, node = 0;
    
//    function resetParser(){
//        indent = step = 0;
//        node = tree;
//    };
//    
    
    //======================================== BIND TOUCH EVENTS
    
    $execButton.on("touchstart", toggleExecute);
    $viewButton.on("touchstart", toggleView);
    
    $routineList.sortable({
        cancel : ".loop-number, .condition-type"
    });
    
    $("body").on("touchend", touchEndBody);
    $("body").on("touchmove", touchMoveBody);
    $(".action-item").on("touchstart", touchStartAction);
    
   
});