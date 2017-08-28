const app = require('express')();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const Log = require('../Database/models/searchLog')
const naverAPI = require('../APICalls/naver');
const database = require('../Database');
const pagination_middleware = require('./middlewares/pagination');
const addToCart_middleware = require('./middlewares/addToCart');

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.listen(3000, () => {
    console.log("STARTED");
    database.connect();
});

app.post('/slack/callback', pagination_middleware, addToCart_middleware, (req, res) => {
    res.send({
        'text': `올바르지 않은 요청이지용~`,
        'replace_original': false
    })
})