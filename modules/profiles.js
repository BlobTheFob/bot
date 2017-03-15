var flexbot = global.flexbot;
var emoji = require("node-emoji");
let Jimp = require("jimp");

flexbot.userdata = flexbot.userdata ? flexbot.userdata : require(__dirname+"/../data/udata.json");

let udata = flexbot.userdata;

let updateData = function(msg){
	if(msg.author.bot) return;

	let ud = udata[msg.author.id] ? udata[msg.author.id] : {credits:0,xp:0,totalxp:0,level:1,color:"0xFFFFFF",lastdaily:0,lvlnotif:false};

	let rand = Math.floor(Math.random()*15)+1;

	ud.credits++;
	ud.xp = ud.xp+rand;
	ud.totalxp = ud.totalxp+rand;

	if(ud.xp >= ud.level*128){
		ud.xp = ud.xp - ud.level*128;
		ud.level++;
		
		if(ud.lvlnotif === true){
			flexbot.bot.getDMChannel(msg.author.id)
			.then(c=>{
				c.createMessage(emoji.get("star")+" You are now **level "+ud.level+"**");
			});
		}
	}

	udata[msg.author.id] = ud;
}

let saveData = function(){
	require("fs").writeFileSync(__dirname+"/../data/udata.json",JSON.stringify(udata));
	flexbot.bot.createMessage(flexbot.logid,emoji.get("floppy_disk")+" Saved userdata.");
}

if(flexbot.hook_udata) flexbot.bot.removeListener("messageCreate",flexbot.hook_udata);

flexbot.hook_udata = updateData;
flexbot.bot.on("messageCreate",flexbot.hook_udata);

if(flexbot.udata_timer) clearInterval(flexbot.udata_timer);
flexbot.udata_timer = setInterval(saveData,3600000);

flexbot.addCommand("profile","See your level and credits", async function(msg,args){
	let u = msg.author;
	if(args){
		u = await flexbot.lookupUser(msg,args);
	}

	let ud = udata[u.id] ? udata[u.id] : {credits:0,xp:0,totalxp:0,level:1,color:"0xFFFFFF",lastdaily:0,lvlnotif:false};

	ud.color = ud.color ? ud.color : "0xFFFFFF";
	udata[u.id].color = ud.color ? ud.color : "0xFFFFFF";

	/*msg.channel.createMessage({embed:{
		url:"https://discordapp.com/channels/@me/"+u.id,
		title:"Profile for: "+u.username+"#"+u.discriminator,
		thumbnail:{
			url:u.avatarURL.replace("jpg","png")
		},
		color:parseInt(ud.color ? ud.color : "0xFFFFFF"),
		fields:[
			{name:"Credits",value:emoji.get("money_with_wings")+ud.credits,inline:true},
			{name:"Level",value:""+ud.level,inline:true},
			{name:"XP",value:ud.xp+"/"+ud.level*128,inline:true},
			{name:"Total XP",value:""+ud.totalxp,inline:true}
		],
		footer:{
			text:ud.color == "0xFFFFFF" ? "You can set the side color with f!pcolor." : ""
		}
	}});*/

	Jimp.read(u.avatarURL.replace("jpg","png").replace("gif","png").replace("a_",""))
	.then(i=>{
		let av = i.clone();
		av.resize(72,72);

		let box1 = new Jimp(80,80,parseInt(ud.color+"FF"));
		let box2 = new Jimp(72,72,0x00000088);
		
		let img = new Jimp(256,80,0x1A1D23FF);
		
		Jimp.read("https://assets.xn--6s8h.cf/discord/twemoji/72x72/2b50.png")
		.then(i2=>{
			let star = i2.clone();
			star.resize(16,16);
			Jimp.read("https://assets.xn--6s8h.cf/discord/twemoji/72x72/1f4b8.png")
			.then(i3=>{
				let cash = i3.clone();
				cash.resize(16,16);
				Jimp.loadFont(__dirname+"/../assets/04b03_16.fnt")
				.then(font=>{
					img.composite(box1,0,0);
					img.composite(box2,4,4);
					img.composite(av,4,4);
					img.print(font, 84, 4, u.username+"#"+u.discriminator);
					
					img.composite(star,84,22);
					img.print(font,102,22,"Level "+ud.level);
					
					img.composite(cash,84,40);
					img.print(font,102,40,""+ud.credits);
					
					img.print(font,84,58,"XP: "+ud.xp+"/"+(ud.level*128));
					
					img.getBuffer(Jimp.MIME_PNG,(e,f)=>{
						msg.channel.createMessage("",{name:"profile.png",file:f});
					});
				});
			});
		});
	});
});

flexbot.addCommand("pcolor","Set your profile color",function(msg,args){
	if(!args){
		msg.channel.createMessage("Your current color is **#"+udata[msg.author.id].color.replace("0x","")+"**")
	}else{
		args = args.replace("#","");
		if(/[0-9a-fA-F]{6}/.test(args)){
			let col = args.match(/[0-9a-fA-F]{6}/)[0];
			udata[msg.author.id].color = "0x"+col;
			msg.channel.createMessage(emoji.get("pencil2")+" Your profile color is now #"+col);
		}else{
			msg.channel.createMessage("Arguments did not match hex format. Example: `#xxxxxx`");
		}
	}
});

flexbot.addCommand("transfer","Send credits to someone",function(msg,args){
	if(!args){
		msg.channel.createMessage("No arguments passed. Usage: `f!transfer user,amount`");
	}else{
		let a = args.split(",");
		flexbot.lookupUser(msg,a[0]).then(u=>{
			let amt = parseInt(a[1]);
		
			if(!a[1]){
				msg.channel.createMessage("No amount given. Usage: `f!transfer user,amount`");
			}else if(amt == NaN || amt < 1){
				msg.channel.createMessage("Amount less than 1 or not a number.");
			}else if(udata[msg.author.id].credits < amt){
				msg.channel.createMessage("You do not have enough credits to send.");
			}else{
				let pin = Math.floor(Math.random()*10)+""+Math.floor(Math.random()*10)+""+Math.floor(Math.random()*10)+""+Math.floor(Math.random()*10);
			
				flexbot.awaitForMessage(msg,msg.author.mention+", you're about to send **"+emoji.get("money_with_wings")+amt+"** to **"+u.username+"#"+u.discriminator+"**.\n\n\t- To complete the transaction, type `"+pin+"`.\n\t- To cancel, type `cancel`",(m)=>{
					if(m.content == "cancel"){
						return msg.channel.createMessage("Canceled.");
					}else if(m.content == pin){
						udata[msg.author.id].credits = udata[msg.author.id].credits - amt;
						udata[u.id].credits = udata[u.id].credits + amt;
						
						flexbot.bot.getDMChannel(u.id)
						.then(c=>{
							c.createMessage("Hey, **"+msg.author.username+"#"+msg.author.discriminator+"** just sent you **"+emoji.get("money_with_wings")+amt+"**.");
						});
					
						return msg.channel.createMessage("Transaction complete.");
					}
				});
			}
		});
	}
});

flexbot.addCommand("daily","Get your daily credits",function(msg,args){
	let timestamp = new Date().getTime();
	let u = udata[msg.author.id];
	u.lastdaily = u.lastdaily ? u.lastdaily : 0;
	
	if(timestamp >= u.lastdaily){
		let amt = 200+Math.floor(Math.random()*100);
		msg.channel.createMessage("**"+msg.author.username+"#"+msg.author.discriminator+"** got **"+emoji.get("money_with_wings")+amt+"** daily credits.");
	
		udata[msg.author.id].credits = udata[msg.author.id].credits + amt;
		
		u.lastdaily = timestamp+86400000;
		udata[msg.author.id].lastdaily = u.lastdaily;
	}else{
		let now = new Date();
		let next = new Date(u.lastdaily);
		
		let diff = next-now;
		
		let s = diff/1000
		let h = parseInt(s/3600)
		s=s%3600
		let m = parseInt(s/60)
		s=s%60
		s=parseInt(s)

		let tstr = (h < 10 ? "0"+h : h)+"h, "+(m < 10 ? "0"+m : m)+"m, "+(s < 10 ? "0"+s : s)+"s";
		
		msg.channel.createMessage(msg.author.mention+", your daily resets in **"+tstr+"**.");
	}
});

flexbot.addCommand("levelnotif","Toggles level up notifs.",function(msg,args){
	udata[msg.author.id].lvlnotif = !udata[msg.author.id].lvlnotif;
	msg.channel.createMessage("Level up notifications is now set to `"+udata[msg.author.id].lvlnotif+"`");
});

/*flexbot.addCommand("ptop","Displays top 10 users.",async function(msg,args){
	msg.channel.createMessage("Please wait while data is being retrieved.")
	.then((m)=>{
	let stype = "levels";
	if(args == "levels" || args == "credits"){
		stype = args;
	}
	
	let toplist = [];
	
	let sdata = [];
	for(let u in udata){
		let ud = udata[u];
		Object.keys(udata).forEach(id=>{
			if(udata[id] === ud){
				ud.id = id;
			}
		});
		sdata.push(ud);
	}
	
	sdata.sort((a,b)=>{
		if(stype == "credits"){
			if(a.credits>b.credits)  return -1;
			if(a.credits<b.credits)  return 1;
			if(a.credits==b.credits) return 0;
		}else if(stype == "levels"){
			if(a.level>b.level)  return -1;
			if(a.level<b.level)  return 1;
			if(a.level==b.level) return 0;
		}
	});
	
	sdata = sdata.slice(0,10);
	sdata.forEach(async (d)=>{
		let u = flexbot.bot.users.get(d.id);
		u = u.username ? u : {username:"uncached",discriminator:"0000"};
		toplist.push({
			name:u.username+"#"+u.discriminator+" ("+d.id+")",
			value:"**Credits:** "+emoji.get("money_with_wings")+d.credits+"\n**Level:** "+d.level,
			inline:true
		});
	});
	
		m.delete();
		msg.channel.createMessage({embed:{
			title:"Top 10 users for FlexBot profiles",
			fields:toplist,
			color:stype == "credits" ? 0x00FF00 : 0xFFFF00
		}});
	});
});*/