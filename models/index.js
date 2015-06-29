var mongoose = require("mongoose");
mongoose.connect(process.env.MONGOLAB_URI || "mongodb://localhost/socket-project");

module.exports.User = require("./user");
module.exports.Message = require("./message");
module.exports.Location = require("./location");
module.exports.Tag = require("./tag");

