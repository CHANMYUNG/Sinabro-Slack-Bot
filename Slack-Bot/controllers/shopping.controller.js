const naverAPI = require('../apiCalls/naver');
const searchRegex = require('../regexs').shopping.search;
const searchRegex_reversed = require('../regexs').shopping.search_reversed;
const getSort = require('../regexs').shopping.getSort


module.exports = (controller) => {
    controller.hears(searchRegex, ["direct_message", "direct_mention", "mention"], function (bot, message) {
        let keyword = message.match[1];
        let sort = message.match[2];
        console.log(keyword);

        getSort(sort)
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
        let keyword = matches[matches.length - 2];
        let sort = message.match[1];
        console.log(keyword);
        
        getSort(sort)
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