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
                bot.reply(message, body);
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
                bot.reply(message, body);
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