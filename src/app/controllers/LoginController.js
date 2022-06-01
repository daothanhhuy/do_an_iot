const mongoose = require('mongoose');
const User = require('../../models/user.js');
var session;
class LoginController {
    // POST led 1
    index(req, res, next) {
        res.render('login/show', {layout: false})
    }

    login(req, res, next) {
        // const user = {
        //     name: req.body.username
        // }
        // console.log(req.body.username)
        // console.log(req.body.password)
        User.findOne({ username: req.body.username }, function(err, user) {
            if (err) {throw 'wrong';}
            try {
                user.comparePassword(req.body.password, function(err, isMatch) {
                    try {
                        if (err) {throw err; }
                        console.log(req.body.password, isMatch);
                        if(isMatch)  {
                            console.log(isMatch);
                            session=req.session;
                            session.userid= user._id;
                            session.username = req.body.username;
                            console.log(req.session)
                            res.status(200).render('dashboard/show');
                            return;
                        }
                        else {
                            console.log('failed');
                            res.status(404).send({
                                message: "Failed"
                            })
                            return;
                        }
                    }
                    catch  {}
                     // -&gt; Password123: true
                });
            } catch {
                console.log('failed');
                    res.status(404).send({
                    message: "Failed"
                    })
            }
        })
        
    }
    signup (req, res, next) {
        const newUser = new User({
            username: req.body.username,
            password: req.body.password,
        })
        newUser.save()
            .then(() => {
                console.log(newUser)
                console.log("Create new user successfully")
                res.status(200).send({
                    message: "New user added",
                })
            })
            .catch((err) => {
                console.log(err)
                res.status(303).send({
                    massage: "Failed to create",
                    err: "username had already exist",
                })
            })
    }
}
module.exports = new LoginController();
