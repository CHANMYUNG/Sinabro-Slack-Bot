const req = require('request');

const apiUrl = 'https://openapi.naver.com';


const headers = {
    'X-Naver-Client-Id': 'PR5EBETH6ZB5h5HgnY2F',
    'X-Naver-Client-Secret': 'KzfIqtBspr'
}

exports.shopping = {
    search: (keyword, display, start, sort) => {
        return new Promise((resolve, reject) => {
            req.get({
                "uri": apiUrl + `/v1/search/shop.json?query=${encodeURI(keyword)}&display=${display}&start=${start}&sort=${sort}`,
                "headers": headers
            }, function (err, res, body) {
                if (err) {
                    console.log('NAVER API CALL ERROR OCCURRED')
                    throw err;
                } else {
                    resolve(JSON.parse(body));
                }
            });
        });

    }
}