var Discord = require("discord.js");
var Jimp = require("jimp");
var fs = require('fs');
var request = require("request");
const Prefix = "uc."
const emojis = ["<:COMMON:431250043409006592>", "<:RARE:431250043647950859>", "<:EPIC:431250043266138115>", "<:LEGENDARY:431250043769585684>", "<:DETERMINATION:431250043287109646>"]
const antiCard = [155, 156, 157, 158, 159, 189, 190, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 230, 231, 232, 233, 234];


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
            
            if (message.content.startsWith(Prefix + "create")) {
                if (message.content.startsWith(Prefix + "create deck")) {
                    var infos = message.content.substring(15).split(" ");
                    let soul = infos[0].toLowerCase();
                    let mode = infos[1].toLowerCase();

                    var soultype = ["kindness", "determination", "patience", "bravery", "integrity", "perseverance", "justice"]
                    var modes = ["ranked", "classic", "soft", "beginer"]

                    if (soultype.indexOf(soul) === -1) {
                        message.channel.sendMessage("please indicate a valid deck soultype");
                        return;
                    } else if (modes.indexOf(mode) === -1) {
                        message.channel.sendMessage("please indicate a valid generating mode");
                        return;
                    }

                    var deckId = [];
                    var count = 1;
                    var dt = 0;
                    var verif = [];

                    while (count <= 25) {
                        var indexrnd = rndInt(0, cardData.length - 1)
                        console.log(indexrnd)
                        var card = cardData[indexrnd]

                        if (mode === "beginer" && card.rarity === "DETERMINATION") {
                            count += 0;
                        } else if (mode === "beginer" && card.rarity === "LEGENDARY") {
                            count += 0;
                        } else if (mode === "soft" && card.rarity === "DETERMINATION") {
                            count += 0;
                        } else if (mode === "ranked" && card.rarity === "DETERMINATION" && dt > 0) {
                            count += 0;
                        } else if (card.typeCard === 1 && card.soul != soul.toUpperCase) {
                            count += 0;
                        } else if (verif[card.id] >= 3 && card.rarity === "COMMON") {
                            count += 0;
                        } else if (verif[card.id] >= 3 && card.rarity === "RARE") {
                            count += 0;
                        } else if (verif[card.id] >= 2 && card.rarity === "EPIC") {
                            count += 0;
                        } else if (verif[card.id] >= 1 && card.rarity === "LEGENDARY") {
                            count += 0;
                        } else if (verif[card.id] >= 1 && card.rarity === "DETERMINATION") {
                            count += 0;
                        } else if (!antiCard.indexOf(card.id) === -1) {
                            count += 0;
                        } else {
                            deckId.push(card.id);
                            count += 1;
                            
                            if (!verif[card.id]) {
                                verif[card.id] = 1;
                            } else {
                                verif[card.id] += 1;
                            }

                            if (card.rarity === "DETERMINATION") {
                                dt += 1;
                            }
                        }
                    }
                    
                    var desc = "";
                    var f = 0;
                    while (f < 25) {
                        var id2 = -1;
                        var filteredObj = cardData.find(function(item, i){
                            if(item.id === deckId[f]){
                                id2 = i;
                                return i;
                            }
                        });
                        
                        var rir = cardData[id2].rarity;
                        if (rir === "COMMON") {
                            desc += emojis[0];
                        } else if (rir === "RARE") {
                            desc += emojis[1];
                        } else if (rir === "EPIC") {
                            desc += emojis[2];
                        } else if (rir === "LEGENDARY") {
                            desc += emojis[3];
                        } else if (rir === "DETERMINATION") {
                            desc += emojis[4];
                        }
                        desc += " ";
                        desc += cardData[id2].name;
                        desc += "\n";
                        f++
                    }



                    var resEmbed = new Discord.RichEmbed({
                        title: "Random deck.",
                        author: {
                            icon_url: "https://undercards.net/images/classes/" + soul.toUpperCase() + ".png",
                            name: soul + " - " + mode
                        },
                        color: 16777215,
                        description: desc,
                        footer: {
                            icon_url: bot.user.avatarURL,
                            text: bot.user.username
                        }
                    });

                    message.channel.send(resEmbed);
                }
            }
        });
    }
});


bot.login(process.env.BOT_TOKEN)
