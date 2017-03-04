var flexbot = global.flexbot
var emoji = require("node-emoji")
var request = require('request')
var fs = require("fs")

flexbot.addCommand("echo","Echo, echo, echo",function(msg,args){
	msg.channel.createMessage("\u200b"+args)
},["say"],"[string]")

flexbot.addCommand("status","[Whitelist] Sets bots status",function(msg,args){
	if(flexbot.isOwner(msg)){
		flexbot.bot.editStatus("online",{name:args})
		msg.channel.createMessage("Will do! `f!load randstatus` to reset.")
		if(flexbot.stimer) clearInterval(flexbot.stimer);
	}else{
			msg.channel.createMessage("Nah, you can't control me.")
	}
},[],"[string]")

flexbot.addCommand("avatar","Get an avatar of someone",function(msg,args){
	flexbot.lookupUser(msg,args ? args : msg.author.mention)
	.then(u=>{
		let av = "https://cdn.discordapp.com/avatars/"+u.id+"/"+u.avatar+"."+(u.avatar.startsWith("a_") ? "gif" : "png")+"?size=1024";
		msg.channel.createMessage("Avatar for **"+u.username+"#"+u.discriminator+"**:\n"+av)
	})
},[],"[user]")

flexbot.addCommand("roll","Roll dice",function(msg,args){
	msg.channel.createMessage("Rolling...")
	.then((m)=>{
		var w = "\u2B1C"
		var b = "\uD83D\uDD33"

		var dice = [
			w+w+w+"\n"+w+b+w+"\n"+w+w+w,
			b+w+w+"\n"+w+w+w+"\n"+w+w+b,
			b+w+w+"\n"+w+b+w+"\n"+w+w+b,
			b+w+b+"\n"+w+w+w+"\n"+b+w+b,
			b+w+b+"\n"+w+b+w+"\n"+b+w+b,
			b+w+b+"\n"+b+w+b+"\n"+b+w+b
		]

		var rng = Math.floor(Math.random()*(dice.length))

		setTimeout(()=>{
			flexbot.bot.editMessage(msg.channel.id,m.id,"You rolled: "+(rng+1)+"\n"+dice[rng])
		},2500)
	})
},["dice"])

flexbot.addCommand("info","It's like a business card in a message",function(msg,args){
	let uptime = flexbot.bot.uptime
	let s = uptime/1000
	let h = parseInt(s/3600)
	s=s%3600
	let m = parseInt(s/60)
	s=s%60
	s=parseInt(s)

	let tstr = (h < 10 ? "0"+h : h)+":"+(m < 10 ? "0"+m : m)+":"+(s < 10 ? "0"+s : s)

	msg.channel.createMessage({embed:{
		color:0xEB0763,
		title:"FlexBot v8",
		url:"https://flexbox.xyz/flexbot",
		author:{
			name:"A bot written by Flex#5917",
			icon_url:flexbot.bot.users.get(flexbot.oid).avatarURL
		},
		fields:[
			{name:"Language",value:"Javascript",inline:true},
			{name:"Library",value:"Eris",inline:true},
			{name:"Current Uptime",value:tstr,inline:true},
			{name:"Servers",value:flexbot.bot.guilds.size,inline:true},
			{name:"Current Persona",value:"Akane the Fox",inline:true},
			{name:"Contributors",value:"**KaosHeaven#1812** - Hosting, commands"},
			{name:"Links",value:"[GitHub](https://github.com/LUModder/FlexBot) | [Invite](https://discordapp.com/oauth2/authorize?client_id=173441062243663872&scope=bot) | [Server](https://discord.gg/ZcXh4ek) | [Donate](https://paypal.me/boxofflex)\n(If you donate message me)"}
		]
	}})
},["about"])

flexbot.addCommand("stats","Oooh, numbers",function(msg,args){
	let uptime = flexbot.bot.uptime
	let s = uptime/1000
	let h = parseInt(s/3600)
	s=s%3600
	let m = parseInt(s/60)
	s=s%60
	s=parseInt(s)

	let tstr = (h < 10 ? "0"+h : h)+":"+(m < 10 ? "0"+m : m)+":"+(s < 10 ? "0"+s : s)

	let cmdcount = 0
	for(c in flexbot.cmds){cmdcount++}

	msg.channel.createMessage("```ini\n; FlexBot Stats\nservers = "+flexbot.bot.guilds.size+"\ncommands = "+cmdcount+"\nusers = "+flexbot.bot.users.size+"\n[Uptime: "+tstr+"]\n```")
})

flexbot.addCommand("invite","Invite FlexBot to your server!",function(msg,args){
	msg.channel.createMessage({embed:{
		title:"Invites",
		description:"[Minimal](https://discordapp.com/oauth2/authorize?client_id=173441062243663872&scope=bot) | [With Permissions](https://discordapp.com/oauth2/authorize?client_id=173441062243663872&scope=bot&permissions=335932486) | [Support Server](https://discord.gg/6Ky2BYY)"
	}})
})

flexbot.addCommand("calc","Do maths",function(msg,args){
	let math = require("mathjs");
	msg.channel.createMessage("Result: "+math.eval(args));
},["math"],"[math stuffs]")

flexbot.addCommand("ship","Ship two users.",async function(msg,args){
	let a = args.split(" ");
	let u1 = {};
	let u2 = {};
	if(!a[1]){
		let u = await flexbot.lookupUser(msg,a[0])

		if(u.id == msg.author.id){
			msg.channel.createMessage(emoji.get(":heart:")+" **"+msg.author.username+"** ships themself with... themself... Sure are lonely, aren't ya... That's okay, you have me. *hugs*")
		}else if(u.id == "132297363233570816" && msg.author.id == "150745989836308480" || u.id == "150745989836308480" && msg.author.id == "132297363233570816"){
			msg.channel.createMessage(emoji.get(":green_heart:")+" **"+msg.author.username+"** ships themself with **"+u.username+"** (100% compatibility) "+emoji.get(":yellow_heart:")+"\n(totaly not rigged, trust me.)")
		}else{
			msg.channel.createMessage(emoji.get(":heart:")+" **"+msg.author.username+"** ships themself with **"+u.username+"** ("+(Math.floor(Math.random()*100)+1)+"% compatibility)")
		}
	}else if(a[1]){
		u1 = await flexbot.lookupUser(msg,a[0])
		u2 = await flexbot.lookupUser(msg,a[1])

		if(u1.id == "132297363233570816" && u2.id == "150745989836308480" || u2.id == "132297363233570816" && u1.id == "150745989836308480"){
			msg.channel.createMessage(emoji.get(":green_heart:")+" **"+msg.author.username+"** ships **"+u1.username+"** with **"+u2.username+"** (100% compatibility) "+emoji.get(":yellow_heart:")+"\n(totaly not rigged, trust me.)")
		}else{
			msg.channel.createMessage(emoji.get(":heart:")+" **"+msg.author.username+"** ships **"+u1.username+"** with **"+u2.username+"** ("+(Math.floor(Math.random()*100)+1)+"% compatibility)")
		}
	}else{
		msg.channel.createMessage("Not enough arguments.")
	}
},[],"[user1],<user2>")

flexbot.addCommand("cat","The typical picture of a cat command",function(msg,args){
	let request = require("request");
	request.get("http://random.cat/meow",function(e,res,body){
		let img = JSON.parse(body).file;
		msg.channel.createMessage({
			content:"meow, have a cat",
			embed:{
				color:Math.floor(Math.random()*16777216),
				image:{
					url:img
				},
				footer:{
					text:"Image provided by random.cat"
				}
			}
		});
	});
})

flexbot.addCommand("dog","The typical picture of a dog command",function(msg,args){
	let request = require("request");
	request.get("http://random.dog/woof",function(e,res,body){
		if(!e && res.statusCode == 200){
			let img = "http://random.dog/"+body;
			msg.channel.createMessage({
				content:"borf, have a mutt",
				embed:{
					color:Math.floor(Math.random()*16777216),
					image:{
						url:img
					},
					footer:{
						text:"Image provided by random.dog"
					}
				}
			});
		}else{
			msg.channel.createMessage("An error occured, try again later.\n\n```\n"+e+"```")
		}
	});
})

flexbot.addCommand("meirl","Pull a random post from r/me_irl",function(msg,args){
	let request = require("request");
	request.get("http://www.reddit.com/r/me_irl/new.json?sort=default&count=50",function(e,r,b){
		if(!e && r.statusCode == 200){
			let data = JSON.parse(b).data.children;
			let post = data[Math.floor(Math.random()*data.length)].data;
			post.url = post.url.replace(/http(s)?:\/\/(m\.)?imgur\.com/g,"https://i.imgur.com");
			post.url = post.url.replace(new RegExp('&amp;','g'),"&");
			post.url = post.url.replace("/gallery","");
			post.url = post.url.replace("?r","");
			
			if(post.url.indexOf("imgur") > -1 && post.url.substring(post.url.length-4,post.url.length-3) != "."){
				post.url+=".png";
			}
			
			msg.channel.createMessage({embed:{
				title:post.title,
				url:"https://reddit.com"+post.permalink,
				author:{
					name:"u/"+post.author
				},
				description:"[Image/Video]("+post.url+")",
				image:{
					url:encodeURI(post.url)
				},
				footer:{
					text:"Powered by r/me_irl"
				}
			}});
		}else{
			msg.channel.createMessage("An error occured, try again later.\n\n```\n"+e+"```")
		}
	});
});

flexbot.addCommand("copypasta","Stuff to copypaste",function(msg,args){
	let request = require("request");
	request.get("http://www.reddit.com/r/copypasta/new.json?sort=default&count=50",function(e,r,b){
		if(!e && r.statusCode == 200){
			let data = JSON.parse(b).data.children;
			let post = data[Math.floor(Math.random()*data.length)].data;
			
			msg.channel.createMessage(post.selftext.substring(0,1996-18-post.permalink.length)+(post.selftext.length > (1996-18-post.permalink.length) ? "...\nhttps://reddit.com"+post.permalink : ""));
		}else{
			msg.channel.createMessage("An error occured, try again later.\n\n```\n"+e+"```")
		}
	});
});

let blacklist = ["-comic","-cleavage","-bikini","-naked","-naked_towel","-underwear","-briefs","-blood","-fat","-animatronic"]

flexbot.addCommand("foxgirl","Gets a random image of a foxgirl",function(msg,args){
	request.get("https://ibsear.ch/api/v1/images.json?q=foxgirl%20"+blacklist.join("%20")+"&limit=75&shuffle=20",function(err,res,body){
		if(!err && res.statusCode == 200){
			let data = JSON.parse(body);
			let img = data[Math.floor(Math.random()*data.length)]
			
			msg.channel.createMessage({content:"awuuuu~",embed:{
				description:"```"+img.tags+"```",
				image:{
					url:"https://"+img.server+".ibsear.ch/"+img.path
				}
			}})
		}else{
			msg.channel.createMessage("An error occured, try again later.")
		}
	});
},["awuuuu"]);

flexbot.addCommand("nadeko","e",function(msg,args){
	msg.channel.createMessage(msg.author.mention+" did it. "+emoji.get("persevere")+emoji.get("gun"));
});

flexbot.addCommand("setnick","[Whitelist] Set's bot nick.",function(msg,args){
	if(flexbot.isOwner(msg)){
		if(!msg.guild){ msg.channel.createMessage("Cannot be used in PM's"); return}
		flexbot.bot.editNickname(msg.guild.id,args ? args : "");
		if(!args){
			msg.channel.createMessage(emoji.get("pencil2")+"  Reset nickname");
		}else{
			msg.channel.createMessage(emoji.get("pencil2")+"  Changed nickname to `"+args+"`");
		}
	}else{
		msg.channel.createMessage(emoji.get("no_entry_sign")+" No permission, edit it manually if you can.");
	}
});

flexbot.addCommand("respects","Press F to pay respects",function(msg,args){
	msg.channel.createMessage({embed:{
		description:"<:Respects:269889128768864257> **"+msg.author.username+"** has paid respects"+(args ? " for **"+args+"**" : "")+". <:Respects:269889128768864257>"
	}})
});

flexbot.addCommand("ytimg","Get a thumbnail of an image.",function(msg,args){
	if(args.indexOf("youtube.com") > -1){
		let id = args.match(/https?:\/\/(www\.)?(m\.)?youtube.com\/watch\?v=(.*)/)[3]
		
		msg.channel.createMessage("https://i.ytimg.com/vi/"+id+"/maxresdefault.jpg")
	}else if(args.indexOf("youtu.be") > -1){
		let id = args.match(/https?:\/\/(www\.)?youtu\.be\/(.*)/)[2];
		
		msg.channel.createMessage("https://i.ytimg.com/vi/"+id+"/maxresdefault.jpg")
	}else{
		msg.channel.createMessage("Video not found, be sure it's either a `youtube.com` or `youtu.be` link.");
	}
});

flexbot.addCommand("poll","Make a poll.",function(msg,args){
	if(!args){
		msg.channel.createMessage("Usage: f!poll topic|option 1|option 2|...");
	}else{
		let opt = args.split("|");
		let topic = opt[0];
		opt = opt.splice(1,9);
		
		if(opt.length <2){
			msg.channel.createMessage("A minimum of two options are required.");
		}else{
		
			let opts = [];
		
			for(let i = 0;i<opt.length;i++){
				opts.push((i+1)+"\u20e3: "+opt[i]);
			}
			msg.channel.createMessage("**"+msg.author.username+"#"+msg.author.discriminator+"** has started a poll:\n**__"+topic+"__**\n"+opts.join("\n"))
			.then(m=>{
				for(let i = 0;i<opt.length;i++){
					setTimeout(()=>{
						m.addReaction((i+1)+"\u20e3");
					},750*i);
				}
			});
		}
	}
});

let ball = ["It is certain","It is decidedly soWithout a doubt","Yes, definitely","You may rely on it","As I see it, yes","Most likely","Outlook good","Yes","Signs point to yes","Reply hazy try again","Ask again later","Better not tell you now","Cannot predict now","Concentrate and ask again","Don't count on it","My reply is no","My sources say noOutlook not so good","Very doubtful"]

flexbot.addCommand("8ball","Am I a typical bot yet?",function(msg,args){
	msg.channel.createMessage(emoji.get("8ball")+" "+ball[Math.floor(Math.random()*ball.length)]);
});

flexbot.addCommand("akane","Gets a random image of Akane",function(msg,args){
	request.get("https://ibsear.ch/api/v1/images.json?q=akane_(naomi)%20"+blacklist.join("%20")+"&limit=75&shuffle=20",function(err,res,body){
		if(!err && res.statusCode == 200){
			let data = JSON.parse(body);
			let img = data[Math.floor(Math.random()*data.length)]
			
			msg.channel.createMessage({embed:{
				description:"```"+img.tags+"```",
				image:{
					url:"https://"+img.server+".ibsear.ch/"+img.path
				}
			}})
		}else{
			msg.channel.createMessage("An error occured, try again later.")
		}
	});
});

flexbot.addCommand("braixen","Gets a random image of Braixen",function(msg,args){
	request.get("https://ibsear.ch/api/v1/images.json?q=braixen%20"+blacklist.join("%20")+"&limit=75&shuffle=20",function(err,res,body){
		if(!err && res.statusCode == 200){
			let data = JSON.parse(body);
			let img = data[Math.floor(Math.random()*data.length)]
			
			msg.channel.createMessage({embed:{
				description:"```"+img.tags+"```",
				image:{
					url:"https://"+img.server+".ibsear.ch/"+img.path
				},
				footer:{
					icon_url:"http://i.imgur.com/JhRkEs3.png",
					text:"Kyuu~"
				}
			}})
		}else{
			msg.channel.createMessage("An error occured, try again later.")
		}
	});
});

flexbot.addCommand("brianna","owo",function(msg,args){
	msg.channel.createMessage("is cute. "+emoji.get("yellow_heart"))
});

flexbot.addCommand("hug","Give someone a hug.",function(msg,args){
	flexbot.lookupUser(msg,args)
	.then(u=>{
		msg.channel.createMessage("**"+msg.author.username+"** gave **"+u.username+"** a nice warm hug.")
	});
});

flexbot.addCommand("pat","Give someone a pat on the head.",function(msg,args){
	let pats = fs.readdirSync(__dirname+"/../img/pats/pats");
	let img = pats[Math.floor(Math.random()*pats.length)];

	flexbot.lookupUser(msg,args)
	.then(u=>{
		msg.channel.createMessage("**"+msg.author.username+"** gave **"+u.username+"** a gentle and lovely pat on the head.",{file:fs.readFileSync(__dirname+"/../img/pats/pats/"+img),name:img});
	});
});

flexbot.addCommand("cuddle","Cuddle with someone.",function(msg,args){
	flexbot.lookupUser(msg,args)
	.then(u=>{
		msg.channel.createMessage("**"+msg.author.username+"** cuddles up with **"+u.username+"** cutely.")
	});
});

flexbot.addCommand("poke","Poke someone.",function(msg,args){
	flexbot.lookupUser(msg,args)
	.then(u=>{
		msg.channel.createMessage("**"+msg.author.username+"** gently pokes **"+u.username+"**.")
	});
});