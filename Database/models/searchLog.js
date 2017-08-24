const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Log = new Schema({
    channel : { type : String, required : true },
    ts : { type : String, required : true },
    keyword : { type : String, required : true },
    sort : { type : String, required : true },
    page : { type : Number, required: true },
    totalPages : { type : Number, required: true },
    createdAt : { type : Date, required : true, default : Date.now },
}, { collection : 'Search-Logs'} );

Log.statics.create = function(channel, ts, keyword, sort, page, totalPage){
    const log = new this({
        channel,
        ts,
        keyword, 
        sort,
        page,
        totalPages
    });

    return log.save();
}

Log.statics.findAll = function(){
    return this.find({}).sort({ createdAt : -1 }).exec();
}

module.exports = mongoose.model('Search-Logs', Log);