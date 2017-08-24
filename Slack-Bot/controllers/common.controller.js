module.exports = (controller) => {
    controller.hears(["이름이", /^(너)?\s이름이\s뭐(야|니|냐|임)\??$/], ["direct_message", "direct_mention", "mention"], function (bot, message) {
        bot.reply(message, "시나브로봇");
    });
    
    controller.hears('리스트내놔', ["direct_message", "direct_mention", "mention"], function (bot, message) {
        var reply = {
            text: 'HERE IS',
            attachments: []
        }
        reply.attachments.push({
            title: 'ANG',
            callback_id: message.user + '-' + '12323',
            attachment_type: 'default',
            actions: [{
                    "name": "flag",
                    "text": ":waving_black_flag: Flag",
                    "value": "flag",
                    "type": "button",
                },
                {
                    "text": "Delete",
                    "name": "delete",
                    "value": "delete",
                    "style": "danger",
                    "type": "button",
                    "confirm": {
                        "title": "Are you sure?",
                        "text": "This will do something!",
                        "ok_text": "Yes",
                        "dismiss_text": "No"
                    }
                }
            ]
        });

        bot.reply(message, reply);
    });
    
    console.log('common controller attached');
}