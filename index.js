var Discord = require("discord.js");
var Jimp = require("jimp");
var fs = require('fs');
var request = require("request");
const Prefix = "uc."

var bot = new Discord.Client;

request.get('https://api.undercards.net/api/v1/cards', function (error, response, body) {
    if (!error && response.statusCode == 200) {
        let result = JSON.parse(body);
        let cardData = result.response;

        bot.on("ready", function() {
            console.log("Bot connected.")
        });

        bot.on("message", function(message) {

            if (message.content.startsWith(Prefix + "view")) {
                if (message.content.startsWith(Prefix + "view card")) {

                    var id2 = -1;
                    var val = message.content.substring(13);
                    var filteredObj = cardData.find(function(item, i){
                        if(item.name.toLowerCase() === val.toLowerCase()){
                            id2 = i;
                            return i;
                        }
                    });
                    console.log(id2)

                    if (id2 === -1) return;

                    var Ecolor = 0;
                    if (cardData[id2].rarity === "COMMON") {
                        Ecolor = 16777215;
                    } else if (cardData[id2].rarity === "RARE") {
                        Ecolor = 19967;
                    } else if (cardData[id2].rarity === "EPIC") {
                        Ecolor = 13435135;
                    } else if (cardData[id2].rarity === "LEGENDARY") {
                        Ecolor = 16760064;
                    } else if (cardData[id2].rarity === "DETERMINATION") {
                        Ecolor = 14614528;
                    }

                    var Erarity = String(cardData[id2].rarity)
                    var Eimg = String(cardData[id2].name).replace(" ", "_").replace(" ", "_");
                    var dat = cardData[id2].cost + "/" + cardData[id2].attack + "/" + cardData[id2].hp
                    if (dat.includes(null)) {
                        dat = cardData[id2].cost
                    };
                    var soul = ""
                    if (!cardData[id2].soul) {
                        soul = "all"
                    } else {
                        soul = cardData[id2].soul
                    }

                    console.log(Eimg)

                    var EmbedCard = new Discord.RichEmbed({
                        title: "__Card info__",
                        author: {
                            name: cardData[id2].name,
                            icon_url: "https://undercards.net/images/rarity/" + Erarity.toUpperCase() + ".png"
                        },
                        color: Ecolor,
                        thumbnail:{
                            url: "https://undercards.net/images/cards/" + Eimg + ".png"
                        },
                        fields: [{
                            name: "Cost(/attack/HP)",
                            value: dat,
                            inline: true
                        }, {
                            name: "Rarity/Soul",
                            value: cardData[id2].rarity + "/" + soul,
                            inline: true
                        }, {
                            name: "Description",
                            value: cardData[id2].description + " ",
                            inline: false
                        }, {
                            name: "Description FR",
                            value: cardData[id2].descriptionFR + " ",
                            inline: false
                        }],
                        footer: {
                        text: bot.user.username,
                        icon_url: bot.user.avatarURL
                        }

                    });

                    message.channel.send(EmbedCard);

                } else if (message.content.substring(Prefix.lenght + 5).startsWith("artifacts")) {
                    return; //a faire
                }
            }

        });
    }
});


bot.login(process.env.BOT_TOKEN)
