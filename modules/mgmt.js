var flexbot = global.flexbot
var emoji = require("node-emoji");
flexbot.sconfig = flexbot.sconfig ? flexbot.sconfig : require(__dirname+"/../data/sconfig.json");

let sconfig = flexbot.sconfig;

let validSettings = ["greetings","greetMsg","greetChan","farewells","leaveMsg","leaveChan","imgProfiles"];

flexbot.addCommand("config","[Manage Server] Configuration command bot settings",function(msg,args){
	if(msg.channel.permissionsOf(msg.author.id).has("manageGuild") || flexbot.isOwner(msg)){
		let a = args.split(" ");
		if(!args){
			msg.channel.createMessage("__Config Usage__\n\t\u2022 `list` - Lists all config options.\n\t\u2022 `set <setting> <value>` - Sets a setting.\n\t\u2022 `get <setting>` - Gets a setting's value.");
		}else if(a[0] == "list"){
			msg.channel.createMessage("__Config Options__\n\t`grettings` - Enables greetings on join.\n\t`greetMsg` - Message to use if greetings are enabled.\n\t`greetChan` - Channel to send greeting messages to.\n\t`farewells` - Enables farewells on leaves.\n\t`leaveMsg` - Message to use if farewells are enabled.\n\t`leaveChan` - Channel to send farewell messages to.");
		}else if(a[0] == "set"){
			if(validSettings.indexOf(a[1]) > -1){
				let value = a.splice(2,a.length).join(" ");

				let sc = sconfig[msg.guild.id] ? sconfig[msg.guild.id] : {};
				sc[a[1]] = value;

				sconfig[msg.guild.id] = sc;

				msg.channel.createMessage("`"+a[1]+"` is now set to `"+value.replace(/`/g,"\\`")+"`");
				require("fs").writeFileSync(__dirname+"/../data/sconfig.json",JSON.stringify(sconfig));
			}else{
				msg.channel.createMessage("`"+a[1]+"` is not a valid setting. Do `f!config list` for a list of valid settings.");
			}
		}else if(a[0] == "get"){
			if(validSettings.indexOf(a[1]) > -1){
				msg.channel.createMessage("`"+a[1]+"` has a value of `"+sconfig[msg.guild.id][a[1]].replace(/`/g,"\\`")+"`");
			}else{
				msg.channel.createMessage("`"+a[1]+"` is not a valid setting. Do `f!config list` for a list of valid settings.");
			}
		}
	}else{
		msg.channel.createMessage(emoji.get(":no_entry_sign:")+" Lacking permissions, need Manage Server.");
	}
});

let onJoin = function(guild,user){
	let sc = sconfig[guild.id] ? sconfig[guild.id] : {};
	if(sconfig[guild.id]){
		if(sc.greetings == true){
			flexbot.bot.createMessage(sc.greetChan ? sc.greetChan : guild.defaultChannel.id,sc.greetMsg ? sc.greetMsg.replace("{user}",user.username+"#"+user.discriminator).replace("{id}",user.id) : "**"+user.username+"#"+user.discriminator+"** has joined.");
		}
	}
}

if(flexbot.hook_ujoin) flexbot.bot.removeListener("guildMemberAdd",flexbot.hook_ujoin);

flexbot.hook_ujoin = onJoin;
flexbot.bot.on("guildMemberAdd",flexbot.hook_ujoin);

let onLeave = function(guild,user){
	let sc = sconfig[guild.id] ? sconfig[guild.id] : {};
	if(sconfig[guild.id]){
		if(sc.farewells == true){
			flexbot.bot.createMessage(sc.leaveChan ? sc.leaveChan : guild.defaultChannel.id,sc.leaveMsg ? sc.leaveMsg.replace("{user}",user.username+"#"+user.discriminator).replace("{id}",user.id) : "**"+user.username+"#"+user.discriminator+"** has left.");
		}
	}
}

if(flexbot.hook_uleave) flexbot.bot.removeListener("guildMemberRemove",flexbot.hook_uleave);

flexbot.hook_uleave = onLeave;
flexbot.bot.on("guildMemberRemove",flexbot.hook_uleave);

flexbot.addCommand("roleme","Roleme master command",function(msg,args){
	let a = args.split(" ")
	if(!args){
		msg.channel.createMessage("__Roleme Usage__\n\t\u2022 `list` - Lists all eligible roles to be granted.\n\t\u2022 `add <role name>` - Adds a role to be eligible.\n\t\u2022 `delete <role name>` - Removes a role from roleme.\n\t\u2022 `get <role name>` - If eligible role, will grant role to user.\n\t\u2022 `remove <role name>` - Removes a role from a user.");
	}else if(args == "list"){
		let sc = sconfig[msg.channel.guild.id] ? sconfig[msg.channel.guild.id] : {};
		if(sc){
			if(sc.roleme && sc.roleme.length > 0){
				let rs = [];
				for(let r in sc.roleme){
					rs.push(sc.roleme[r].name);
				}
				msg.channel.createMessage("This server has the following roles:\n```\n"+rs.join("\n")+"\n```");
			}else{
				msg.channel.createMessage("This server has no roles.");
			}
		}
	}else if(a[0] == "add"){
		let role = args.split(" ").splice(1,a.length).join(" ");

		if(!role){ msg.channel.createMessage("No arguments given."); }
		flexbot.lookupRole(msg,role)
		.then(r=>{
			let sc = sconfig[msg.channel.guild.id] ? sconfig[msg.channel.guild.id] : {};
			if(sc){
				sc.roleme = sc.roleme ? sc.roleme : [];
				sc.roleme.push({name:r.name,id:r.id});
				msg.channel.createMessage("Added **"+r.name+"** `("+r.id+")` to roleme.");
				sconfig[msg.channel.guild.id] = sc;
				require("fs").writeFileSync(__dirname+"/../data/sconfig.json",JSON.stringify(sconfig));
			}
		});
	}else if(a[0] == "delete"){
		let role = args.split(" ").splice(1,a.length).join(" ");

		if(!role){ msg.channel.createMessage("No arguments given."); }
		flexbot.lookupRole(msg,role)
		.then(r=>{
			let sc = sconfig[msg.channel.guild.id] ? sconfig[msg.channel.guild.id] : {};
			if(sc){
				sc.roleme = sc.roleme ? sc.roleme : [];
				for(let i in sc.roleme){
					if(sc.roleme[i].id === r.id && sc.roleme[i].name == r.name){
						delete sc.roleme[i];
						msg.channel.createMessage("Deleted **"+r.name+"** `("+r.id+")` from roleme.");
						sconfig[msg.channel.guild.id] = sc;
						require("fs").writeFileSync(__dirname+"/../data/sconfig.json",JSON.stringify(sconfig));
					}
				}
			}
		});
	}
});