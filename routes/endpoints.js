var router = require('express').Router(),
    jwt = require('jwt-simple'),
    createToken = require('./createToken'),
    moment = require('moment'),
    cors = require('cors'),
    secret = require('../config/tokenSecret').secret;

//connect to database
var collection; 


var MongoClient = require('mongodb').MongoClient;
MongoClient.connect("mongodb://localhost:27017/test-angular2", function(err, db) {
  if(!err) {
    console.log("MongoDb Connect");
    collection = db.collection('tickets');
  }
});


// function returns if exist user in loggedUsers
function getLoggedUserByToken(token) {
    var result  = loggedUsers.filter(function(o){return o.token == token;} );
    return result? result[0] : null; // or undefined
};

// function returns if exist user in loggedUsers
function getLoggedUserByUsername(username) {
    var result  = loggedUsers.filter(function(o){return o.username == username;} );
    return result? result[0] : null; // or undefined
};

function ensureAuthorized(req, res, next) {
    console.log(req.headers);
    if (req.headers.authorization) {
        // Decode token
        console.log('->' + req.headers.authorization);
        try {
            var payload = jwt.decode(req.headers.authorization, secret);
        } catch(err) {
            res.set('Content-Type', 'application/json').send(JSON.stringify({
                status: 403,
                message: "error 1"
            }));
        }
        // Check expiration date
        if(payload.exp > moment().unix()) {

            // check if token exists
            console.dir(loggedUsers);
            console.dir(req.headers.authorization);
            if (getLoggedUserByToken(req.headers.authorization) != null) {
                next();
            } else {
                // token doesn't exists in loggedUsers
                res.set('Content-Type', 'application/json').send(JSON.stringify({
                    status: 403,
                    message: "error 2"
                }));
            }
        } else {
            // Expired token
            res.set('Content-Type', 'application/json').send(JSON.stringify({
                status: 401
            }));
        }
    } else {
        // Without token on authorization header
        res.set('Content-Type', 'application/json').send(JSON.stringify({
            status: 403,
            message: "error 3"
        }));
    }
};

router.post('/login', cors(), function(req, res){
    
});

router.get('/tickets', cors(), function (req, res) {
    "use strict";
    collection.find().toArray(function(err, items) {
        var resultado;
        if (!err){
            resultado = {
                status: 200,
                result: items
            }
        }
        else{
            resultado = {
                status: 500,
                result: err
            }
        }
        res.set('Content-Type', 'application/json').send(JSON.stringify(resultado));
    });
});


router.post('/ticket', cors(), /*ensureAuthorized,*/ function (req, res) {
    "use strict";
    var _id = parseInt(req.body.id);
    console.log(_id);
    collection.findOne({id:_id}, function(err, item) {
        console.log(item);
        var resultado;
        if (!err){
            resultado = {
                status: 200,
                result: item
            }
        }
        else{
            resultado = {
                status: 500,
                result: err
            }
        }
        res.set('Content-Type', 'application/json').send(JSON.stringify(resultado));
    });
});



router.post('/ticketUpdate', cors(), /*ensureAuthorized,*/ function (req, res) {
    "use strict";
    var _id = parseInt(req.body.id);
    console.log(_id);
    
    collection.update(
        {id:_id}, 
        {
            $set:{
                titulo: req.body.titulo,
                estado: req.body.estado
            }
        },
        {w:1}, 
        function(err, result) {
            var resultado;
            if (!err){
                resultado = {
                    status: 200,
                    result: result
                }
            }
            else{
                resultado = {
                    status: 500,
                    result: err
                }
            }
            res.set('Content-Type', 'application/json').send(JSON.stringify(resultado));
    });

});

router.post('/ticketDelete', cors(), /*ensureAuthorized,*/ function (req, res) {
    "use strict";
    console.log(req.body.id);
    var _id = parseInt(req.body.id);
    console.log(_id);
    collection.remove( {id:_id} , {w:1}, function(err, result) {
        var resultado;
        if (!err){
            resultado = {
                status: 200,
                result: result
            }
        }
        else{
            resultado = {
                status: 500,
                result: err
            }
        }
        res.set('Content-Type', 'application/json').send(JSON.stringify(resultado));
    });
});

module.exports = router;