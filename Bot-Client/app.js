const botkit = require('botkit');
const controllers = require('./controllers');
const controller = botkit.slackbot();
const database = require('../Database');

const bot = controller.spawn({
    token: process.env.ADVANCED_SINABRO_BOT_TOKEN
});

bot.startRTM(function (err, bot, payload) {
    if (err) {
        console.log(err);
        throw new Error('Can not connect to Slack');
    }

    database.connect();

    controllers(controller);
});