var mongoose = require('mongoose');

var Schema = mongoose.Schema;


var ItemSchema = new Schema (
    {
        name: {type: String, required: true},
        price: {type: Number, required: true}
    }
)


module.exports = mongoose.model('Item', ItemSchema);