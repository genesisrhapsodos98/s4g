var promise = require('bluebird');

var options = {
    promiseLib: promise
};

var pgp = require('pg-promise')(options);
var connectionString = process.env.DATABASE_URL;
var db = pgp(connectionString);

// add query functions

function getUser(req,res,next){
    var username = req.params.username;
    var password = req.params.password;
    db
    .oneOrNone('SELECT * FROM USER WHERE Username = $1 AND Password = $2 LIMIT 1',username,password)
    .then(function(data){
        if(data === undefined){
            return false;
        }
        else{
        res.status(200)
        .json({
            status: 'success',
            data: data,
            message: 'Found user'
        })
        return true;
    }
    })  
}

// add query functions

module.exports = {

};
