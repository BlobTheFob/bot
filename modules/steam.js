var flexbot = global.flexbot
var emoji = require("node-emoji")

var steam = {
	key:flexbot.steamapi,
	url:"https://api.steampowered.com/",
	sidbase:0x0110000100000000
}

flexbot.addCommand("steam","All in one Steam command. do `steam help` for arguments.",function(msg,args){
	let sargs = args.split(" ")
	let request = require("request").defaults({encoding:null});
	if(!args || args == "help" || sargs[0] == "help"){
		msg.channel.createMessage("**__Steam Help__**\n\t\u2022 help - This command\n\t\u2022 lookup - Looks up a profile")
	}else if(args == "lookup" || sargs[0] == "lookup"){
		if(sargs[1]){
			msg.channel.createMessage("Searching...")
			.then(m=>{
			request.get(steam.url+"ISteamUser/ResolveVanityURL/v1/?key="+steam.key+"&vanityurl="+sargs[1]+"&format=json",(e,res,body)=>{
					if(!e && res.statusCode == 200){
						let data = JSON.parse(body).response
						if(data.success != 1){
							flexbot.bot.editMessage(msg.channel.id,m.id,"User not found.")
						}else{
							request.get(steam.url+"ISteamUser/GetPlayerSummaries/v2/?key="+steam.key+"&steamids="+data.steamid+"&format=json",(e,res2,body2)=>{
								let data2 = JSON.parse(body2).response.players[0];
								let odd = parseInt(data.steamid)%2 == 1 ? 1 : 0;
								let sid16 = parseInt(((parseInt(data.steamid)-steam.sidbase)-odd)/2,10)
								request.get(steam.url+"IPlayerService/GetSteamLevel/v1/?key="+steam.key+"&steamid="+data.steamid+"&format=json",function(e,lres,lbody){
			if(!e && lres.statusCode == 200){
				let ldata = JSON.parse(lbody).response
				flexbot.bot.editMessage(msg.channel.id,m.id,{embed:{
				author:{
					name:data2.personaname+" ("+sargs[1]+")",
					icon_url:data2.avatarfull
				},
				color:0x1C53A7,
				description:"**Level**: "+ldata.player_level+"\n**SteamID64**: "+data2.steamid+"\n**SteamID16**: STEAM_0:"+odd+":"+sid16+"\n[Avatar]( "+data2.avatarfull+")",
				image:{
					url:data2.avatarfull
				}
			}})
		}
		})
							})
						}
					}else{
						flexbot.bot.editMessage(msg.channel.id,m.id,"Error in request: "+e)
					}
				})
			})
		}else{
			msg.channel.createMessage("No arguments given.")
		}
	}
})