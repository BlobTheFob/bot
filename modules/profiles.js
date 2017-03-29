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

let custom_bg = {
	"151344471957569536":"kaos.png",
	"132297363233570816":"brie.png",
	"123601647258697730":"jane.png",
	"150745989836308480":"flex.png",
	"94129005791281152":"zeta.png"
}

let custom_txt = {
	"151344471957569536":"FlexBot Developer",
	"132297363233570816":"FlexBot Contributor",
	"123601647258697730":"FlexBot Contributor",
	"150745989836308480":"FlexBot Creator",
	"94129005791281152":"FlexBot Contributor"
}

flexbot.addCommand("profile","See your level and credits", async function(msg,args){
	let u = msg.author;
	if(args){
		u = await flexbot.lookupUser(msg,args);
	}

	let ud = udata[u.id] ? udata[u.id] : {credits:0,xp:0,totalxp:0,level:1,color:"0xFFFFFF",lastdaily:0,lvlnotif:false};

	ud.color = ud.color ? ud.color : "0xFFFFFF";
	udata[u.id].color = ud.color ? ud.color : "0xFFFFFF";

	let av = await Jimp.read(u.avatarURL.replace("jpg","png").replace("gif","png").replace("a_",""));
	av.resize(72,72);

	let box1 = new Jimp(80,80,parseInt(ud.color+"FF"));
	let box2 = new Jimp(72,72,0x00000088);

	let img = new Jimp(384,160,0x00000000);

	let bg = null;

	if(custom_bg[u.id]){
		bg = await Jimp.read(__dirname+"/../assets/backgrounds/"+custom_bg[u.id]);
	}else if(ud.background){
		bg = await Jimp.read(__dirname+"/../assets/backgrounds/"+ud.background+".png");
	}

	let base = await Jimp.read(__dirname+"/../assets/profile.png");
	let fnt16 = await Jimp.loadFont(__dirname+"/../assets/04b03_16.fnt");
	let fnt24 = await Jimp.loadFont(__dirname+"/../assets/04b03_24.fnt");
	let fnt16c = await Jimp.loadFont(__dirname+"/../assets/04b03_16_c.fnt");

	let b_o = await Jimp.read(__dirname+"/../assets/owner_badge.png");
	b_o.resize(16,16);
	let b_d = await Jimp.read(__dirname+"/../assets/developer_badge.png");
	b_d.resize(16,16);
	let b_c = await Jimp.read(__dirname+"/../assets/contributor_badge.png");
	b_c.resize(16,16);

	if(bg!==null){
		img.composite(bg,0,0);
	}
	img.composite(base,0,0);
	img.composite(box1,16,64);
	img.composite(box2,20,68);
	img.composite(av,20,68);
	img.print(fnt24, 100, 72, u.username+"#"+u.discriminator);

	img.print(fnt16,116,98,"Level "+ud.level);
	img.print(fnt16,116,114,""+ud.credits);
	img.print(fnt16,116,130,"XP: "+ud.xp+"/"+(ud.level*128));

	let ct = custom_txt[u.id];
	if(custom_txt[u.id]){
		if(ct.indexOf("Contributor") > -1){
			img.composite(b_c,2,2);
		}else if(ct.indexOf("Creator") > -1){
			img.composite(b_o,2,2);
		}else if(ct.indexOf("Developer") > -1){
			img.composite(b_d,2,2);
		}

		img.print(fnt16c,20,2,ct);
	}

	img.getBuffer(Jimp.MIME_PNG,(e,f)=>{
		msg.channel.createMessage("",{name:"profile.png",file:f});
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

let bg_url = "https://assets.xn--6s8h.cf/assets/flexbot/backgrounds/";
let backgrounds = [
	"anime_1",
	"anime_2",
	"anime_3",
	"anime_4",
	"anime_5",
	"anime_6",
	"anime_7",
	"anime_8",
	"anime_9",
	"anime_10",
	"holo_1",
	"scenic_1",
	"scenic_2",
	"scenic_3",
	"scenic_4",
	"scenic_5",
	"scenic_6",
	"design_1",
	"design_2",
	"tech_1",
	"tech_2",
	"space_1",
	"space_2",
	"space_3",
	"space_4",
	"black_mesa_east_front",
	"hl2_citadelstreetviewbottom",
	"hl2_citadelstreetviewtop",
	"hl2_trainstationsquare",
	"hl2_transtationback",
	"holo_2",
	"nova_prospekt",
	"station_21_overview",
	"tsu_stare",
	"tsu_stare_2",
	"tsumiki_1"
	];

if(!flexbot.reactionListeners){
	flexbot.reactionListeners = [];
}

flexbot.addCommand("pbackground","Set your profile background",function(msg,args){
	flexbot.awaitForMessage(msg,"Profile Background Menu\n```ini\n[1] Change Background\n[2] Buy Backgrounds\n\n[c] Cancel\n```",(m)=>{
		if(m.content == "c"){
			return msg.channel.createMessage("Canceled.");
		}else if(m.content == 1){
			if(custom_bg[msg.author.id]){
				return msg.channel.createMessage("You already have a custom background, why do you need a regular one?");
			}else if(!udata[msg.author.id].backgrounds || (udata[msg.author.id].backgrounds && udata[msg.author.id].backgrounds.length == 0)){
				return msg.channel.createMessage("You don't have any backgrounds. Why not go buy one?");
			}else if(udata[msg.author.id].backgrounds){
				let bgs = [];
				for(let i=0;i<udata[msg.author.id].backgrounds.length;i++){
					bgs.push("["+(i+1)+"] "+udata[msg.author.id].backgrounds[i]);
				}

				return flexbot.awaitForMessage(msg,"Equip Background\n```ini\nYour current background: "+(udata[msg.author.id].background ? udata[msg.author.id].background : "None")+"\n"+bgs.join("\n")+"\n\n[c] Cancel\n```",(m)=>{
					let value = parseInt(m.content)
					if(m.content == "c"){
						return msg.channel.createMessage("Canceled.");
					}else if(m.content == value){
						let bg = udata[msg.author.id].backgrounds[value-1];

						udata[msg.author.id].background = bg;
						return msg.channel.createMessage("Your background is now set to `"+bg+"`.");
					}
				});
			}
		}else if(m.content == 2){
			let reactions = ["\u2b05","\u27a1","\u2705","\u274c"];

			let index = 0;

			let shop_msg = {
				embed:{
					title:"Background Shop",
					description:"Use reactions to navigate through",
					image:{
						url:bg_url+backgrounds[index]+".png"
					},
					footer:{
						text:"Cost: $1000"
					}
				}
			}

			return msg.channel.createMessage(shop_msg).then(m=>{
				for(let i=0;i<reactions.length;i++){
					m.addReaction(reactions[i]);
				}

				flexbot.reactionListeners[m.id] = function(message,emote,user){
					if(message.id == m.id && user == msg.author.id){
						if(emote.name == reactions[0]){
							index--;
							if(index<0){
								index = backgrounds.length-1;

								shop_msg.embed.image.url = bg_url+backgrounds[index]+".png";
								flexbot.bot.removeMessageReaction(m.channel.id,m.id,reactions[0],user);
								flexbot.bot.editMessage(m.channel.id,m.id,shop_msg);
							}

							shop_msg.embed.image.url = bg_url+backgrounds[index]+".png";
							flexbot.bot.removeMessageReaction(m.channel.id,m.id,reactions[0],user);
							flexbot.bot.editMessage(m.channel.id,m.id,shop_msg);
						}
						if(emote.name == reactions[1]){
							index++;
							if(index >= backgrounds.length){
								index = 0;

								shop_msg.embed.image.url = bg_url+backgrounds[index]+".png";
								flexbot.bot.removeMessageReaction(m.channel.id,m.id,reactions[1],user);
								flexbot.bot.editMessage(m.channel.id,m.id,shop_msg);
							}

							shop_msg.embed.image.url = bg_url+backgrounds[index]+".png";
							flexbot.bot.removeMessageReaction(m.channel.id,m.id,reactions[1],user);
							flexbot.bot.editMessage(m.channel.id,m.id,shop_msg);
						}
						if(emote.name == reactions[2]){
							m.delete();

							let pin = Math.floor(Math.random()*10)+""+Math.floor(Math.random()*10)+""+Math.floor(Math.random()*10)+""+Math.floor(Math.random()*10);
							if(custom_bg[user]){
								msg.channel.createMessage("You already have a custom background, why do you need a regular one?");
							}else if(udata[msg.author.id].credits < 1000){
								msg.channel.createMessage("You do not have enough credits to buy this background.");
							}else{
								let hasBG = false;
								if(udata[msg.author.id].backgrounds){
									for(let i=0;i<udata[msg.author.id].backgrounds.length;i++){
										if(udata[msg.author.id].backgrounds[i] == backgrounds[index]){
											hasBG = true;
										}
									}
								}

								if(hasBG == false){
									flexbot.awaitForMessage(msg,msg.author.mention+", you're about to buy background `"+backgrounds[index]+"` for **"+emoji.get("money_with_wings")+"1000**.\n\n\t- To complete the transaction, type `"+pin+"`.\n\t- To cancel, type `cancel`",(m)=>{
										if(m.content == "cancel"){
											return msg.channel.createMessage("Transaction canceled.");
										}else if(m.content == pin){
											udata[msg.author.id].credits = udata[msg.author.id].credits - 1000;
											udata[msg.author.id].backgrounds = udata[msg.author.id].backgrounds ? udata[msg.author.id].backgrounds : [];
											udata[msg.author.id].backgrounds.push(backgrounds[index]);

											return msg.channel.createMessage("Transaction complete, you can now equip your background.");
										}
									});
								}else{
									msg.channel.createMessage("You already own this background.");
								}
							}
						}
						if(emote.name == reactions[3]){
							flexbot.bot.removeListener("messageReactionAdd",flexbot.reactionListeners[m.id]);
							m.delete();
						}
					}

				}

				flexbot.bot.on("messageReactionAdd",flexbot.reactionListeners[m.id]);
			});
		}
	});
});

flexbot.addCommand("transfer","Send credits to someone",function(msg,args){
	if(!args){
		msg.channel.createMessage("No arguments passed. Usage: `f!transfer user amount`");
	}else{
		let a = args.split(" ");
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
		if(args){
			flexbot.lookupUser(msg,args)
			.then(user=>{
				let amt = 250+Math.floor(Math.random()*150);
				msg.channel.createMessage("**"+msg.author.username+"#"+msg.author.discriminator+"** has given **"+user.username+"#"+user.discriminator+"** **"+emoji.get("money_with_wings")+amt+"** daily credits.");

				udata[user.id].credits = udata[user.id].credits + amt;
			});
		}else{
			let amt = 200+Math.floor(Math.random()*100);
			msg.channel.createMessage("**"+msg.author.username+"#"+msg.author.discriminator+"** got **"+emoji.get("money_with_wings")+amt+"** daily credits.");

			udata[msg.author.id].credits = udata[msg.author.id].credits + amt;
		}

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

flexbot.addCommand("levelnotifs","Toggles level up notifications.",function(msg,args){
	udata[msg.author.id].lvlnotif = !udata[msg.author.id].lvlnotif;
	msg.channel.createMessage("Level up notifications is now set to `"+udata[msg.author.id].lvlnotif+"`");
});