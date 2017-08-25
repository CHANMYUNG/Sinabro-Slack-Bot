const app = require('express')();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const Log = require('../Database/models/searchLog')
const naverAPI = require('../APICalls/naver');

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.listen(3000, () => {
    console.log("STARTED");
});

app.post('/slack/callback', (req, res) => {
    let payload = JSON.parse(req.body.payload);

    switch (payload.callback_id) {
        case 'pagination':
            choose_searched_things(payload, res);
            break;
    }
    res.json(payload);
})

function pagination(payload) {
    let value = payload.actions[0].value.split('-')[0]
    let page = payload.actions[0].value.split('-')[1]
    return new Promise((resolve, reject) => {
        switch (value) {
            case 'next':

                break;
        }
    })


}

function pagination_middleware(req, res, next) {
    let payload = JSON.parse(req.body.payload);
    if (payload.callback_id !== 'pagination') {
        next();
        return
    }

    let ts = payload.message_ts;
    let channerl = payload.channel;
    let btnValue = payload.actions.value;
    let _log;

    Log.findOne({
            ts,
            channel
        }).then((log) => {
            switch (btnValue) {
                case 'next':
                    _log = log;
                    log.page += 1;
                    log.save();
                    return naverAPI.shopping.search(_log.keyword, 3, (_log.page * 3) + 1);
            }
        })
        .then((body) => {
            return createInteractiveMessage(body, (_log.page + 1) / 3, _log.totalPages);
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
    let next_prev_buttons = {
        "text": "",
        "callback_id": "pagination",
        "color": "#5b8426",
        "actions": []
    };

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

    if (1 < page) {
        next_prev_buttons.actions.push({
            "name": "btn",
            "text": "Pre",
            "type": "button",
            "value": "pre"
        })
        if (11 <= page) {
            next_prev_buttons.actions.push({
                "name": "btn",
                "text": "Pre10",
                "type": "button",
                "value": "pre10"
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