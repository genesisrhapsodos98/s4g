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

    var result = await db.oneOrNone('SELECT * FROM "USER" WHERE "Username" = $1 AND "Password" = $2', [username,password], )
    console.log("in queries: ",result);
    return result;
}

async function userCreate(req,res,next){
    var username = req.body.username;
    var password = req.body.password;
    
    var result = await db.none('INSERT INTO "USER"("Username", "Password", "Role") VALUES($1, $2, $3) RETURNING *',[username,password,"MEMBER"]);
    return result;
}

// END OF QUERIES

module.exports = {
    userLogin: userLogin,
};
