const botkit = require('botkit');
const controllers = require('./controllers');
const database = require('./database');

const controller = botkit.slackbot({

}).configureSlackApp({
    clientId: process.env.ADVANCED_SINABRO_BOT_CLIENTID,
    clientSecret: process.env.ADVANCED_SINABRO_BOT_CLIENTSECRET,
    scopes: ['bot']
});

controller.setupWebserver(process.env.ADVANCED_SINABRO_BOT_PORT, function (err, webserver) {
    controller.createWebhookEndpoints(controller.webserver);

    controller.createOauthEndpoints(controller.webserver, function (err, req, res) {
        if (err) {
            res.status(500).send('ERROR: ' + err);
        } else {
            res.send('Success!');
        }
    });
});

controllers(controller);

const bot = controller.spawn({
    token: process.env.ADVANCED_SINABRO_BOT_TOKEN
}).startRTM(function (err, bot, payload) {
    if (err) {
        console.log(err);
        throw new Error('Slack에 연결할 수 없습니다.');
    }

    database.connect();
});