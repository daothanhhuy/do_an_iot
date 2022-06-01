const mongoose = require('mongoose');
const User = require('../../models/user.js');
var session;
class DashboardController {
    index (req, res, next) {
        session=req.session;
        if(session.userid){
            res.render('dashboard/show');
        }else
            res.redirect('/');
        }
}

module.exports = new DashboardController();
