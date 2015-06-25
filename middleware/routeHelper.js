var db = require("../models");

var routeHelpers = {
  ensureLoggedIn: function(req, res, next) {
    if (req.session.id !== null && req.session.id !== undefined) {
      return next();
    }
    else {
     res.redirect('/login');
    }
  },

  ensureCorrectUserForMessage: function(req, res, next) {
    db.Message.findById(req.params.id).populate('user').exec(function(err,message){
      console.log(message)
      if (message.user.id != req.session.id) {
        res.redirect('/home');
      }
      else {
       return next();
      }
    });
  },

  preventLoginSignup: function(req, res, next) {
    if (req.session.id !== null && req.session.id !== undefined) {
      res.redirect('/home');
    }
    else {
     return next();
    }
  }
};

module.exports = routeHelpers;