module.exports = (controller) => {
    controller.hears(["이름이", /^(너)?\s이름이\s뭐(야|니|냐|임)\??$/], ["direct_message", "direct_mention", "mention"], function (bot, message) {
        bot.reply(message, "시나브로봇");
    });
    
    console.log('common controller attached');
}