var mongoose =  require('mongoose');

var Schema = mongoose.Schema;

var CartSchema = new Schema (
    {
        user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
        items: [{type: Schema.Types.ObjectId, ref: 'Item', required: true}],
    }
)

module.exports = mongoose.model('Cart', CartSchema);