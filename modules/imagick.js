var flexbot = global.flexbot
var emoji = require("node-emoji")
var fs = require("fs")
var jimp = require("jimp")
var request = require("request")

let nmj = function(msg,url){
	jimp.read(url)
	.then(im=>{
		im.quality(Math.floor(Math.random()*5)+1);
		im.getBuffer(jimp.MIME_JPEG,(e,f)=>{
			msg.channel.createMessage("",{name:"needsmorejpeg.jpg",file:f});
		});
	});
}

flexbot.addCommand("needsmorejpeg","Compress an image with JPEG",function(msg,args){
	if(args && args.indexOf("http")>-1){
		nmj(msg,args)
	}else if(msg.attachments.length>0){
		nmj(msg,msg.attachments[0].url)
	}else{
		msg.channel.createMessage("Image not found. Please give URL or attachment.")
	}
},["nmjpeg"]);

let mirror = function(msg,url,type){
	if(type == "waaw"){
		jimp.read(url)
		.then(im=>{
			let a = im.clone();
			let b = im.clone();

			a.crop(im.bitmap.width/2,0,im.bitmap.width/2,im.bitmap.height);
			b.crop(im.bitmap.width/2,0,im.bitmap.width/2,im.bitmap.height);
			a.mirror(true,false);

			let out = new jimp(im.bitmap.width,im.bitmap.height,(e,i)=>{
				i.composite(a,0,0);
				i.composite(b,im.bitmap.width/2,0);
			});

			out.getBuffer(jimp.MIME_PNG,(e,f)=>{
				msg.channel.createMessage("",{name:"waaw.png",file:f});
			});
		});
	}else if(type == "haah"){
		jimp.read(url)
		.then(im=>{
			let a = im.clone();
			let b = im.clone();

			a.crop(0,0,im.bitmap.width/2,im.bitmap.height);
			b.crop(0,0,im.bitmap.width/2,im.bitmap.height);
			b.mirror(true,false);

			let out = new jimp(im.bitmap.width,im.bitmap.height,(e,i)=>{
				i.composite(a,0,0);
				i.composite(b,im.bitmap.width/2,0);
			});

			out.getBuffer(jimp.MIME_PNG,(e,f)=>{
				msg.channel.createMessage("",{name:"haah.png",file:f});
			});
		});
	}else if(type == "woow"){
		jimp.read(url)
		.then(im=>{
			let a = im.clone();
			let b = im.clone();

			a.crop(0,0,im.bitmap.width,im.bitmap.height/2);
			b.crop(0,0,im.bitmap.width,im.bitmap.height/2);
			b.mirror(false,true);

			let out = new jimp(im.bitmap.width,im.bitmap.height,(e,i)=>{
				i.composite(a,0,0);
				i.composite(b,0,im.bitmap.height/2);
			});

			out.getBuffer(jimp.MIME_PNG,(e,f)=>{
				msg.channel.createMessage("",{name:"woow.png",file:f});
			});
		});
	}else if(type == "hooh"){
		jimp.read(url)
		.then(im=>{
			let a = im.clone();
			let b = im.clone();

			a.crop(0,im.bitmap.height/2,im.bitmap.width,im.bitmap.height/2);
			b.crop(0,im.bitmap.height/2,im.bitmap.width,im.bitmap.height/2);
			b.mirror(false,true);

			let out = new jimp(im.bitmap.width,im.bitmap.height,(e,i)=>{
				i.composite(a,0,im.bitmap.height/2);
				i.composite(b,0,0);
			});

			out.getBuffer(jimp.MIME_PNG,(e,f)=>{
				msg.channel.createMessage("",{name:"hooh.png",file:f});
			});
		});
	}
}

flexbot.addCommand("haah","Mirror right half of an image to the left",function(msg,args){
	if(args && args.indexOf("http")>-1){
		mirror(msg,args,"haah")
	}else if(msg.attachments.length>0){
		mirror(msg,msg.attachments[0].url,"haah")
	}else{
		msg.channel.createMessage("Image not found. Please give URL or attachment.")
	}
});

flexbot.addCommand("waaw","Mirror left half of an image to the right",function(msg,args){
	if(args && args.indexOf("http")>-1){
		mirror(msg,args,"waaw")
	}else if(msg.attachments.length>0){
		mirror(msg,msg.attachments[0].url,"waaw")
	}else{
		msg.channel.createMessage("Image not found. Please give URL or attachment.")
	}
});

flexbot.addCommand("woow","Mirror top to bottom",function(msg,args){
	if(args && args.indexOf("http")>-1){
		mirror(msg,args,"woow")
	}else if(msg.attachments.length>0){
		mirror(msg,msg.attachments[0].url,"woow")
	}else{
		msg.channel.createMessage("Image not found. Please give URL or attachment.")
	}
});

flexbot.addCommand("hooh","Mirror bottom to top",function(msg,args){
	if(args && args.indexOf("http")>-1){
		mirror(msg,args,"hooh")
	}else if(msg.attachments.length>0){
		mirror(msg,msg.attachments[0].url,"hooh")
	}else{
		msg.channel.createMessage("Image not found. Please give URL or attachment.")
	}
});

flexbot.addCommand("flip","Flip an image horizontally",function(msg,args){
	if(args && args.indexOf("http")>-1){
		jimp.read(args)
		.then(im=>{
			im.mirror(true,false);
			im.getBuffer(jimp.MIME_PNG,(e,f)=>{
				msg.channel.createMessage("",{name:"flip.png",file:f});
			});
		});
	}else if(msg.attachments.length>0){
		jimp.read(msg.attachments[0].url)
		.then(im=>{
			im.mirror(true,false);
			im.getBuffer(jimp.MIME_PNG,(e,f)=>{
				msg.channel.createMessage("",{name:"flip.png",file:f});
			});
		});
	}else{
		msg.channel.createMessage("Image not found. Please give URL or attachment.")
	}
});

flexbot.addCommand("flop","Flip an image vertically",function(msg,args){
	if(args && args.indexOf("http")>-1){
		jimp.read(args)
		.then(im=>{
			im.mirror(false,true);
			im.getBuffer(jimp.MIME_PNG,(e,f)=>{
				msg.channel.createMessage("",{name:"flop.png",file:f});
			});
		});
	}else if(msg.attachments.length>0){
		jimp.read(msg.attachments[0].url)
		.then(im=>{
			im.mirror(false,true);
			im.getBuffer(jimp.MIME_PNG,(e,f)=>{
				msg.channel.createMessage("",{name:"flop.png",file:f});
			});
		});
	}else{
		msg.channel.createMessage("Image not found. Please give URL or attachment.")
	}
});

flexbot.addCommand("color","Get a color image",function(msg,args){
	if(args){
		if(/[0-9a-fA-F]{6}/.test(args)){
			let col = args.replace("#","").match(/[0-9a-fA-F]{6}/)[0];
			let out = new jimp(128,128,parseInt("0x"+col+"FF"));
			let rgb = jimp.intToRGBA(parseInt("0x"+col+"FF"));

			out.getBuffer(jimp.MIME_PNG,(e,f)=>{
				msg.channel.createMessage({
					content:"Hex: #"+col+"\nRGB: "+rgb.r+","+rgb.g+","+rgb.b,
				},{name:col+".png",file:f});
			});
		}else if(/(\d{1,3}),(\d{1,3}),(\d{1,3})/.test(args)){
			let rgb = args.match(/(\d{1,3}),(\d{1,3}),(\d{1,3})/);
			let col = jimp.rgbaToInt(parseInt(rgb[1]),parseInt(rgb[2]),parseInt(rgb[3]),255);
		
			let out = new jimp(128,128,col);
			rgb = jimp.intToRGBA(col);
			col = col.toString(16);
			col = col.substring(0,col.length-2);
			col = col.length == 4 ? "00"+col : col;

			out.getBuffer(jimp.MIME_PNG,(e,f)=>{
				msg.channel.createMessage({
					content:"Hex: #"+col+"\nRGB: "+rgb.r+","+rgb.g+","+rgb.b,
				},{name:col+".png",file:f});
			});
		}
	}else{
		msg.channel.createMessage("No arguments given. Usage: `f!color #hex or r,g,b`");
	}
});