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

flexbot.addCommand("yt","Look up a YouTube video.",function(msg,args){
	if(!args){
		msg.channel.createMessage("Arguments are required!");
	}else{
		request.get("https://www.googleapis.com/youtube/v3/search?key="+flexbot.gapikey+"&maxResults=10&part=snippet&type=video&q="+encodeURIComponent(args),(err,res,body)=>{
		if(!err && res.statusCode == 200){
			let data = JSON.parse(body).items;
			
			let reactions = ["\u2b05","\u27a1","\u274c"];

			let index = 0;

			let tmsg = {
				embed:{
					title:"Results for `"+args+"`",
					description:"Use reactions to navigate through",
					fields:[
						{name:"Title",value:data[index].snippet.title},
						{name:"Uploader",value:data[index].snippet.channelTitle},
						{name:"Description",value:data[index].snippet.description},
						{name:"Link",value:"https://youtu.be/"+data[index].id.videoId},
					],
					image:{
						url:"https://i.ytimg.com/vi/"+data[index].id.videoId+"/maxresdefault.jpg"
					},
					footer:{
						text:"Result "+(index+1)+"/10"
					}
				}
			}

			return msg.channel.createMessage(tmsg).then(m=>{
				for(let i=0;i<reactions.length;i++){
					m.addReaction(reactions[i]);
				}

				flexbot.reactionListeners[m.id] = function(message,emote,user){
					if(message.id == m.id && user == msg.author.id){
						if(emote.name == reactions[0]){
							index--;
							if(index<0){
								index = 9;

								tmsg.embed = {
					title:"Results for `"+args+"`",
					description:"Use reactions to navigate through",
					fields:[
						{name:"Title",value:data[index].snippet.title},
						{name:"Uploader",value:data[index].snippet.channelTitle},
						{name:"Description",value:data[index].snippet.description},
						{name:"Link",value:"https://youtu.be/"+data[index].id.videoId},
					],
					image:{
						url:"https://i.ytimg.com/vi/"+data[index].id.videoId+"/maxresdefault.jpg"
					},
					footer:{
						text:"Result "+(index+1)+"/10"
					}
				}
								flexbot.bot.removeMessageReaction(m.channel.id,m.id,reactions[0],user);
								flexbot.bot.editMessage(m.channel.id,m.id,tmsg);
							}

							tmsg.embed = {
					title:"Results for `"+args+"`",
					description:"Use reactions to navigate through",
					fields:[
						{name:"Title",value:data[index].snippet.title},
						{name:"Uploader",value:data[index].snippet.channelTitle},
						{name:"Description",value:data[index].snippet.description},
						{name:"Link",value:"https://youtu.be/"+data[index].id.videoId},
					],
					image:{
						url:"https://i.ytimg.com/vi/"+data[index].id.videoId+"/maxresdefault.jpg"
					},
					footer:{
						text:"Result "+(index+1)+"/10"
					}
				}
							flexbot.bot.removeMessageReaction(m.channel.id,m.id,reactions[0],user);
							flexbot.bot.editMessage(m.channel.id,m.id,tmsg);
						}
						if(emote.name == reactions[1]){
							index++;
							if(index >= 10){
								index = 0;

								tmsg.embed = {
					title:"Results for `"+args+"`",
					description:"Use reactions to navigate through",
					fields:[
						{name:"Title",value:data[index].snippet.title},
						{name:"Uploader",value:data[index].snippet.channelTitle},
						{name:"Description",value:data[index].snippet.description},
						{name:"Link",value:"https://youtu.be/"+data[index].id.videoId},
					],
					image:{
						url:"https://i.ytimg.com/vi/"+data[index].id.videoId+"/maxresdefault.jpg"
					},
					footer:{
						text:"Result "+(index+1)+"/10"
					}
				}
								flexbot.bot.removeMessageReaction(m.channel.id,m.id,reactions[1],user);
								flexbot.bot.editMessage(m.channel.id,m.id,tmsg);
							}

							tmsg.embed = {
					title:"Results for `"+args+"`",
					description:"Use reactions to navigate through",
					fields:[
						{name:"Title",value:data[index].snippet.title},
						{name:"Uploader",value:data[index].snippet.channelTitle},
						{name:"Description",value:data[index].snippet.description},
						{name:"Link",value:"https://youtu.be/"+data[index].id.videoId},
					],
					image:{
						url:"https://i.ytimg.com/vi/"+data[index].id.videoId+"/maxresdefault.jpg"
					},
					footer:{
						text:"Result "+(index+1)+"/10"
					}
				}
							flexbot.bot.removeMessageReaction(m.channel.id,m.id,reactions[1],user);
							flexbot.bot.editMessage(m.channel.id,m.id,tmsg);
						}
						if(emote.name == reactions[2]){
							flexbot.bot.removeListener("messageReactionAdd",flexbot.reactionListeners[m.id]);
							m.delete();
						}
					}

				}

				flexbot.bot.on("messageReactionAdd",flexbot.reactionListeners[m.id]);
			});
			}
		});
	}
});