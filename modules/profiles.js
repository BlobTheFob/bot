var flexbot = global.flexbot;
var emoji = require("node-emoji");
flexbot.userdata = flexbot.userdata ? flexbot.userdata : require(__dirname+"/../data/udata.json");

let udata = flexbot.userdata;

let updateData = function(msg){
	if(msg.author.bot) return;

	let ud = udata[msg.author.id] ? udata[msg.author.id] : {credits:0,xp:0,totalxp:0,level:1,color:"0xFFFFFF"};

	let rand = Math.floor(Math.random()*15)+1;

	ud.credits++;
	ud.xp = ud.xp+rand;
	ud.totalxp = ud.totalxp+rand;

	if(ud.xp >= ud.level*128){
		ud.xp = ud.xp - ud.level*128;
		ud.level++;
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

	let ud = udata[u.id] ? udata[u.id] : {credits:0,xp:0,totalxp:0,level:1,color:"0xFFFFFF"};

	ud.color = ud.color ? ud.color : "0xFFFFFF";
	udata[u.id].color = ud.color ? ud.color : "0xFFFFFF";

	msg.channel.createMessage({embed:{
		url:"https://discordapp.com/channels/@me/"+u.id,
		title:"Profile for: "+u.username+"#"+u.discriminator,
		thumbnail:{
			url:u.avatarURL
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
	}});
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

flexbot.addCommand("ptop","Displays top 10 users.",async function(msg,args){
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
});