var userArgs = process.argv.slice(2);

var Item = require('./models/item');

var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var names = ['F', 'G', 'H'];
var prices = [12, 46, 32];

for (let i = 0; i<names.length; i++) {
    var new_item = new Item (
        {
            name: names[i],
            price: prices[i]
        }
    )

    new_item.save(function (err) {
        if (err) {}
    });
}