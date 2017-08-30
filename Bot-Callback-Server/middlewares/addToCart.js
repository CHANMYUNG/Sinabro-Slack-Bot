const teamCart = require('../../Database/models/teamCart');
const userCart = require('../../Database/models/userCart');

module.exports = (req, res, next) => {
    let payload = JSON.parse(req.body.payload);
    if (payload.callback_id !== 'add to cart') {
        next();
        return
    }
    const callback_id = payload.actions[0].value.split('/')[0];

    const itemIdx = payload.actions[0].value.split('/')[1];
    const team = payload.team;
    const user = payload.user;
    const selectedItem = payload.original_message.attachments[itemIdx];

    const itemTitle = selectedItem.title.match(/\d{0,}\.\s{0,}(.{0,})/)[1];
    const itemLink = selectedItem.title_link;
    const ts = payload.message_ts;
    const itemImgLink = selectedItem.thumb_url;
    const mall = selectedItem.footer;
    console.log(ts);
    switch (callback_id) {
        case 'to team':
            next();
        case 'to personal':
            userCart.findByPersonAndItemLink(user, itemLink)
                .then((item) => {
                    if (item.length > 0) throw new Error('이미 추가한 항목입니다!');
                    else return userCart.addItem(user, ts, itemTitle, itemLink, itemImgLink, mall)
                })
                .then((item) => {
                    res.send({
                        'text': `${itemTitle}을 추가했습니답!`,
                        'replace_original': false
                    })
                })
                .catch((err) => {
                    res.send({
                        'text': `오류가 발생했따리! ${err.message}`,
                        'replace_original': false
                    })
                })
            return;
        default:
            next();
    }
}