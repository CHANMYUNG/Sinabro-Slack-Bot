const Log = require('../Database/models/searchLog');

module.exports = (req, res, next) => {
    let payload = JSON.parse(req.body.payload);
    if (payload.callback_id !== 'pagination') {
        next();
        return
    }

    let ts = payload.message_ts;
    let channel = payload.channel.id;
    let btnValue = payload.actions[0].value;
    let _log;

    Log.findOne({
            ts,
            channel
        })
        .then((log) => {
            console.log(log);
            _log = log;
            switch (btnValue) {
                case 'toFirst':
                    console.log('Go to first pressed');
                    log.page = 1;
                    break;
                case 'prev10':
                    console.log('prev10 pressed');
                    log.page -= 10;
                    break;
                case 'prev':
                    console.log('prev pressed');
                    log.page -= 1;
                    break;
                case 'next':
                    console.log('next pressed');
                    log.page += 1;
                    break;
                case 'next10':
                    console.log('next10 pressed');
                    log.page += 10;
                    break;
                case 'toLast':
                    console.log('Go to last pressed');
                    log.page = log.totalPages;
                    break;
            }
            log.save();
            let start = log.page * 3 - 2;
            return naverAPI.shopping.search(_log.keyword, start === 1000 ? 1 : 3, start, log.sort);
        })
        .then((body) => {
            console.log(_log.page);
            return createInteractiveMessage(body, _log.page, _log.totalPages);
        })
        .then((interactiveMessage) => {
            res.send(interactiveMessage);
        })
        .catch((err) => {
            res.send({
                'text': `오류가 발생했따리! ${err.message}`,
                'replace_original': false
            })
        })
}

function createInteractiveMessage(body, page, totalPages) {

    console.log(body);
    console.log(page);
    console.log(totalPages);
    let items = body.items;
    let reply = {
        "text": `\n총 ${totalPages}페이지 중 ${page}번째 페이지입니다.\n \`봇\`은 최대 334페이지 (1000개)까지만 불러올 수 있습니다.`,
        "attachments": []
    };
    for (let i in items) {
        reply.attachments.push({
            "fallback": "choose searched things",
            "callback_id": "add to cart",
            "color": getRandomColor(),
            "title": `${((Number(page)-1)*3+1)+Number(i)}. ${items[i].title.replace(/<b>/g, '').replace(/<\/b>/g,'')}`,
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
    let next_prev_buttons = {
        "text": "",
        "callback_id": "pagination",
        "color": "#5b8426",
        "actions": []
    };

    if (1 < page) {
        if (11 <= page) {
            next_prev_buttons.actions.push({
                "name": "btn",
                "text": "Pre10",
                "type": "button",
                "value": "prev10"
            })
        }
        next_prev_buttons.actions.push({
            "name": "btn",
            "text": "Pre",
            "type": "button",
            "value": "prev"
        })
    }
    if (page < totalPages) {
        next_prev_buttons.actions.push({
            "name": "btn",
            "text": "Next",
            "type": "button",
            "value": "next"
        })
        if (page <= (totalPages - 10)) {
            next_prev_buttons.actions.push({
                "name": "btn",
                "text": "Next10",
                "type": "button",
                "value": "next10"
            })
        }
    }

    let goToButtons = {
        "text": "",
        "callback_id": "pagination",
        "color": "#5b8426",
        "actions": []
    };

    if (1 < page) {
        goToButtons.actions.push({
            "name": "btn",
            "text": "Go to fisrt",
            "type": "button",
            "value": "toFirst"
        });
    }
    if (page < totalPages) {
        goToButtons.actions.push({
            "name": "btn",
            "text": "Go to Last",
            "type": "button",
            "value": "toLast"
        });
    }

    reply.attachments.push(next_prev_buttons);
    reply.attachments.push(goToButtons);

    return reply;
}


function getRandomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);;
}