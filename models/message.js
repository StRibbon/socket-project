var mongoose = require('mongoose');
var Comment = require('./location');
var deepPopulate = require('mongoose-deep-populate');


var date = new Date();
var dateMessage = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear().toString().substr(2,2);

mongoose.set('debug', true);

var messageSchema = new mongoose.Schema ({
  body: {type: String, required: true},
  date: {type: String, default: dateMessage},
  tags: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tag"
  }],
  user: {
  	type: mongoose.Schema.Types.ObjectId,
  	ref: "User"
  },
  locations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location"
  }]
});

messageSchema.plugin(deepPopulate);

messageSchema.pre('remove', function(next) {
  Comment.remove({message: this._id}).exec();
  next();
});

var Message = mongoose.model("Message", messageSchema);

var thing = Message.create

console.log()

module.exports = Message;