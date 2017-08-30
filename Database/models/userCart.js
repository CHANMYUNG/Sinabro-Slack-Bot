const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserCart = new Schema({
    user : { type : JSON, required : true },
    ts : { type : String, required : true },
    itemTitle: {type : String, required: true },
    itemLink: { type : String, required : true },
    itemImgLink : { type : String, required: true },
    mall : { type : String, required: true },
    createdAt : { type : Date, required : true, default : Date.now },
}, { collection : 'UserCart'} );


UserCart.statics.addItem = function (user, ts, itemTitle, itemLink, itemImgLink, mall) {
    let item = new this({ user, ts, itemTitle, itemLink, itemImgLink, mall })
    return item.save();
}


UserCart.statics.findByPersonAndItemLink = function (user, itemLink) {
    return this.find({ user, itemLink }).exec();
}

module.exports = mongoose.model('UserCart', UserCart);