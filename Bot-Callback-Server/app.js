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
    let btnValue = payload.actions[0].value;
    Log.findOne({
            ts,
            channel
        }).then((log) => {
            switch (btnValue) {
                case 'next':
                    if (log.page === log.totalPages) {
                        // 페이지가 마지막에 다다랐을 때 처리.
                    }
                    break;
            }
            return naverAPI.shopping.search(log.keyword, 3, (log.page * 3) + 1, log.sort);
        })
        .then((body) => {
            return createInteractiveMessage(body, (log.page + 1) / 3);
        })
}

function createInteractiveMessage(body, page) {

    console.log(body);


    let totalPages = parseInt(body.total / 3) + (body.total % 3 != 0 ? 1 : 0);
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

    reply.attachments.push({
        "text": "",
        "callback_id": "pagination",
        "color": "#5b8426",
        "actions": [{
            "name": "btn",
            "text": "Pre10",
            "type": "button",
            "value": "pre10-1"
        }, {
            "name": "btn",
            "text": "Pre",
            "type": "button",
            "value": "pre-1"
        }, {
            "name": "btn",
            "text": "Next",
            "type": "button",
            "value": "next-1"
        }, {
            "name": "btn",
            "text": "Next10",
            "type": "button",
            "value": "next10-1"
        }]
    });

    let goToButtons = {
        "text": "",
        "callback_id": "pagination",
        "color": "#5b8426",
        "actions": []
    };

    if (0 < page) {
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

    reply.attachments.push(goToButtons);
    return reply;
}