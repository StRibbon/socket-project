var mongoose = require('mongoose');
var Tag = require('./tag');
var Message = require('./message');
var deepPopulate = require('mongoose-deep-populate');


mongoose.set('debug', true);

var locationSchema = new mongoose.Schema ({
  topic: String,
  lat: Number,
  long: Number
  // tags: [{
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "Tag"
  // }],
  // users: {
  // 	type: mongoose.Schema.Types.ObjectId,
  // 	ref: "User"
  // },
});

locationSchema.plugin(deepPopulate);

locationSchema.pre('remove', function(next) {
  Location.remove({location: this._id}).exec();
  next();
});

var Location = mongoose.model("Location", locationSchema);

var thing = Location.create

console.log()

module.exports = Location;