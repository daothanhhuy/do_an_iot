const mongoose = require('mongoose');
const User = require('../../models/user.js');
const EnterLogs = require('../../models/enterLog.js');
const fs = require('fs');
const path = require('path');
var session;
class EnterLogController {
    index (req, res, next) {
        session=req.session;
        if(session.userid){
            var itemsObject = [];
            EnterLogs.find({}, (err, items) => {
                if (err) {
                    console.log(err);
                    res.status(500).send('An error occurred', err);
                }
                else {
                    //response.send(send);
                    items.forEach((item) => {
                        itemsObject.push({
                            _id: item._id,
                            attachTo: item.attachTo,
                            ip: item.ip,
                            name: item.name,
                            img: item.img
                        })
                    })
                    console.log(itemsObject);
                    res.render('enterlog/show', { itemsObject: itemsObject, });
                }
            });
            //res.render('enterlog/show');
        } 
        else{
            console.log('here2');
            res.redirect('/');
        }        
    }
    upload(req, res, next) {
        console.log(path.join(__dirname, '..', '..', 'uploads'));
        console.log(req.body);
        var obj = {
            _id: new mongoose.Types.ObjectId(),
            name: req.body.name,
            attachTo: req.body.attachTo,
            ip: "172.31.250.10",
            img: {
                data: fs.readFileSync(path.join(__dirname, '..', '..', '/uploads/' + req.file.filename)),
                contentType: 'image/png'
            }
        }
        console.log("I'm here");
        EnterLogs.create(obj, (err, item) => {
            if (err) {
                console.log(err);
            }
            else {
                // item.save();
                res.redirect('/enterlog');
            }
        });
    };
}

module.exports = new EnterLogController();
