const naverAPI = require('../../APICalls/naver');
const searchRegex = require('../regexs').shopping.search;
const searchRegex_reversed = require('../regexs').shopping.search_reversed;
const getSort = require('../regexs').shopping.getSort
const Log = require('../../Database/models/searchLog')

module.exports = (controller) => {
    controller.hears(searchRegex, ["direct_message", "direct_mention", "mention"], function (bot, message) {
        let keyword;
        let sort;
        let totalPages;
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
                totalPage = body.total;
                return createInteractiveMessage(body);
            })
            .then((interactiveMessage) => {
                //console.log(interactiveMessage);
                bot.reply(message, interactiveMessage, function (err, sentMessage) {
                    // ts값을 가져와 Log생성
                    let channel = sentMessage.channel;
                    let ts = sentMessage.ts;

                    Log.create(channel, ts, keyword, sort, 1, totalPages).then(() => {
                        console.log("===========LOG===========");
                        console.log(`channel : ${channel}`);
                        console.log(`ts : ${ts}`);
                        console.log(`keyword : ${keyword}`);
                        console.log(`sort : ${sort}`);
                        console.log(`page : ${1}`);
                        console.log(`totalPage : ${totalPage}`);
                    })
                });
            })
            .catch((err) => {
                bot.reply(message, err.message)
            });
    });

    controller.hears(searchRegex_reversed, ["direct_message", "direct_mention", "mention"], function (bot, message) {
        let keyword;
        let sort;
        let totalPages;
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
                totalPage = body.total;
                return createInteractiveMessage(body);
            })
            .then((interactiveMessage) => {
                //console.log(interactiveMessage);
                bot.reply(message, interactiveMessage, function (err, sentMessage) {
                    // ts값을 가져와 Log생성
                    let channel = sentMessage.channel;
                    let ts = sentMessage.ts;

                    Log.create(channel, ts, keyword, sort, 1, totalPages).then(() => {
                        console.log("===========LOG===========");
                        console.log(`channel : ${channel}`);
                        console.log(`ts : ${ts}`);
                        console.log(`keyword : ${keyword}`);
                        console.log(`sort : ${sort}`);
                        console.log(`page : ${1}`);
                        console.log(`totalPage : ${totalPage}`);
                    })
                });
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

function createInteractiveMessage(body) {

    console.log(body);


    let totalPages = parseInt(body.total / 3) + (body.total % 3 != 0 ? 1 : 0);
    let items = body.items;
    let reply = {
        "text": `\n총 ${totalPages}페이지 중 1번째 페이지입니다.`,
        "attachments": []
    };
    for (let i in items) {
        reply.attachments.push({
            "fallback": "choose searched things",
            "callback_id": "add to cart",
            "color": getRandomColor(),
            "title": `${Number(i)+1}. ${items[i].title.replace(/<br>/g, '').replace(/\/<br>/g,'')}`,
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
        "callback_id": "pagination",
        "color": "#5b8426",
        "actions": [{
            "name": "btn",
            "text": "Pre10",
            "type": "button",
            "value": "pre10"
        }, {
            "name": "btn",
            "text": "Pre",
            "type": "button",
            "value": "pre"
        }, {
            "name": "btn",
            "text": "Next",
            "type": "button",
            "value": "next"
        }, {
            "name": "btn",
            "text": "Next10",
            "type": "button",
            "value": "next10"
        }]
    });

    reply.attachments.push({
        "text": "",
        "callback_id": "pagination",
        "color": "#5b8426",
        "actions": [{
            "name": "btn",
            "text": "Go to fisrt",
            "type": "button",
            "value": "toFirst"
        }, {
            "name": "btn",
            "text": "Go to last",
            "type": "button",
            "value": "toLast"
        }]
    })

    return reply;
}


function getRandomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);;
}