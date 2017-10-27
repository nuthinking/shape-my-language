/**
 * @author christian
 */
TweetsProvider = new Class({
	initialize: function(prepopulatedUrl, liveUrl)
	{
	    this.prepopulatedUrl = prepopulatedUrl;
        this.liveUrl = liveUrl;
	    
		this.prepopulatedTweets = [];
		this.prepopulatedIndex = -1;
		this.liveTweets = [];
		this.liveIndex = -1;
		this.favoriteTweets = [];
		this.favoriteIndex = -1;
		
		this.sortingOrder = ["f","l","p","f","l","f"];
	},
	
	getPrefixWithType : function (type)
	{
	    switch(type){
	        case "f": return "favorite";
	        case "l" : return "live";
	        case "p" : return "prepopulated";
	    }
	},
	
	getArrayNameWithType : function (type)
	{
	    return this.getPrefixWithType(type) + "Tweets";
	},
	
	getIndexNameWithType : function (type)
	{
	    return this.getPrefixWithType(type) + "Index";
	},
	
	getNextTweetTypeToProvide : function ()
	{
	    if(!this.typesToSort || this.typesToSort.length==0){
	        this.typesToSort = this.sortingOrder.concat();
	    }
	    var type = this.typesToSort.shift();
	    return type;
	},
	
	prepopulate: function (tweetObjs)
	{
	    var t;
	    for(var i=0; i<tweetObjs.length; i++){
            t = tweetObjs[i];
            this.prepopulatedTweets.push(new Tweet(t.text, t.author, t.time, t.style, t.fontWeight));
        }
	},
	
	load : function ()
	{
	    //this.loadPrepopulated();
		this.loadLive();
	},
	
	loadPrepopulated : function ()
	{
	     log("load prepopulated...");  
	     var jsonRequest = new Request.JSON({url: this.prepopulatedUrl, onSuccess: this.onPrepopulatedLoaded.bind(this)}).get();
	},
	
	onPrepopulatedLoaded : function (tweetObjs)
	{
	    if(tweetObjs && tweetObjs.length>0){
	       this.prepopulatedTweets = this.createTweetsFromObjs(tweetObjs);
	       log("loaded " + this.prepopulatedTweets.length + " prepopulated tweets");
	    }else{
	       log("Couldn't load prepopulated tweets correctly!");
	    }
	    this.loadLive();
	},
	
	loadLive : function ()
	{
	    log("load live...");
	    var jsonRequest = new Request.JSON({url: this.liveUrl, onSuccess: this.onLiveLoaded.bind(this)}).get();
	},
	
	onLiveLoaded : function (tweetObjs)
	{
	    log("live loaded");
	    if(tweetObjs && tweetObjs.length>0){
	        var tweets = this.createTweetsFromObjs(tweetObjs);
	        log("loaded " + tweets.length + " live tweets");
	        this.addTweets(tweets);
	        // log("live:" + this.liveTweets.length + " favs:" + this.favoriteTweets.length);
	    }else{
	        log("Couldn't load live tweets correctly!");
	    }
	    this.onload();
	},
	
	addTweets : function (tweets)
	{
	    // split live tweets from favorites
	    tweets.each(function(t, index){
	        if(t.favorited){
	            this.addTweetIfMissing(t, this.favoriteTweets);
	        }else{
	            this.addTweetIfMissing(t, this.liveTweets);
	        }
        }.bind(this));
	},
	
	addTweetIfMissing : function(tweet, array)
	{
	    var isPresent = false;
	    var t;
	    for(var i=0; i<array.length; i++){
	        t = array[i];
	        if(t.text == tweet.text){
	            isPresent = true;
	            break;
	        }
	    }
	    if(!isPresent){
	        array.push(tweet);
	    }
	},
	
	onload : function (tweetObjs)
	{
	    log("all tweets loaded");
	    if(this.prepopulatedTweets.length > 0
	        || this.liveTweets.length > 0)
	    {
	        this.fireEvent("load");
	    }else{
	        this.fireEvent("error", ["Couldn't load any tweet"]);
	    }
	},
	
	createTweetsFromObjs : function (objs)
	{
	    var res = [];
	    var t;
	    for(var i=0; i<objs.length; i++){
	        t = objs[i];
	        res.push(new Tweet(t.text, t.from_user, this.generateDate(t), t.style, t.fontWeight));
	    }
	    return res;
	},
	
	generateDate : function (tweetObj)
	{
	    var res = tweetObj.created_at ? tweetObj.created_at : tweetObj.time;
	    return res;
	},
	
	getNextTweetWithType : function (type)
	{
	    var res;
	    var array = this[this.getArrayNameWithType(type)];
	    var indexName = this.getIndexNameWithType(type);
	    // log("get tweet: " + type + " arr: " + array.length + " index: " + this[indexName]);
	    if(array || array.length>0){
	        // check if a new one is available otherwise use an old one
	        var newIndex = this.getNextNewIndex(array);
	        if(newIndex > -1){
	            res = array[newIndex];
	            res.isNew = false;
	        }else{
	            this[indexName]++;
                if(this[indexName]>=array.length){
                    this[indexName] = 0;
                }
                res = array[this[indexName]];
	        }
	    }
	    return res;
	},
	
	getNextNewIndex : function (array)
	{
	    var t;
	    for(var i=0; i<array.length; i++){
	        t = array[i];
            if(t.isNew){
                return i;
            }
        }
        return -1;
	},
	
	getNextTweet : function ()
	{
	    var type = this.getNextTweetTypeToProvide();
	    var tweet = this.getNextTweetWithType(type);
//	    log(tweet);
	    while(!tweet){
	        type = this.getNextTweetTypeToProvide();
	        tweet = this.getNextTweetWithType(type);
//    	    log(tweet);
	    }
		// if(!this.tweetsToProvide || this.tweetsToProvide.length == 0){
		//     this.tweetsToProvide = this.prepopulatedTweets.concat(this.liveTweets); // this needs to be changed
		// }
		// var tweet = this.tweetsToProvide.getRandom();
		// this.tweetsToProvide.splice(this.tweetsToProvide.indexOf(tweet), 1);
		return tweet;
	}
});
TweetsProvider.implement(new Events); // Implements addEvent(type, fn), fireEvent(type, [args], delay) and removeEvent(type, fn)