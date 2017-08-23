const botkit = require('botkit');
const controllers = require('./controllers');
const controller = botkit.slackbot();
const database = require('./database');

const bot = controller.spawn({
    token: process.env.ADVANCED_SINABRO_BOT_TOKEN
});

bot.startRTM(function (err, bot, payload) {
    if (err) {
        console.log(err);
        throw new Error('Slack에 연결할 수 없습니다.');
    }

    database.connect();

    controllers(controller);
});