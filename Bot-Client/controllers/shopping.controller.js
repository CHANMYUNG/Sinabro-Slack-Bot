const naverAPI = require('../apiCalls/naver');
const searchRegex = require('../regexs').shopping.search;
const searchRegex_reversed = require('../regexs').shopping.search_reversed;
const getSort = require('../regexs').shopping.getSort


module.exports = (controller) => {
    controller.hears(searchRegex, ["direct_message", "direct_mention", "mention"], function (bot, message) {
        let keyword;
        let sort;

        commandSplit(message.text, searchRegex)
            .then((token) => {
                keyword = token.keyword;
                return getSort(token.sort)
            })
            .then((_sort) => {
                sort = _sort;
                //                      (keyword, display, start, sort)
                return naverAPI.shopping.search(keyword, 3, 1, sort)
            })
            .then((body) => {
                return createInteractiveMessage(body.lastBuildDate, body.items);
            })
            .then((interactiveMessage) => {
                bot.reply(message, interactiveMessage);
            })
            .catch((err) => {
                bot.reply(message, err.message)
            });
    });

    controller.hears(searchRegex_reversed, ["direct_message", "direct_mention", "mention"], function (bot, message) {
        let keyword;
        let sort;
        commandSplit(message.text, searchRegex_reversed)
            .then((token) => {
                keyword = token.keyword;
                return getSort(token.sort)
            })
            .then((_sort) => {
                sort = _sort;
                //                      (keyword, display, start, sort)
                return naverAPI.shopping.search(keyword, 3, 1, sort)
            })
            .then((body) => {
                return createInteractiveMessage(body.lastBuildDate, body.items);
            })
            .then((interactiveMessage) => {
                bot.reply(message, interactiveMessage);
            })
            .catch((err) => {
                bot.reply(message, err.message)
            });
    });

    console.log('Shopping Controller Attached');
}


function commandSplit(command, regex) {
    return new Promise((resolve, reject) => {
        if (match) {
            let matches = command.match(regex);
            console.log(matches);
            if (regex === searchRegex) {
                resolve({
                    "keyword": matches[1],
                    "sort": matches[2]
                });
            } else {
                resolve({
                    "keyword": matches[matches.length - 2],
                    "sort": matches[1]
                });
            }
        }
        throw new Error('Can not parse your command');
    });
}

function createInteractiveMessage(date, items) {
    console.log(items);
    let reply = {
        "text": `총 1000개 중 1~${items.length}번째 항목입니다.`,
        "attachments": []
    };
    for (let i in items) {
        reply.attachments.push({
            "fallback": "choose searched things",
            "callback_id": "choose searched things",
            "color": getRandomColor(),
            "title": `${Number(i)+1}. ${items[i].title.replace(/<br>/gi, '')}`,
            "title_link": items[i].link,
            "fields": [{
                "title": `${items[i].lprice}원 ~ ${items[i].hprice}원`,
                "short": true
            }],
            "thumb_url": items[i].image,
            "footer": items[i].mallName,
            "footer_icon": "https://platform.slack-edge.com/img/default_application_icon.png",
            "actions": [{
                    "name": "btn",
                    "text": "팀 장바구니에 담기",
                    "type": "button",
                    "value": `to team`
                },
                {
                    "name": "btn",
                    "text": "개인 장바구니에 담기",
                    "type": "button",
                    "value": `to personal`
                }
            ]

        });
    }
    reply.attachments.push({
        "text": "",
        "callback_id": "choose searched things",
        "color": getRandomColor(),
        "actions": [{
            "name": "btn",
            "text": "더보기",
            "type": "button",
            "value": "more"
        }]
    });
    console.log(reply);
    return reply;
}


function getRandomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);;
}