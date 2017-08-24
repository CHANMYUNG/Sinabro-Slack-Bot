const shopping = require('./shopping.controller');
const common = require('./common.controller');

module.exports = (controller) => {
    shopping(controller);
    common(controller);
}