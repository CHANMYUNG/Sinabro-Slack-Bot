const app = require('express')();
const bodyParser = require('body-parser');
const morgan = require('morgan');

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.listen(3000, () => {
    console.log("STARTED");
});

app.use('/', (req, res, next) => {
    console.log('called');
});

app.post('/slack/callback', (req, res) => {
    
})