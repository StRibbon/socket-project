var mongoose = require("mongoose");
var tagSchema = new mongoose.Schema({
	
	tags: { type: [String], index: true }
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User"
	},
	message: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Message"
	},
	locations: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Location"
    }]
});

var Tag = mongoose.model("Tag", tagSchema);
module.exports = Tag;