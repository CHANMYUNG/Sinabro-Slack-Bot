const naverAPI = require('../../APICalls/naver');
const searchRegex = require('../regexs').shopping.search;
const searchRegex_reversed = require('../regexs').shopping.search_reversed;
const getSort = require('../regexs').shopping.getSort
const Log = require('../../Database/models/searchLog')

module.exports = (controller) => {

    controller.hears([searchRegex, searchRegex_reversed], ["direct_message", "direct_mention", "mention"], function (bot, message) {
        let command = message.text; // 사용자가 입력한 명령어를 저장
        let keyword; // command에서 분리해낸 검색 키워드를 저장할 변수 
        let sort; // command에서 분리해낸 검색 정렬 기준을 저장할 변수
        let totalPages; // 전체 페이지 수를 저장할 변수

        // message.match[2] === undefined라면 ,, searchRegex에 일치하는 것. ex) ~ ~순으로 보여줘
        if (message.match[2] === undefined) {

            keyword = message.match[message.match.length - 2]; // 키워드 정의
            sort = message.match[1]; // 정렬 기준 정의 :: API를 이용해 검색하기 위해서는 변환이 필요함 ex) '정확도순으로' -> 'sim'

        }
        // searchRegex_reversed에 일치하는 것  ex) ~순으로 ~ 보여줘
        else {

            keyword = message.match[1]; // 키워드 정의
            sort = message.match[2]; // 정렬 기준 정의 :: API를 이용해 검색하기 위해서는 변환이 필요함 ex) '정확도순으로' -> 'sim'

        }

        getSort(sort) // 정렬 키워드를 API사용에 적합한 문자열로 변환 ex) '정확도순으로' -> 'sim'
            .then((_sort) => {

                // 검색에 사용된 정렬 문자열이 들어있던 변수에 재할당
                sort = _sort;

                //                      (키워드, 검색을 통해 가져올 항목의 수, 스타트 인덱스, 정렬 기준('sim' | 'asc' | 'dsc' | 'date'))
                return naverAPI.shopping.search(keyword, 3, 1, sort)
            })
            .then((body) => { // body :: 검색 결과 

                // 전체 페이지 수를 연산 후 초기에 정의한 totalPages에 저장
                // 전체 페이지 수는 최대 334 페이지. 각 페이지마다 항목은 3개 씩 보이고, 1000개의 항목을 불러올 수 있음. (이는 네이버 API의 한계)
                totalPages = (parseInt(body.total / 3) + (body.total % 3 != 0 ? 1 : 0)) > 334 ? 334 : (parseInt(body.total / 3) + (body.total % 3 != 0 ? 1 : 0));

                // 검색 결과와 전체 페이지 수를 이용해 Interactive Message 생성
                return createInteractiveMessage(body, totalPages);
            })
            .then((interactiveMessage) => {
                // interactiveMessage :: 생성된 메시지

                // 사용자 요청에 대한 응답값으로 interactiveMessage를 전송, 전송이 완료되면 콜백 수행
                bot.reply(message, interactiveMessage, function (err, sentMessage) {

                    // 메시지가 보내진 채널과(channel) 타임 스탬프(ts)값을 가져와 Log생성
                    let channel = sentMessage.channel;
                    let ts = sentMessage.ts;

                    // Logging (channel, ts, keyword, sort, page, totalPages, command)
                    Log.create(channel, ts, keyword, sort, 1, totalPages, command).then(() => {
                        console.log("===========LOG===========");
                        console.log(`channel : ${channel}`);
                        console.log(`ts : ${ts}`);
                        console.log(`keyword : ${keyword}`);
                        console.log(`sort : ${sort}`);
                        console.log(`page : ${1}`);
                        console.log(`totalPage : ${totalPages}`);
                        console.log(`command : ${command}`);
                    })
                });
            })
            .catch((err) => { // 위의 전체적인 수행 과정에서 오류 발생시 :: 오류 메시지를 응답으로 전송
                bot.reply(message, err.message)
            });
    });

    console.log('Shopping Controller Attached');
}


// 반응형 메시지 (Interactive Message) 생성 함수, 검색 결과와 검색 결과의 전체 페이지 수를 인자로 받음.
function createInteractiveMessage(body, totalPages) {

    let items = body.items; // 검색 결과에서 검색된 항목에 대한 정보(Array)를 가져옴

    // 응답 초기 구조 정의 :: attachments에 추가적인 컨텐츠를 붙여나갈 것임.
    let reply = {
        "text": `\n총 ${totalPages}페이지 중 1번째 페이지입니다.\n \`봇\`은 최대 334페이지 (1000개)까지만 불러올 수 있습니다.`,
        "attachments": []
    };

    // items 배열을 순회하며 attachments에 아이템 추가.
    for (let i in items) {

        reply.attachments.push({
            "fallback": "choose searched things",
            "callback_id": "add to cart",
            "color": getRandomColor(),
            "title": `${Number(i)+1}. ${items[i].title.replace(/<b>/g, '').replace(/<\/b>/g,'')}`,
            "title_link": items[i].link,
            "fields": [{
                "title": `${items[i].lprice}원 ~ ${items[i].hprice}원`,
                "short": true
            }],
            "thumb_url": items[i].image,
            "footer": items[i].mallName,
            "footer_icon": "https://platform.slack-edge.com/img/default_application_icon.png",
            "actions": [{
                    "name": "add to cart",
                    "text": "팀 장바구니에 담기",
                    "type": "button",
                    "value": `to team/${i}`,
                    "confirm": {
                        "title": "Are you sure?",
                        "text": "항목을 팀 장바구니에 추가하시겠습니까?",
                        "ok_text": "Yes",
                        "dismiss_text": "No"
                    }
                },
                {
                    "name": "add to cart",
                    "text": "개인 장바구니에 담기",
                    "type": "button",
                    "value": `to personal/${i}`,
                    "confirm": {
                        "title": "Are you sure?",
                        "text": "항목을 팀 장바구니에 추가하시겠습니까?",
                        "ok_text": "Yes",
                        "dismiss_text": "No"
                    }
                }
            ]

        });
    }

    // Pagination을 위한 버튼을 추가로 붙이는데, 첫 검색은 무조건 1번 페이지이기 때문에 이전버튼과 처음으로 가기 버튼이 없다.
    reply.attachments.push({
        "text": "",
        "callback_id": "pagination",
        "color": "#5b8426",
        "actions": [{
            "name": "btn",
            "text": "Next",
            "type": "button",
            "value": "next"
        }, {
            "name": "btn",
            "text": "Next10",
            "type": "button",
            "value": "next10"
        }]
    });

    // 위와 같은 이유, 아이템을 분리시킨것은 시각적 효과를 위함임
    reply.attachments.push({
        "text": "",
        "callback_id": "pagination",
        "color": "#5b8426",
        "actions": [{
            "name": "btn",
            "text": "Go to Last",
            "type": "button",
            "value": "toLast"
        }]
    })

    return reply;
}

// 난수를 생성해 16진수 6자리를 생성 (색상코드) -> 다채로운 색상의 결과값 제공
function getRandomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);;
}