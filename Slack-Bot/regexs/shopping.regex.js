const shopSearchRegex = createShopSearchRegex();
const reversedShopSearchRegex = createReversedShopSearchRegex();

function createShopSearchRegex() {
    let shopSearchRegExp = "^(.{1,})를?을?\\s{1,}(";

    const dscConfig = require('./dsc.config').values;
    const ascConfig = require('./asc.config').values;
    const simConfig = require('./sim.config').values;
    const dateConfig = require('./date.config').values;

    const endWordsConfig = require('./endWords.config').values;

    const regExps = dscConfig.concat(ascConfig).concat(dateConfig).concat(simConfig);

    regExps.forEach((element) => {
        shopSearchRegExp += element + "|";
    });
    shopSearchRegExp = shopSearchRegExp.slice(0, -1) + ")\\s(";

    endWordsConfig.forEach((element) => {
        shopSearchRegExp += element + "|";
    });
    shopSearchRegExp = shopSearchRegExp.slice(0, -1) + ")$";

    return new RegExp(shopSearchRegExp);
}

function createReversedShopSearchRegex() {
    let reversedShopSearchRegExp = "^(";

    const dscConfig = require('./dsc.config').values;
    const ascConfig = require('./asc.config').values;
    const simConfig = require('./sim.config').values;
    const dateConfig = require('./date.config').values;

    const endWordsConfig = require('./endWords.config').values;

    const regExps = dscConfig.concat(ascConfig).concat(dateConfig).concat(simConfig);

    regExps.forEach((element) => {
        reversedShopSearchRegExp += element + "|";
    });

    reversedShopSearchRegExp = reversedShopSearchRegExp.slice(0, -1) + ")\\s(.{1,})를?을?\\s(";

    endWordsConfig.forEach((element) => {
        reversedShopSearchRegExp += element + "|";
    });
    reversedShopSearchRegExp = reversedShopSearchRegExp.slice(0, -1) + ")$";
    console.log(new RegExp(reversedShopSearchRegExp));
    return new RegExp(reversedShopSearchRegExp);
}

const getSort = (command) => {

    const dscConfig = require('./dsc.config').values;
    const ascConfig = require('./asc.config').values;
    const simConfig = require('./sim.config').values;
    const dateConfig = require('./date.config').values;

    const config = {
        'asc': require('./asc.config').values,
        'dsc': require('./dsc.config').values,
        'sim': require('./sim.config').values,
        'date': require('./date.config').values
    }

    const p = new Promise((resolve, reject) => {
        for (sort in config) {
            config[sort].forEach((element) => {
                if (new RegExp("^" + element + "$").test(command)) resolve(sort);
            })
        }
        reject('Not Found');
    })

    return p;
}
module.exports = {
    "search": shopSearchRegex,
    "search_reversed": reversedShopSearchRegex,
    "getSort": getSort
}