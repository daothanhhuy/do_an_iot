const mongoose = require('mongoose');
const User = require('../../models/user.js');
var session;
class DashboardController {
    index(req, res, next) {
        session = req.session;
        if (session.userid) {
            var title = "Dashboard";
            res.render('dashboard/show', {
                title: title,
            });
        } else res.redirect('/');
    }
}

module.exports = new DashboardController();
