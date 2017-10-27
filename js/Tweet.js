/**
 * @author christian
 */

Tweet = new Class(
{
    initialize: function(text, author, time, style, TODAY)
    {
        this.text = text;
        this.author = author || "anonimous";
        this.time = time || "once upon a time";
        this.style = style;
        this.TODAY = TODAY;
        
        this.lines;
        this.width;
        this.height;
        this.isNew = true;
        
        this.fixTime();
    },
    
    fixTime : function ()
    {
        var index = this.time.indexOf(":");
        if(index > -1){ // has format like: Fri Aug 10 00:05:04 +0000 2007
            var past = new Date(this.time).getTime();
            var now = this.TODAY ? this.TODAY.getTime() : new Date().getTime();
            var d = now - past;
            if(d < 1000 * 60){
                // seconds
                var sec = Math.ceil(d/1000);
                this.time = sec + " seconds ago";
            }else if(d < 1000 * 60 * 60){
                // minutes
                var minutes = Math.ceil(d/(1000 * 60));
                this.time = minutes + " minutes ago";
            }else if(d < 1000 * 60 * 60 * 24){
                // hours
                var hours = Math.ceil(d/(1000 * 60 * 60));
                this.time = hours + " hours ago";
            }else if(d < 1000 * 60 * 60 * 24 * 365){
                // days
                var days = Math.ceil(d/(1000 * 60 * 60 * 24));
                this.time = days + " days ago";
            }else{
                // years
                var years = Math.ceil(d/(1000 * 60 * 60 * 24 * 365));
                this.time = years + " years ago";
            }
        }
    },
    
    split : function (context, maxLineWidth)
    {
        var minLineLengthInChars = 30;
        var c = context;
        var res = [];
        var words;
        var line;
        var w;
        var width;
        var maxWidth = 0;
        var lines = this.text.split("\n");
        for(var i=0; i<lines.length; i++){
            line = "";
            words = lines[i].split(" ")
            while(words.length>0) {
                w = words[0];
                var newline = line + (line.length>0 ? " " : "") + w;
                width = c.measureText(newline).width;
                if(width < maxLineWidth || newline.length<minLineLengthInChars || line.length == 0) {
                    words.shift();
                    line = newline;
                    maxWidth = Math.max(width, maxWidth);
                } else {
                    res.push(line);
                    line = "";
                }
            }
            res.push(line);
        }
        this.lines = res;
        this.width = maxWidth;
    }
});