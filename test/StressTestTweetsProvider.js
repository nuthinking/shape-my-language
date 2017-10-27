/**
 * @author christian
 */
StressTestTweetsProvider = new Class(
{
	initialize: function()
	{
	    this.tweets = [new Tweet("Watts at 01/31/2011 12:03:10.   \n                                   Main Panell: 3171W, Sub Panel: 1661W, Furnace A/C Blower: 170W", "author", null)];
	    this.isLoading = false;
	    this.isLoaded = false;
	    this.currentPage = 15;
	    this.styles = ["bold", "italic", "bold italic"];
	},
	
	loadAllTweets : function ()
	{
	    this.isLoading = true;
	    this.loadNextPage();
	},
	
	loadNextPage : function ()
	{
	    var url = "../php/proxy.php?url=" + escape("http://search.twitter.com/search.json?rpp=100&q=a&page=" + this.currentPage);
	    this.currentPage--;
	    var jsonRequest = new Request.JSON({url: url, onSuccess: this.onPageLoaded.bind(this)}).get();
	},
	
	onPageLoaded : function (resObj)
	{
	    var arr = resObj.results;
	    log("page loaded");
	    this.tweets = this.tweets.concat(this.createTweetsFromObjs(arr))
	    log("total tweets: " + this.tweets.length);
	    if(this.currentPage>0){
	        this.loadNextPage();
	    }else{
	        this.onAllPagesLoaded();
	    }
	},
	
	onAllPagesLoaded : function ()
	{
	    this.fireEvent("load");
	},
		
	load : function ()
	{
	    if(this.isLoading || this.isLoaded)
	       return;
	},
	
	createTweetsFromObjs : function (objs)
	{
	    var res = [];
	    var t;
	    for(var i=0; i<objs.length; i++){
	        t = objs[i];
	        res.push(new Tweet(t.text, t.from_user, this.generateDate(t), this.styles.getRandom()));
	    }
	    return res;
	},
	
	generateDate : function (tweetObj)
    {
        var res = tweetObj.created_at ? tweetObj.created_at : tweetObj.time;
        return res;
    },
    
	
	getNextTweet : function ()
	{
	    log("tweets available: " + this.tweets.length);
	    if(this.tweets.length>0){
	        return this.tweets.shift();
	    }
	    log("TEST ENDED!");
	    return null;
	}
});
StressTestTweetsProvider.implement(new Events); // Implements addEvent(type, fn), fireEvent(type, [args], delay) and removeEvent(type, fn)