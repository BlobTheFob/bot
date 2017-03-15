var flexbot = global.flexbot
var bot = flexbot.bot
var emoji = require("node-emoji")
var async = require("async")
var request = require('request').defaults({encoding:null});

flexbot.addCommand("setavatar","Changes bots avatar to a url.",function(msg,args){
	if(flexbot.isOwner(msg)){
		if(args.length>0){
			request.get(args,function(e,res,body){
				if(!e && res.statusCode == 200){
					let data = "data:"+res.headers["content-type"]+";base64,"+new Buffer(body).toString("base64");
					var set = flexbot.bot.editSelf({avatar:data})
					set.then(()=>{
						msg.channel.createMessage(emoji.get(":white_check_mark:")+" Avatar set.")
					})
				}
			})
		}else{
			msg.channel.createMessage("No URL given.")
		}
	}else{
		msg.channel.createMessage(emoji.get(":no_entry_sign:")+" No permission.")
	}
})

var statusIcons = {
	online:"<:vpOnline:212789758110334977>",
	idle:"<:vpAway:212789859071426561>",
	dnd:"<:vpDnD:236744731088912384>",
	offline:"<:vpOffline:212790005943369728>"
}

flexbot.addCommand("mods","Moderator list",function(msg,args){
	if(!args){
		var res = "Moderators for **"+msg.guild.name+"**:"

		var a = {
			online:"",
			idle:"",
			dnd:"",
			offline:""
		}

		msg.guild.members.forEach((u)=>{
			if(msg.channel.permissionsOf(u.id).has("kickMembers") && !u.bot){
				a[u.status]+="\n"+statusIcons[u.status]+ u.username+"#"+u.discriminator+(u.nick ? " ("+u.nick+")" : "")
			}
		})

		for(s in a){
			res+=a[s]
		}
		msg.channel.createMessage(res)
	}else if(args == "online" || args == "o"){
		var res = "Online moderators for **"+msg.guild.name+"**:"

		msg.guild.members.forEach((u)=>{
			if(msg.channel.permissionsOf(u.id).has("kickMembers") && !u.bot && u.status != "offline"){
				res+="\n"+statusIcons[u.status]+ u.username+"#"+u.discriminator
			}
		})
		msg.channel.createMessage(res)
	}
})

flexbot.addCommand("purge","Purge/clean x messages from a channel",function(msg,args){
	if(msg.channel.permissionsOf(msg.author.id).has("manageMessages")){
		if(msg.channel.permissionsOf(flexbot.bot.user.id).has("manageMessages")){
			let a = args.split(" ");
			if(a[0] != "all" && a[0] != "user" && a[0] != "filter" && a[0] != "bots"){
				msg.channel.createMessage("__Prune Usage__\n \u2022 `all <count>` - Removes x messsges\n \u2022 `user <user> <count>` - Removes x messages from a user\n \u2022 `filter <string> <count>` - Removes x messages containing a string\n \u2022 `bots <count>` - Removes x messages from bots");
			}else if(a[0] == "all"){
				if(a[1] && parseInt(a[1]) > 0){
				flexbot.bot.getMessages(msg.channel.id,parseInt(a[1])+1)
				.then((msgs)=>{
					var ids = [];
					for (i = 0; i < msgs.length; i++) {
						ids.push(msgs[i].id);
					}
					flexbot.bot.deleteMessages(msg.channel.id, ids);
				})

				msg.channel.createMessage("Cleaned "+a[1]+" messages.")
				.then((m)=>{
					setTimeout(()=>{
						flexbot.bot.deleteMessage(msg.channel.id,m.id)
					},5000)
				})
				}else{
					msg.channel.createMessage("Amount not specified or lower than 1.")
				}
			}else if(a[0] && a[0] == "bots"){
			let count = a[1] ? parseInt(a[1]) : 20;
			let cur = 0;
				flexbot.bot.getMessages(msg.channel.id,50+count)
				.then((msgs)=>{
					var ids = [];
					for (i = 0; i < msgs.length; i++) {
						if(msgs[i].author.bot == true){
							if(cur < count+1){
								ids.push(msgs[i].id);
								cur++
							}
						}
					}
					flexbot.bot.deleteMessages(msg.channel.id, ids);
				})

				msg.channel.createMessage("Cleaned "+count+" bot messages.")
				.then((m)=>{
					setTimeout(()=>{
						flexbot.bot.deleteMessage(msg.channel.id,m.id)
					},5000)
				})
			}
		}else{
			msg.channel.createMessage("I do not have Manage Messages permission.")
		}
	}else{
		msg.channel.createMessage(emoji.get(":no_entry_sign:")+" Lacking permissions, need Manage Messages.")
	}
},["prune"])

flexbot.addCommand("clean","Cleans bot messages",function(msg,args){
	flexbot.bot.getMessages(msg.channel.id,100)
	.then((msgs)=>{
		for (i = 0; i < msgs.length; i++) {
			if (msgs[i].author.id === bot.user.id) {
				flexbot.bot.deleteMessage(msg.channel.id, msgs[i].id);
			}
		}
	})
})

flexbot.addCommand("emoji","Get an image of an emoji/custom emote.",async function(msg,args){
	if(/[0-9]{17,21}/.test(args)){
		let eid = args.match(/[0-9]{17,21}/)
		let ecode = args.replace("<","\\<").replace(">","\\>")

		msg.channel.createMessage({embed:{
			title:args.replace("<","").replace(">","").replace(eid,""),
			color:0x7289DA,
			fields:[
				{name:"ID",value:""+eid,inline:true},
				{name:"Code",value:ecode,inline:true},
				{name:"Image",value:"[Full Size](https://cdn.discordapp.com/emojis/"+eid+".png)"}
			],
			thumbnail:{
				url:"https://cdn.discordapp.com/emojis/"+eid+".png"
			}
		}})
	}else{
			let twemoji = require("twemoji");
			let ehex = twemoji.convert.toCodePoint(args);
			let baseurl = "https://assets.xn--6s8h.cf/discord/twemoji";

			msg.channel.createMessage({embed:{
				title:"Emoji Info",
				fields:[
					{name:"Hex Code",value:ehex},
					{name:"Image",value:"[SVG]("+baseurl+"/svg/"+ehex+".svg) | [36x36]("+baseurl+"/36x36/"+ehex+".png) | [72x72]("+baseurl+"/72x72/"+ehex+".png)"}
				],
				thumbnail:{
					url:baseurl+"/72x72/"+ehex+".png"
				}
			}})
	}
},["emote","e"])

flexbot.addCommand("servers","A pagenated server list",function(msg,args){
	let servers = []
	flexbot.bot.guilds.forEach(s=>{
		servers.push(s)
	})
	servers.sort((a,b)=>{
		if(a.memberCount>b.memberCount) return -1;
		if(a.memberCount<b.memberCount) return 1;
		if(a.memberCount==b.memberCount) return 0;
	})

	let index = 1
	if(args) index=parseInt(args);
	let list = ""
	let page = servers.slice((index-1)*20,(index*20))
	for(i=0;i<page.length;i++){
		let bots = 0;
		let s = page[i]
		s.members.forEach(m=>{if(m.bot) ++bots;})
		list+=((i+1)+((index-1)*20))+". "+s.name+"\n\t"+s.memberCount+" members | "+bots+" bots ("+Math.floor((bots/s.memberCount)*100)+"%)\n"
	}
	msg.channel.createMessage("```md\n# Server List\n"+list+"\n# Total Servers: "+flexbot.bot.guilds.size+"\n> Page "+index+"```")
},["guilds"])

var scolors = {
	online:0x42B581,
	idle:0xFAA619,
	dnd:0xF24145,
	offline:0x747F8D
}

flexbot.addCommand("uinfo","Get info about a user",function(msg,args){
	flexbot.lookupUser(msg,args ? args : msg.author.mention)
	.then(u=>{
		let uroles = [];
		if(msg.guild && msg.guild.members.get(u.id)){
			u = msg.guild.members.get(u.id);
			msg.guild.members.get(u.id).roles.forEach(r=>{
				uroles.push(msg.guild.roles.get(r))
			})
		}
		uroles.sort((a,b)=>{
			if(a.position < b.position){
				return 1;
			}
			if(a.position > b.position){
				return -1;
			}
			return 0;
		});

		let roles = [];
		if(msg.guild){
			uroles.forEach(r=>{
				roles.push(r.name)
			})
		}

		let col = 0x7289DA;
		if(msg.guild && msg.guild.members.get(u.id) && msg.guild.members.get(u.id).roles.length > 0){
			col = uroles[0].color ? uroles[0].color : (uroles[1].color ? uroles[1].color : 0x7289DA);
		}

		msg.channel.createMessage({embed:{
			color:col,

			author:{
				name:"User Info: "+u.username+"#"+u.discriminator,
				icon_url:"https://twemoji.maxcdn.com/36x36/2139.png"
			},
			fields:[
					{name:"ID",value:u.id,inline:true},
					{name:"Nickname",value:u.nick ? u.nick : "None",inline:true},
					{name:"Status",value:u.game ? (u.game.url ? "<:vpStreaming:212789640799846400> [Streaming]("+u.game.url+")" : statusIcons[u.status]+" "+u.status ) : statusIcons[u.status]+" "+u.status,inline:true},
					{name:"Playing",value:u.game ? u.game.name : "Nothing",inline:true},
					{name:"Roles",value:u.guild ? (roles.length > 0 ? roles.join(", ") : "No roles") : "No roles",inline:true},
					{name:"Created At",value:new Date(u.createdAt).toUTCString(),inline:true},
					{name:"Joined At",value:new Date(u.joinedAt).toUTCString(),inline:true},
					{name:"Avatar",value:"[Full Size]("+u.avatarURL+")",inline:true}
				],
			thumbnail:{
				url:u.avatarURL
			}
		}})
	});
})

flexbot.addCommand("sinfo","Info on current server",async function(msg,args){
	let g = msg.guild;
	let a = "";
	if(args){
		if(/[0-9]{17,21}/.test(args)){
			if(flexbot.bot.guilds.get(args.match(/[0-9]{17,21}/g)[0])){
				g = flexbot.bot.guilds.get(args.match(/[0-9]{17,21}/g)[0]);
			}else{
				a = "Could not get guild found, defaulting to current (possibly not in guild)";
				g = msg.guild;
			}
		}else if(!msg.guild){
			msg.channel.createMessage("Cannot use in PMs.")
			return;
		}
	}
	let bots = 0;
	g.members.forEach(m=>{if(m.bot) ++bots;})

	let owner = (await bot.requestHandler.request("GET","/users/"+g.ownerID,true))
	let emojis = [];
	g.emojis.forEach(e=>{
		emojis.push("<:a:"+e.id+">")
	})

	msg.channel.createMessage({content:a,embed:{
		color:0x7289DA,

		author:{
			name:"Server Info: "+g.name,
			icon_url:"https://twemoji.maxcdn.com/36x36/2139.png"
		},
		description:"**Emojis**\n"+emojis.join(","),
		fields:[
			{name:"ID",value:g.id,inline:true},
			{name:"Owner",value:owner.username+"#"+owner.discriminator,inline:true},
			{name:"Members",value:g.memberCount,inline:true},
			{name:"Bots",value:bots+" ("+Math.floor((bots/msg.guild.memberCount)*100)+"% of members)",inline:true},
			{name:"Channels",value:g.channels.size,inline:true},
			{name:"Roles",value:g.roles.size,inline:true},
			{name:"Emojis",value:g.emojis.length,inline:true},
			{name:"Icon",value:"[Full Size](https://cdn.discordapp.com/icons/"+g.id+"/"+g.icon+".jpg)",inline:true}
		],
		thumbnail:{
			url:"https://cdn.discordapp.com/icons/"+g.id+"/"+g.icon+".jpg"
		}
	}})
})

flexbot.addCommand("binfo","Get info on a bot",function(msg,args){
	flexbot.lookupUser(msg,args ? args : msg.author.mention)
	.then(u=>{

		if(!u.bot){ msg.channel.createMessage("User is not a bot!"); return }
		request.get("https://bots.discord.pw/api/bots/"+u.id,{headers:{"Authorization":flexbot.dbotsapi}},(err,res,body)=>{
			if(!err && res.statusCode == 200){
				let data = JSON.parse(body);

				let owners = [];
				for(let i=0;i<data["owner_ids"].length;i++){
					let o = flexbot.bot.users.get(data["owner_ids"][i]);
					owners.push(o.username+"#"+o.discriminator);
				};

				msg.channel.createMessage({embed:{
					color:0x7289DA,

					author:{
						name:"Bot Info: "+u.username+"#"+u.discriminator,
						icon_url:"https://twemoji.maxcdn.com/36x36/2139.png"
					},
					description:data.description,
					fields:[
						{name:"ID",value:u.id,inline:true},
						{name:"Owner(s)",value:owners.join(", "),inline:true},
						{name:"Library",value:data.library,inline:true},
						{name:"Prefix",value:"`"+data.prefix+"`",inline:true},
						{name:"Invite",value:"[Click For Invite]("+data.invite_url+")",inline:true}
					],
					footer:{
						text:"Info provided by Discord Bots API",
						icon_url:"https://cdn.discordapp.com/icons/110373943822540800/"+flexbot.bot.guilds.get("110373943822540800").icon+".jpg"
					},
					thumbnail:{
						url:"https://cdn.discordapp.com/avatars/"+u.id+"/"+u.avatar
					}
				}})
			}else{
				let data = JSON.parse(body);
				if(data.error == "Bot user ID not found"){
					msg.channel.createMessage("No bot info found, bot might not be on Discord Bots or hacked the mainframe.")
				}else{
					msg.channel.createMessage("An error occured with bot list. Blame abal.\n```"+body+"```")
				}
			}
		});
	});
})

flexbot.addCommand("bots","Get bots of a user",function(msg,args){
	flexbot.lookupUser(msg,args ? args : msg.author.mention)
	.then(u=>{
		request.get("https://bots.discord.pw/api/users/"+u.id,{headers:{"Authorization":flexbot.dbotsapi}},async (err,res,body)=>{
			if(!err && res.statusCode == 200){
				let data = JSON.parse(body);
				let bots = [];
				for(let b in data.bots){
					let a = await bot.requestHandler.request("GET","/users/"+data.bots[b].user_id,true);
					bots.push("**"+a.username+"#"+a.discriminator+"**")
				}
				msg.channel.createMessage("**"+u.username+"#"+u.discriminator+"** created "+bots.join(", "))
			}else{
				let data = JSON.parse(body);
				if(data.error == "User ID not found"){
					msg.channel.createMessage("**"+u.username+"#"+u.discriminator+"** has no bots on Discord Bots.")
				}else{
					msg.channel.createMessage("An error occured with bot list. Blame abal.\n```"+body+"```")
				}
			}
		});
	});
})

flexbot.lookupRole = function(msg,str){
	return new Promise((resolve,reject)=>{
		if(/[0-9]{17,21}/.test(str)){
			resolve( msg.guild.roles.get(str.match(/[0-9]{17,21}/)[0]) )
		}

		let userpool = [];
		msg.guild.roles.forEach(r=>{
			if(r.name.toLowerCase().indexOf(str.toLowerCase()) > -1){
				userpool.push(r);
			}
		});

		if(userpool.length > 0){
			if(userpool.length > 1){
				let a = [];
				let u = 0;
				for(let i=0;i<(userpool.length > 50 ? 50 : userpool.length);i++){
					a.push("["+(i+1)+"] "+userpool[i].name)
				}
				flexbot.awaitForMessage(msg,"Multiple roles found. Please pick from this list. \n```ini\n"+a.join("\n")+"\n\n[c] Cancel```",(m)=>{
					let value = parseInt(m.content)
					if(m.content == "c"){
						 msg.channel.createMessage("Canceled.");
						 reject("Canceled");
						 bot.removeListener("messageCreate",flexbot.awaitMsgs[msg.channel.id][msg.id].func);
					}else if(m.content == value){
						resolve(userpool[value-1])
					}
					clearTimeout(flexbot.awaitMsgs[msg.channel.id][msg.id].timer);
				},30000).then(r=>{
					resolve(r)
				});
			}else{
				resolve(userpool[0])
			}
		}else{
			if(!/[0-9]{17,21}/.test(str)){
				msg.channel.createMessage("No roles found.")
				reject("No results.")
			}
		}
	});
}

flexbot.addCommand("rinfo","Get info on a guild role.",function(msg,args){
	if(!msg.guild){
		msg.channel.createMessage("Can only be used in a guild.")
	}else{
		flexbot.lookupRole(msg,args ? args : "")
		.then(r=>{
			let users = 0;
			let bots = 0;
			msg.guild.members.forEach(m=>{
				if(m.roles.indexOf(r.id) > -1){
					if(m.bot) bots++;
					users++;
				}
			});

			let perms = [];
			Object.keys(r.permissions.json).forEach(k=>{
				perms.push(k+" - "+(r.permissions.json[k] == true ? emoji.get(":white_check_mark:") : emoji.get(":x:") ))
			})

			if(perms.length == 0){
				perms.push("None")
			}

			msg.channel.createMessage({embed:{
				color:r.color,
				author:{
					name:"Role Info: "+r.name,
					icon_url:"https://twemoji.maxcdn.com/36x36/2139.png"
				},
				fields:[
					{name:"ID",value:r.id,inline:true},
					{name:"Color",value:r.color ? "#"+(r.color.toString(16).length < 6 ? "0".repeat(6-r.color.toString(16).length) : "")+r.color.toString(16).toUpperCase() : "None",inline:true},
					{name:"Users in role",value:users,inline:true},
					{name:"Bots in role",value:bots,inline:true},
					{name:"Mentionable",value:r.mentionable ? r.mentionable : "false",inline:true},
					{name:"Managed",value:r.managed ? r.managed : "false",inline:true},
					{name:"Position",value:r.position,inline:true},
					{name:"Permissions",value:perms.join("\n")}
				],
			}})
		});
	}
});

flexbot.addCommand("shared","Gets how many servers shared of a user.",function(msg,args){
	flexbot.lookupUser(msg,args ? args : msg.author.mention)
	.then(u=>{
		let shared = [];
		flexbot.bot.guilds.forEach(g=>{
			if(g.members.get(u.id)){
				shared.push(g.name);
			}
		});

		if(u.id == flexbot.bot.user.id){
			msg.channel.createMessage("I'm in "+flexbot.bot.guilds.size+" servers with myself thank you very much.")
		}else{
			msg.channel.createMessage("**"+u.username+"#"+u.discriminator+"** shares **"+shared.length+" server(s)** with FlexBot.\n```\n"+shared.join("\n")+"\n```");
		}
	});
});

flexbot.addCommand("bprefix","Gets prefix of a bot",function(msg,args){
	flexbot.lookupUser(msg,args ? args : msg.author.mention)
	.then(u=>{
		if(!u.bot){ msg.channel.createMessage("User is not a bot!"); return }
		request.get("https://bots.discord.pw/api/bots/"+u.id,{headers:{"Authorization":flexbot.dbotsapi}},(err,res,body)=>{
			if(!err && res.statusCode == 200){
				let data = JSON.parse(body);
				msg.channel.createMessage("**"+u.username+"#"+u.discriminator+"** uses `"+data.prefix+"` as a prefix.")
			}else{
				let data = JSON.parse(body);
				if(data.error == "Bot user ID not found"){
					msg.channel.createMessage("Bot not found on Discord Bots list.")
				}else{
					msg.channel.createMessage("An error occured with bot list. Blame abal.\n```"+body+"```")
				}
			}
		});
	});
});

flexbot.addCommand("bdesc","Gets description of a bot",function(msg,args){
	flexbot.lookupUser(msg,args ? args : msg.author.mention)
	.then(u=>{
		if(!u.bot){ msg.channel.createMessage("User is not a bot!"); return }
		request.get("https://bots.discord.pw/api/bots/"+u.id,{headers:{"Authorization":flexbot.dbotsapi}},(err,res,body)=>{
			if(!err && res.statusCode == 200){
				let data = JSON.parse(body);
				msg.channel.createMessage("**"+u.username+"#"+u.discriminator+"**'s description is: `"+data.description+"`")
			}else{
				let data = JSON.parse(body);
				if(data.error == "Bot user ID not found"){
					msg.channel.createMessage("Bot not found on Discord Bots list.")
				}else{
					msg.channel.createMessage("An error occured with bot list. Blame abal.\n```"+body+"```")
				}
			}
		});
	});
});

flexbot.addCommand("bsite","Gets site of a bot",function(msg,args){
	flexbot.lookupUser(msg,args ? args : msg.author.mention)
	.then(u=>{
		if(!u.bot){ msg.channel.createMessage("User is not a bot!"); return }
		request.get("https://bots.discord.pw/api/bots/"+u.id,{headers:{"Authorization":flexbot.dbotsapi}},(err,res,body)=>{
			if(!err && res.statusCode == 200){
				let data = JSON.parse(body);
				msg.channel.createMessage("**"+u.username+"#"+u.discriminator+"**'s site is: <"+data.website+">")
			}else{
				let data = JSON.parse(body);
				if(data.error == "Bot user ID not found"){
					msg.channel.createMessage("Bot not found on Discord Bots list.")
				}else{
					msg.channel.createMessage("An error occured with bot list. Blame abal.\n```"+body+"```")
				}
			}
		});
	});
});

flexbot.addCommand("binvite","Gets invite of a bot",function(msg,args){
	flexbot.lookupUser(msg,args ? args : msg.author.mention)
	.then(u=>{
		if(!u.bot){ msg.channel.createMessage("User is not a bot!"); return }
		request.get("https://bots.discord.pw/api/bots/"+u.id,{headers:{"Authorization":flexbot.dbotsapi}},(err,res,body)=>{
			if(!err && res.statusCode == 200){
				let data = JSON.parse(body);
				msg.channel.createMessage("**"+u.username+"#"+u.discriminator+"**'s invite is: "+data.invite_url.replace("&permissions=0",""))
			}else{
				let data = JSON.parse(body);
				if(data.error == "Bot user ID not found"){
					msg.channel.createMessage("Bot not found on Discord Bots list.")
				}else{
					msg.channel.createMessage("An error occured with bot list. Blame abal.\n```"+body+"```")
				}
			}
		});
	});
});

flexbot.addCommand("owner","Gets owners of a bot",function(msg,args){
	flexbot.lookupUser(msg,args ? args : msg.author.mention)
	.then(u=>{
		if(!u.bot){ msg.channel.createMessage("User is not a bot!"); return }
		request.get("https://bots.discord.pw/api/bots/"+u.id,{headers:{"Authorization":flexbot.dbotsapi}},async (err,res,body)=>{
			if(!err && res.statusCode == 200){
				let data = JSON.parse(body);

				let owners = [];
				for(let i = 0;i < data.owner_ids.length;i++){
					let a = await bot.requestHandler.request("GET","/users/"+data.owner_ids[i],true);
					owners.push(a.username+"#"+a.discriminator)
				}

				msg.channel.createMessage("**"+u.username+"#"+u.discriminator+"** is owned by:\n```\n"+owners.join("\n")+"```")
			}else{
				let data = JSON.parse(body);
				if(data.error == "Bot user ID not found"){
					msg.channel.createMessage("Bot not found on Discord Bots list.")
				}else{
					msg.channel.createMessage("An error occured with bot list. Blame abal.\n```"+body+"```")
				}
			}
		});
	});
});

let langs = {
	"eris"           : "Javascript",
	"discord.js"     : "Javascript",
	"discord.io"     : "Javascript",
	"discordie"      : "Javascript",
	"discordgo"      : "Golang",
	"nyx"            : "Dart",
	"discord-rs"     : "Rust",
	"discord.net"    : "C#",
	"discord.py"     : "Python",
	"discord4j"      : "Java",
	"discordcr"      : "Crystal",
	"discordia"      : "Lua",
	"litcord"        : "Lua",
	"discordphp"     : "PHP",
	"discordrb"      : "Ruby",
	"discordsharp"   : "C#",
	"discordunity"   : "Unity",
	"dscord"         : "D Lang",
	"javacord"       : "Java",
	"jda"            : "Java",
	"custom library" : "¯\\_(ツ)_/¯"
}

flexbot.addCommand("lib","Gets the used library of a bot",function(msg,args){
	flexbot.lookupUser(msg,args ? args : msg.author.mention)
	.then(u=>{
		if(!u.bot){ msg.channel.createMessage("User is not a bot!"); return }
		request.get("https://bots.discord.pw/api/bots/"+u.id,{headers:{"Authorization":flexbot.dbotsapi}},(err,res,body)=>{
			if(!err && res.statusCode == 200){
				let data = JSON.parse(body);
				msg.channel.createMessage("**"+u.username+"#"+u.discriminator+"** uses the library **"+data.library.replace("Discord Dart","Nyx")+"** (Language: "+langs[data.library.replace("Discord Dart","Nyx").toLowerCase()]+")")
			}else{
				let data = JSON.parse(body);
				if(data.error == "Bot user ID not found"){
					msg.channel.createMessage("Bot not found on Discord Bots list.")
				}else{
					msg.channel.createMessage("An error occured with bot list. Blame abal.\n```"+body+"```")
				}
			}
		});
	});
});

flexbot.addCommand("raffle","Choose a random user",function(msg,args){
	if(!msg.guild){ msg.channel.createMessage("Command cannot be used in PM's"); return}
	let pool = [];
	
	msg.guild.members.forEach(u=>{
		pool.push(u);
	});
	
	let u = pool[Math.floor(Math.random()*pool.length)];
	
	msg.channel.createMessage("I choose **"+u.username+"#"+u.discriminator+"**"+(u.nick ? " ("+u.nick+")" : ""))
});

flexbot.addCommand("yt","Look up a YouTube video.",function(msg,args){
	if(!args){
		msg.channel.createMessage("Arguments are required!");
	}else{
		request.get("https://www.googleapis.com/youtube/v3/search?key="+flexbot.gapikey+"&maxResults=3&part=snippet&type=video&q="+encodeURIComponent(args),(err,res,body)=>{
		if(!err && res.statusCode == 200){
			let data = JSON.parse(body).items;
			
			msg.channel.createMessage({embed:{
				title:"Results for **"+args+"**",
				color:0xcd201f,
				description:"["+data[0].snippet.title+"](https://youtu.be/"+data[0].id.videoId+")\n**Uploaded by:** "+data[0].snippet.channelTitle+"\n```\n"+data[0].snippet.description+"\n```\n\n["+data[1].snippet.title+"](https://youtu.be/"+data[1].id.videoId+")\n**Uploaded by:** "+data[1].snippet.channelTitle+"\n```\n"+data[1].snippet.description+"\n```\n\n["+data[2].snippet.title+"](https://youtu.be/"+data[2].id.videoId+")\n**Uploaded by:** "+data[2].snippet.channelTitle+"\n```\n"+data[2].snippet.description+"\n```"
				}});
			}
		});
	}
});

flexbot.addCommand("discrim","Find users with a certain discrim",function(msg,args){
	if(/[0-9]{4}/.test(args)){
		let discrim = args.match(/[0-9]{4}/)[0];
		let pool = [];
	
		flexbot.bot.users.forEach(u=>{
			if(u.discriminator == discrim){
				pool.push(u.username);
			}
		});
		
		msg.channel.createMessage("__Found **"+pool.length+"** users with discrim **"+discrim+"**__\n"+pool.join(","));
	}else{
		msg.channel.createMessage("Must be in 4 digit format.");
	}
});