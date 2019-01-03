var promise = require('bluebird');

var options = {
    promiseLib: promise
};

var pgp = require('pg-promise')(options);
pgp.pg.defaults.ssl=true;

var connectionString = process.env.DATABASE_URL || "postgres://hpwqgemtbmdcml:67134e246afe5b17a9b99a906f15f2a8718d784c648c11b8ba2faf867a4b9cdc@ec2-54-204-36-249.compute-1.amazonaws.com:5432/d33ugtjopia9n3";
var db = pgp(connectionString);


// QUERIES
async function userLogin(req,res,next) {
    var username = req.body.username;
    var password = req.body.password;
    console.log("Request body: ", [username,password]);    

    db.oneOrNone('SELECT * FROM "USER" WHERE "Username" = $1 AND "Password" = $2', [username,password], )
    .then((data) => {
        console.log(data);
        return data;
    })
    .catch(function(err){
        return next(err);
    })
}
// END OF QUERIES

module.exports = {
    userLogin: userLogin,
};
