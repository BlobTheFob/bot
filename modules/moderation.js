var flexbot = global.flexbot
var emoji = require("node-emoji")

flexbot.addCommand("kick","Kick a user",function(msg,args){
	if(msg.channel.permissionsOf(msg.author.id).has("kickMembers")){
		if(msg.channel.permissionsOf(flexbot.bot.user.id).has("kickMembers")){
			if(!args) { msg.channel.createMessage("Specify a user!"); return}

			flexbot.lookupUser(msg,args)
			.then(u=>{
				msg.channel.createMessage(emoji.get("boot")+" **"+u.username+"#"+u.discriminator+"** ("+u.id+") has been kicked by **"+msg.author.username+"#"+msg.author.discriminator+"**.");
				msg.guild.kickMember(u.id);
			});
		}else{
			msg.channel.createMessage("I do not have Kick Members permission.");
		}
	}else{
		msg.channel.createMessage(emoji.get(":no_entry_sign:")+" Lacking permissions, need Kick Members.");
	}
});

flexbot.addCommand("ban","Ban a user (can also hackban)",function(msg,args){
	if(msg.channel.permissionsOf(msg.author.id).has("banMembers")){
		if(msg.channel.permissionsOf(flexbot.bot.user.id).has("banMembers")){
			if(!args) { msg.channel.createMessage("Specify a user!"); return}

			flexbot.lookupUser(msg,args)
			.then(u=>{
				msg.channel.createMessage(emoji.get("hammer")+" **"+u.username+"#"+u.discriminator+"** has been banned by **"+msg.author.username+"#"+msg.author.discriminator+"**.");
				msg.guild.banMember(u.id,7);
			});
		}else{
			msg.channel.createMessage("I do not have Ban Members permission.");
		}
	}else{
		msg.channel.createMessage(emoji.get(":no_entry_sign:")+" Lacking permissions, need Ban Members.");
	}
});

flexbot.addCommand("softban","Softban a user",function(msg,args){
	if(msg.channel.permissionsOf(msg.author.id).has("banMembers")){
		if(msg.channel.permissionsOf(flexbot.bot.user.id).has("banMembers")){
			if(!args) { msg.channel.createMessage("Specify a user!"); return}

			flexbot.lookupUser(msg,args)
			.then(u=>{
				msg.channel.createMessage(emoji.get("hammer")+" **"+u.username+"#"+u.discriminator+"** has been softbanned by **"+msg.author.username+"#"+msg.author.discriminator+"**.");
				msg.guild.banMember(u.id);
				setTimeout(()=>{
					msg.guild.unbanMember(u.id,7);
				},2000);
			});
		}else{
			msg.channel.createMessage("I do not have Ban Members permission.");
		}
	}else{
		msg.channel.createMessage(emoji.get(":no_entry_sign:")+" Lacking permissions, need Ban Members.");
	}
});

flexbot.addCommand("unban","Unban a user",function(msg,args){
	if(msg.channel.permissionsOf(msg.author.id).has("banMembers")){
		if(msg.channel.permissionsOf(flexbot.bot.user.id).has("banMembers")){
			if(!args) { msg.channel.createMessage("Specify a user!"); return}
			if(!args.match(/[0-9]{17,21}/)) { msg.channel.createMessage("Must use ID!"); return}

			flexbot.lookupUser(msg,args)
			.then(u=>{
				msg.channel.createMessage(emoji.get("white_check_mark")+" **"+u.username+"#"+u.discriminator+"** has been unbanned by **"+msg.author.username+"#"+msg.author.discriminator+"**.");
				msg.guild.unbanMember(u.id);
			});
		}else{
			msg.channel.createMessage("I do not have Ban Members permission.");
		}
	}else{
		msg.channel.createMessage(emoji.get(":no_entry_sign:")+" Lacking permissions, need Ban Members.");
	}
});