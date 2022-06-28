var mongoose =  require('mongoose');

var Schema = mongoose.Schema;

var OrderSchema = new Schema (
    {
        user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
        items: [{type: Schema.Types.ObjectId, ref: 'Item', required: true}],
        date_ordered: {type: Date, default: Date.now}
    }
)

module.exports = mongoose.model('Order', OrderSchema);