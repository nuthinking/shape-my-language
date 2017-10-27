/**
 * @author christian
 */
Detail = new Class(
{
	initialize: function(lett, x, y, options)
	{
		if(!options)
			options = {};
		this.lett = lett;
		this.x = x;
		this.y = y;
		this.radius = options.radius || 0.23;
		this.style = options.style || "regular";
		this.importance = options.importance || 1;
		this.textX = 0; // will be set from the carousel
		this.textY = 0; // will be set from the carousel
	}
});

CharacterDetailsMap = new Class({
	initialize: function(){
		this.map = [];
		this.allDetails = [];
	},
	
	addDetail: function (d)
	{
		if(!this.map[d.style])
			this.map[d.style] = [];
		var details = this.map[d.style][d.lett];
		if(!details){
			details = [];
		}
		details.push(d);
		this.allDetails.push(d);
		this.map[d.style][d.lett] = details;
	},
	
	getAllDetails : function ()
	{
		return this.allDetails;
	},
	
	getDetailForLett : function (lett, style)
	{
		if(!this.map[style])
			return null;
		var details = this.map[style][lett];
		if(!details)
			return null;
		if(details.length==1)
			return details[0];
		return this.pickRandomDetail(details);
	},
	
	pickRandomDetails : function (details, amount)
	{
		var res = details.concat();
		var d;
		var index;
		while(res.length > amount){
			d = this.pickRandomDetail(res);
			index = res.indexOf(d);
			res.splice(index, 1);
		}
		return res;
	},
	
	pickRandomDetail : function (details)
	{
		if(details.length==0)
			return null;
		if(details.length==1)
			return details[0];
		var totalImportance = 0;
		var len = details.length;
		var d;
		for(var i=0; i<len; i++){
			d = details[i];
			totalImportance += d.importance;
		}
		var ran = Math.random() * totalImportance;
		for(var i=0; i<len; i++){
			d = details[i];
			ran -= d.importance;
			if(ran <=0 )
				return d;
		}
		log("[ERROR] pickRandomDetail should pick something");
	},
	
	getDetails: function (text, amount, style)
	{
		if(!style)
			style = 'regular';
		var details = [];
		var lett;
		var d;
		for(var i=0; i<text.length; i++){
			lett = text.substr(i,1);
			d = this.getDetailForLett(lett, style);
			if(d == null)
				continue;
			var attempt = 1;
			while(details.indexOf(d)>-1 && attempt < 3){
				d = this.getDetailForLett(lett, style);
				attempt++;
			}
			if(details.indexOf(d)==-1)
				details.push(d);
		}
		if(details.length == 0){
		    log("ERROR: couldn't find details for: \"" + text + "\"");
		    return [];
		}
		var res = this.pickRandomDetails(details, amount);
		//log("details:");
		//log(res);
		return res;
	}
});
