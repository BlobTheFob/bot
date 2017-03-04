var flexbot = global.flexbot
var request = require("request");

flexbot.addCommand("apod","get the astronaumical picture of the day.",function(msg,args){
	request.get("https://api.nasa.gov/planetary/apod?api_key="+flexbot.nasaapi,function(e,res,body){
    		if(!e && res.statusCode == 200){
       			let data = JSON.parse(body);

			msg.channel.createMessage({embed:{
    				color:0x0B3D91,
    				title:data.title,
    				description:data.date+"\n\n[Full Image]("+data.hdurl+")",
    				image:{
    				    url:data.url
    				},
    				footer:{
    				    text:"Powered by NASA API",
    				    icon_url:"https://api.nasa.gov/images/logo.png"
    				}
			}});
		}
	})
},["aspod","asspod","aspotd","apd"])

let npm = require("api-npm");
let cblock = new RegExp("/`/g");

flexbot.addCommand("npm","Get info on an npm package.",function(msg,args){
	npm.getdetails(args.toLowerCase(),d=>{
		if(d.name){
		msg.channel.createMessage({embed:{
			title:d.name,
			description:d.description,
			color:0xcb3837,
			author:d.author,
			url:"https://npmjs.com/package/"+d.name,
			fields:[
			{name:"Homepage",value:d.homepage,inline:true},
				{name:"Keywords",value:d.keywords.join(", "),inline:true}
			]
		}});
		}else{
			msg.channel.createMessage("Package not found");
		}
	});
});