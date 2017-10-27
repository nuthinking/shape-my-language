/**
 * @author christian.giordano
 */
Fx.Animator = new Class({
    
    Extends: Fx,
    
    initialize: function(target, property, options){
        this.parent(options);
        this.target = target;
        this.property = property;
        this.isFunction = typeof property == "function";
    },
    
    set: function(now){
        if(this.isFunction){
            this.property.apply(this.target, [now]);
        }else{
            this.target[this.property] = now;
        }
        return this;
    }
});

TwitterDetailsCarousel = new Class({
    options: {
        frameRate:30,
        width: 640,
        height: 480,
        bgColor: "#FFF",
        fgColor: "#000",
        fontSize: 100,
        lineSpacing: 1.1,
        legendFontSize: 60,
        fontOffset: -0.168,
        hasToDebugDetails: false,
        debugCharSpeed: 1000,
        maxDetailDelta: 100,
        detailDuration: 6000,
        allTweetDuration: 12000,
        revealDuration: 2300,
        fadeOutDuration: 3000,
        useDetailScreenshot: true
    },

    initialize: function(feedUrl, detailsMap, dataProvider, container, options)
    {
        this.setOptions(options);
        this.options.revealAnimationOptions = {duration:this.options.revealDuration, transition:Fx.Transitions.Quint.easeInOut};
        this.options.detailAnimationOptions = {duration:this.options.detailDuration, transition:'linear'};
        this.options.fadeOutAnimationOptions = {duration:this.options.fadeOutDuration, transition:'linear'};
        
        this.feedUrl = feedUrl;
        this.detailsMap = detailsMap;
        this.dataProvider = dataProvider;
        this.container = container;
		
        this.legendFontDelta = this.options.fontSize - this.options.legendFontSize;
        this.canvas = new Element('canvas');
        this.canvas.width = this.options.width;
        this.canvas.height = this.options.height;
        log("created canvas with size - w:" + this.canvas.width + " h:" + this.canvas.height);
        this.canvas.setStyle('background-color', this.options.bgColor);
        var canHandleHtml5 = (this.canvas.getContext != null);
        if(!canHandleHtml5) {
            alert("We are sorry but to see this project you need an HTML5 compatible browser. Please consider installing the latest version of Google Chrome or Mozilla Firefox.");
            return;
        }
        this.container.appendChild(this.canvas);
        // if(!this.options.hasToDebugDetails)
        this.context = this.canvas.getContext("2d");

        this.currentCameraZoom = 1;
        this.currentCameraX = 0;
        this.currentCameraY = 0;

        this.updateInterval = Math.round(1000 / this.options.frameRate);
        this.updateIntervalId = -1;
        
        this.debugRunningDetails = false;
        this.hasToFadeOut = false;
        this.fadeAlpha = 0;
        

        if(this.options.hasToDebugDetails) {
            this.debugDetails();
        } else {
            this.run();
        }
    },
    
    run : function ()
    {
        log("run...");
        if(this.options.useDetailScreenshot){
            this.detailCanvas = new Element('canvas');
            this.detailCanvas.width = this.options.width + this.options.maxDetailDelta * 2;
            this.detailCanvas.height = this.options.height + this.options.maxDetailDelta * 2;
            this.detailCanvas.setStyle('background-color', this.options.bgColor);
            this.detailContext = this.detailCanvas.getContext("2d");
        }
        this.hasToShowDetail = false;
        
        this.detailAnimatorX = new Fx.Animator(this, this.options.useDetailScreenshot ? "detailX" : "currentCameraX", this.options.detailAnimationOptions);
        this.detailAnimatorY = new Fx.Animator(this, this.options.useDetailScreenshot ? "detailY" : "currentCameraY", this.options.detailAnimationOptions);
        if(!this.options.useDetailScreenshot)
            this.detailAnimatorZ = new Fx.Animator(this, "currentCameraZoom", this.options.detailAnimationOptions);
        
        this.revealAnimatorX = new Fx.Animator(this, "currentCameraX", this.options.revealAnimationOptions);
        this.revealAnimatorY = new Fx.Animator(this, "currentCameraY", this.options.revealAnimationOptions);
        this.revealAnimatorZ = new Fx.Animator(this, "currentCameraZoom", this.options.revealAnimationOptions);
        
        this.dataProvider.addEvent("load", function() {
            if(this.updateIntervalId == -1){
                // first time
                this.onInitialLoad();
            }else{
                log("loaded tweets again");
            }
            this.onLoad();
        }.bind(this));
        $(document).addEvent('keydown', this.onRunKeyDown.bind(this));
        
        this.dataProvider.load();
    },
    
    onRunKeyDown : function (event)
    {
        switch(event.code)
        {
            case 68: // d
                this.debugRunningDetails = !this.debugRunningDetails;
                break;
            default:
                log("not captured key down: " + event.code);
        }
    },
    
    onInitialLoad : function ()
    {
        this.updateIntervalId = this.draw.periodical(this.updateInterval, this);
        this.showNextText();
    },
    
    onLoad : function ()
    {
        this.dataProvider.loadLive.delay(1000 * 60, this.dataProvider);
    },
    
    setSize : function ( width, height ) {
        this.options.width = width;
        this.options.height = height;
        this.canvas.width = this.options.width;
        this.canvas.height = this.options.height;
        if(this.detailCanvas){
            this.detailCanvas.width = this.options.width + this.options.maxDetailDelta * 2;
            this.detailCanvas.height = this.options.height + this.options.maxDetailDelta * 2;
        }
        log("resized to - w:" + this.canvas.width + " h:" + this.canvas.height);
        this.draw();
    },
    
    debugDetails : function ()
    {
        this.onDebugKeyDownBound = this.onDebugKeyDown.bind(this);
        $(document).addEvent('keydown', this.onDebugKeyDownBound);

        this.detailsToDebug = this.detailsMap.getAllDetails().concat();
        this.detailsToDebugIndex = 0;
        log("will debug " + this.detailsToDebug.length + " details");
        if(this.detailsToDebug.length>0) {
            this.drawDebugWithIndex(this.detailsToDebugIndex);
        } else {
            log("[ERROR] can't debug details because none has been found!");
        }
    },
    
    onDebugKeyDown : function (event)
    {
        switch(event.code){
            case 37: // arrow left
                this.drawDebugWithIndex(this.detailsToDebugIndex-1);
                break;
            case 39: // arrow right
                this.drawDebugWithIndex(this.detailsToDebugIndex+1);
                break;
            case 13: // enter
                $(document).removeEvent('keydown', this.onDebugKeyDownBound);
                this.run();
                break;
            default:
                log("pressed not captured key: " + event.code);
        }
    },
    
    drawDebugWithIndex : function (index)
    {
        if(index>= this.detailsToDebug.length){
            index = index % this.detailsToDebug.length;
        }else if(index < 0){
            index += this.detailsToDebug.length;
        }
        this.detailsToDebugIndex = index;
        var detail = this.detailsToDebug[this.detailsToDebugIndex];
        // log("debug detail " + (index + 1) + " of " + this.detailsToDebug.length);
        this.drawDebugDetail(detail);
    },
    
    drawDebugDetail : function ( detail ) {
        log(detail);
        this.clear();
        var c = this.context;
        log("debug \"" + detail.lett + "\" style:" + detail.style);
        this.initTextContext(c, detail.style);

        var w = c.measureText(detail.lett).width;
        var h = this.options.fontSize;

        var scale = Math.max(this.options.width, this.options.height) / (h * detail.radius);

        var dx = w * detail.x;
        var dy = h * detail.y;

        var wh = this.options.width * .5;
        var hh = this.options.height * .5;

        c.save();
        c.translate(wh, hh);
        c.save();
        c.scale(scale,scale);
        c.translate(-dx, -dy);
        this.drawText(detail.lett);
        c.restore();
        c.beginPath();
        c.moveTo(0, -hh);
        c.lineTo(0, hh);
        c.moveTo(-wh, 0);
        c.lineTo(wh, 0);
        c.strokeStyle = "#0F0";
        c.stroke();
        c.restore();
        var margin = 20;
        c.save();
        c.translate(margin, margin);

        c.fillStyle = this.options.bgColor;
        c.fillRect(0,0,w,h);

        c.rect(0,0,w,h);
        c.strokeStyle = "#666";
        c.stroke();

        c.fillStyle = this.options.fgColor;
        this.drawText(detail.lett);

        c.beginPath();
        c.moveTo(dx, 0);
        c.lineTo(dx, h);
        c.moveTo(0, dy);
        c.lineTo(w, dy);
        c.arc(dx, dy, h*detail.radius*0.5, 0, Math.PI * 2, false);

        c.strokeStyle = "#0F0";
        c.stroke();
        c.restore();
    },
    drawText : function (text) {
        this.context.fillText(text, 0, this.context.textBaseline == "top" ? 0 : this.options.fontSize + this.options.fontSize * this.options.fontOffset);
    },
    initTextContext : function (context, style, weight, isLegend) {
        if(!context)
          context = this.context;
        if(!style)
            style = "regular";
		if(!weight)
			weight = 400;
        var c = context;
        c.fillStyle = this.options.fgColor;
        switch(style) {
            case "regular":
                c.font = weight + " " + this.options.fontSize + "px Ubuntu";//, Ubuntu Beta, UbuntuBeta";
                break;
            default:
                c.font = weight + " " + style + " " + (isLegend ? this.options.legendFontSize : this.options.fontSize) + "px Ubuntu";
                break;
        }
        c.textBaseline = "top"; //alphabetic";// "top" wasn't working the same across browsers :S
    },
    showNextText : function () {
        var t = this.dataProvider.getNextTweet();
        this.showTweet(t);
    },
    randomIndexOf : function (text, lett) {
        //		log("randomIndexOf - text:" + text + " lett:" + lett);
        var indeces = [];
        var index = 0;
        index = text.indexOf(lett, index);
        while(index>-1) {
            indeces.push(index);
            index++;
            index = text.indexOf(lett, index);
        }
        //log(indeces);
        return indeces.getRandom();
    },
    showTweet : function (tweet) {
        log("show tweet: " + tweet.text);
        this.currentTweet = tweet;
        if(!tweet.lines) {
            this.splitTweet(tweet);
        }

        var details = [];
        var d, i, index, j, line, text;
        var c = this.context;
        // text
        log(tweet.lines);
        var arr = this.detailsMap.getDetails(tweet.text, 3);
        for(j=0; j<arr.length; j++){
            d = arr[j];
            index = this.randomIndexOf(tweet.lines.join(" "), d.lett);
            for(i=0; i<tweet.lines.length; i++) {
                line = tweet.lines[i];
                if(index < line.length) {
                    break;
                } else {
                    index -= line.length+1;
                }
            }
            this.initTextContext(null, tweet.style, tweet.fontWeight);
            text = tweet.lines[i].substr(0,index);
            d.textX = c.measureText(text).width + c.measureText(d.lett).width * d.x;
            d.textY = i * this.options.fontSize * this.options.lineSpacing + this.options.fontSize * d.y;
            details.push(d);
        }
        
        // time
        var x = tweet.width;
        arr = this.detailsMap.getDetails(tweet.time, 1, 'italic');
        if(arr.length>0){
            d = arr[0];
            index = this.randomIndexOf(tweet.time, d.lett);
            text = tweet.time.substr(index);
            // log("time after text:\"" + text + "\"");
            this.initTextContext(null, "italic", null, true);
            d.textX = x - c.measureText(text).width + c.measureText(d.lett).width * d.x;
            d.textY = tweet.lines.length * this.options.fontSize * this.options.lineSpacing + this.options.legendFontSize * d.y + this.legendFontDelta;
            details.push(d);
    
            x-= c.measureText(" - " + tweet.time).width;
        }
        
        // author
        arr = this.detailsMap.getDetails(tweet.author, 1, 'bold');
        if(arr.length>0){
            d = arr[0];
            index = this.randomIndexOf(tweet.author, d.lett);
            text = tweet.author.substr(index);
            // log("author after text:" + text + "\"");
            this.initTextContext(null, "bold", null, true);
            d.textX = x - c.measureText(text).width + c.measureText(d.lett).width * d.x;
            d.textY = tweet.lines.length * this.options.fontSize * this.options.lineSpacing + this.options.legendFontSize * d.y + this.legendFontDelta;
            details.push(d);
        }

        // log(details);
        this.currentDetails = details;
        this.detailsToShow = this.currentDetails.concat();

        this.textWidth = this.currentTweet.width;
        this.textHeight = this.currentTweet.height;

        //		this.showAllTweet();
        this.showNextDetail();
    },
    randomize : function (arr) {
        var res = [];
        var item;
        while(arr.length>0) {
            item = arr.getRandom();
            res[res.length] = item;
            arr.splice(arr.indexOf(item, 1));
        }
        return res;
    },
    showAllTweet : function () {
        this.revealAnimatorX.start(this.currentCameraX, this.textWidth * .5);
        this.revealAnimatorY.start(this.currentCameraY, this.textHeight * .5);
        this.revealAnimatorZ.start(this.currentCameraZoom, (this.options.width / this.textWidth) * 0.9 * 0.8);
    },
    drawTweet : function (tweet, context) {
        var c = context || this.context;
        this.initTextContext(c, tweet.style, tweet.fontWeight);
        var y = c.textBaseline == "top" ? 0 : this.options.fontSize + this.options.fontSize * this.options.fontOffset;
        var line;
        for(var i=0; i<tweet.lines.length; i++) {
            line = tweet.lines[i];
            c.fillText(line, 0, y);
            y += this.options.fontSize * this.options.lineSpacing;
        }
        y += this.legendFontDelta;
        this.initTextContext(c, "italic", null, true);
        var text = " - " + tweet.time;
        var w = c.measureText(text).width;
        var x = tweet.width - w;
        c.fillText(text, x, y);

        this.initTextContext(c,"bold", null, true);
        text = "@" + tweet.author;
        x-= c.measureText(text).width;
        c.fillText(text, x, y);
    },
    splitTweet : function (tweet, context) {
        var c = context || this.context;
        this.initTextContext(c, tweet.style, tweet.fontWeight);
        tweet.split(c, this.options.width);
        tweet.height = (tweet.lines.length + 1) * this.options.fontSize * this.options.lineSpacing;
    },
    showDetail : function (detail)
    {
        log("has to show detail: " + detail.lett);
        var radius = this.options.fontSize * detail.radius;

        this.detailAnimatorX.cancel();
        this.detailAnimatorY.cancel();
        if(this.detailAnimatorZ)
            this.detailAnimatorZ.cancel();
            
        this.currentCameraX = detail.textX;
        this.currentCameraY = detail.textY;
        this.currentCameraZoom = Math.max(this.options.width, this.options.height) / radius;
        this.currentCameraZoom *= 1.3;
        
        var dx,dy,dz;
        
        if(this.options.useDetailScreenshot){
            var c = this.detailContext;
            c.fillStyle = this.options.bgColor;
            c.fillRect(0, 0, this.detailCanvas.width, this.detailCanvas.height);
            
            c.save();
                c.translate(this.options.width * .5 + this.options.maxDetailDelta, this.options.height * .5 + this.options.maxDetailDelta);
                c.scale(this.currentCameraZoom,this.currentCameraZoom);
                c.translate(-this.currentCameraX, -this.currentCameraY);
                this.drawTweet(this.currentTweet, c);
            c.restore();
            
            dx = (Math.random() * 2)-1;
            dy = (Math.random() * 2)-1;
            
            dx *= this.options.maxDetailDelta;
            dy *= this.options.maxDetailDelta;
            
            this.detailX = -this.options.maxDetailDelta -dx;
            this.detailY = -this.options.maxDetailDelta -dy;
            
            this.detailAnimatorX.start(this.detailX, this.detailX+dx);
            this.detailAnimatorY.start(this.detailY, this.detailY+dy);
            
            this.hasToShowDetail = true;
        }else{
            dx = this.getDetailRandom(radius * 0.01, radius * 0.001);
            dy = this.getDetailRandom(radius * 0.01, radius * 0.001);
            dz = this.getDetailRandom(this.currentCameraZoom * 0.01, this.currentCameraZoom * 0.001);
            
            this.detailAnimatorX.start(this.currentCameraX-dx,this.currentCameraX+dx);
            this.detailAnimatorY.start(this.currentCameraY-dy,this.currentCameraY+dy);
            this.detailAnimatorZ.start(this.currentCameraZoom-dz,this.currentCameraZoom+dz);
        }
        this.showNextDetail.delay(this.options.detailDuration, this);
    },
    getDetailRandom : function (minDelta, maxDelta) {
        var d = maxDelta - minDelta;
        var delta = minDelta + Math.random() * d;
        if(Math.random()<0.5)
            delta *= -1;
        return delta;
    },
    showNextDetail : function () {
        if(this.detailsToShow.length == 0) {
            this.hasToShowDetail = false;
            this.showAllTweet();
            this.showNextText.delay(this.options.allTweetDuration, this);
        } else {
            var d = this.detailsToShow.getRandom();
            this.detailsToShow.splice(this.detailsToShow.indexOf(d), 1);
            this.showDetail(d);
        }
    },
    calculateTextWidth : function (text) {
        this.initTextContext();
        return this.context.measureText(text).width;
    },
    clear : function () {
        this.canvas.width++;
        this.canvas.width--;
    },
    draw : function () {
        this.clear();
        var c = this.context;

        this.initTextContext();

        c.save();
        if(this.hasToShowDetail){
            c.drawImage(this.detailCanvas, this.detailX, this.detailY);
        }else{
            c.translate(this.options.width * .5, this.options.height * .5);
            c.scale(this.currentCameraZoom,this.currentCameraZoom);
            c.translate(-this.currentCameraX, -this.currentCameraY);
            this.drawTweet(this.currentTweet);
    		if(this.currentDetails && this.debugRunningDetails){
    			var d;
    			var size = 40;
    			for(var i=0; i<this.currentDetails.length; i++){
    				d = this.currentDetails[i];
    				c.strokeStyle = "#F00";
    				c.moveTo(d.textX, d.textY - size);
    				c.lineTo(d.textX, d.textY + size);
    				c.moveTo(d.textX-size, d.textY);
    				c.lineTo(d.textX+size, d.textY);
    				c.stroke();
    			}
    		}
        }
        c.restore();
        if(this.hasToFadeOut){
            c.fillStyle = "rgba(0, 0, 0, " + this.fadeAlpha + ")";
            c.fillRect(0,0,this.options.width, this.options.height);
        }
    },
    killResume: function() {
        log("killResume");
        if(this.updateIntervalId>-1) {
            this.kill();
        } else {
            this.resume();
        }
    },
    kill : function () {
        $clear(this.updateIntervalId);
        this.updateIntervalId = -1;
    },
    resume : function () {
        if(this.updateIntervalId>-1)
            return;
        this.updateIntervalId = this.draw.periodical(this.updateInterval, this);
    },
    fadeOut : function ()
    {
        log("fade out!");
        this.fadeOutAnimator = new Fx.Animator(this, "fadeAlpha", this.options.fadeOutAnimationOptions);
        this.fadeOutAnimator.start(0,1);
        this.hasToFadeOut = true;
    }
});
TwitterDetailsCarousel.implement(new Events); // Implements addEvent(type, fn), fireEvent(type, [args], delay) and removeEvent(type, fn)
TwitterDetailsCarousel.implement(new Options);// Implements setOptions(defaults, options)