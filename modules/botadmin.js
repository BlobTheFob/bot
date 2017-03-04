var flexbot = global.flexbot
var emoji = require("node-emoji")

flexbot.addCommand("suggestion","Leave a suggestion",function(msg,args){
	if(!args){msg.channel.createMessage("Please add a message.")}else{
	msg.channel.createMessage("Suggestion submitted, expect a reply back.")
	flexbot.bot.createMessage("280734727240024064",{
		embed:{
			author:{
				name:"Suggestion by: "+msg.author.username+"#"+msg.author.discriminator,
				icon_url:"http://www.famfamfam.com/lab/icons/silk/icons/lightbulb_add.png"
			},
			description:args+"\n\n**Channel ID**: "+msg.channel.id+"\n**User ID**: "+msg.author.id,
			color:0xdfdf00,
			footer:{
				text:msg.guild ? "#"+msg.channel.name+" on "+msg.guild.name : "Private Message",
				icon_url:msg.guild ? "https://cdn.discordapp.com/icons/"+msg.guild.id+"/"+msg.guild.icon+".jpg" : "http://www.famfamfam.com/lab/icons/silk/icons/user_comment.png"
			},
			timestamp:new Date()
		}
	});
	}
},["suggest","idea"])

flexbot.addCommand("complaint","Leave a complaint",function(msg,args){
	if(!args){msg.channel.createMessage("Please add a message.")}else{
	msg.channel.createMessage("Left complaint.")
	flexbot.bot.createMessage("284349667586867200",{
		embed:{
			author:{
				name:"Complaint by: "+msg.author.username+"#"+msg.author.discriminator,
				icon_url:"http://www.famfamfam.com/lab/icons/silk/icons/exclamation.png"
			},
			description:args,
			color:0xdf0000,
			footer:{
				text:msg.guild ? "#"+msg.channel.name+" on "+msg.guild.name : "Private Message",
				icon_url:msg.guild ? "https://cdn.discordapp.com/icons/"+msg.guild.id+"/"+msg.guild.icon+".jpg" : "http://www.famfamfam.com/lab/icons/silk/icons/user_comment.png"
			},
			timestamp:new Date()
		}
	});
	}
},["complain"])

flexbot.addCommand("sreply","[Whitelist] Reply to a suggestion.",function(msg,args){
	let a = args.split("|");
	if(flexbot.isOwner(msg)){
		let cid    = a[0];
		let uid    = a[1];
		let status = a[2];
		let res    = a.splice(3,a.length).join(",");

		if(!cid || !uid || !status || !res || !status == "accepted" || !status == "rejected"){
			msg.channel.createMessage("One or more arguments missing. Format: `channelid|userid|[accepted,rejected]|message`")
		}else{
			let c = flexbot.bot.getChannel(cid);
			let u = flexbot.bot.users.get(uid);
			c.createMessage({
				content:u.mention+", a reply on your FlexBot suggestion:",
				embed:{
					author:{
						name:status == "accepted" ? "Accepted" : "Rejected",
						icon_url:"http://www.famfamfam.com/lab/icons/silk/icons/"+(status == "accepted" ? "tick" : "cross")+".png"
					},
					color:status == "accepted" ? 0x00df00 : 0xdf0000,
					description:res,
					footer:{
						text:"\u200b",
						icon_url:"http://www.famfamfam.com/lab/icons/silk/icons/time.png"
					},
					timestamp:new Date()
				}
			});
			msg.channel.createMessage(":ok_hand:")
		}
	}else{
		msg.channel.createMessage(emoji.get("no_entry_sign")+" No permission.");
	}
});

flexbot.addCommand("sys","[Bot Owner] very dangerous command.",function(msg,args){
	if(flexbot.isOwner(msg)){
		args = args.replace("rm -rf","echo")
		require('child_process').exec(args,(e,out,err)=>{
			if(e){
				msg.channel.createMessage("Error\n```"+e+"```");
			}else{
				msg.channel.createMessage("```\n"+out+"\n```");
			}
		});
	}else{
		msg.channel.createMessage(emoji.get("no_entry_sign")+" No permission.");
	}
});