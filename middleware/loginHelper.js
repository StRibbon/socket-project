var db = require("../models");

var loginHelpers = function (req, res, next) {

  req.login = function (user) {
    req.session.uid = user._id;
    req.session.name = user.username;
  };

  req.logout = function () {
    req.session.uid = null;
    req.session.name  = null;
  };

  next();
};

module.exports = loginHelpers;