const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TeamCart = new Schema({
    team : { type : JSON, required : true },
    adder: { type: String, required: true},
    ts : { type : String, required : true },
    itemTitle: {type : String, required: true },
    itemLink: { type : String, required : true },
    itemImgLink : { type : String, required: true },
    mall : { type : String, required: true },
    createdAt : { type : Date, required : true, default : Date.now },
}, { collection : 'TeamCart'} );


TeamCart.statics.addItem = function (team, adder, ts, itemTitle, itemLink, itemImgLink, mall) {
    let item = new this({ team, adder, ts, itemTitle, itemLink, itemImgLink, mall })
    return item.save();
}

TeamCart.statics.findByTeamAndItemLink = function (team, itemLink) {
    return this.find({ team, itemLink }).exec();
}

module.exports = mongoose.model('TeamCart', TeamCart);