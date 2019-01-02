var promise = require('bluebird');

var options = {
    promiseLib: promise
};

var pgp = require('pg-promise')(options);
pgp.pg.defaults.ssl=true;

var connectionString = process.env.DATABASE_URL || "postgres://hpwqgemtbmdcml:67134e246afe5b17a9b99a906f15f2a8718d784c648c11b8ba2faf867a4b9cdc@ec2-54-204-36-249.compute-1.amazonaws.com:5432/d33ugtjopia9n3";
var db = pgp(connectionString);


// QUERIES
function userLogin(req,res,next){
    console.log("Request body: ",[username,password]);
    var username = req.body.username;
    var password = req.body.password;

    db.oneOrNone('SELECT * FROM "USER" WHERE "Username" = $1 AND "Password" = $2',[username,password],)
    .then(function(data){
        console.log("got data ", data);
        if(data === null){
            // res.status(200).json({
            //     status: 'failed',
            //     message: 'User not found. Try again or create a new account mayb ? :)',
            // })

            // TODO: ADD WRONG LOGIN CREDENTIALS HANDLING

            res.render('login');
        } else{
            // res.status(200).json({
            //     status: 'success',
            //     data: data,
            //     message: 'Found a matching user record. Logged in'
            // })

            
            // TODO: EXTRACT INFO FROM DATA AND CREATE A SESSION OR SOMETHING ._.
            res.render('index');
        }
    })
    .catch(function(err){
        return next(err);
    })
}
// END OF QUERIES

module.exports = {
    userLogin: userLogin,
};