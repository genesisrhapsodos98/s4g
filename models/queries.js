var promise = require('bluebird');
var bcrypt = require('bcryptjs');

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

    console.log("queries.js: userLogin - Request body: ", [username,password]);   
    var user = await db.oneOrNone('SELECT * FROM "USER" WHERE "Username" = $1', [username]);

    if(user === null){
        console.log("queries.js: userLogin - Can't find any user with the specified username");
        return null;
    }

    try{
    var result = await bcrypt.compare(password,user.Password); 
    } catch(err){
        console.log("queries.js: userLogin - Error while comparing password",err);
        next(err);
    };

    console.log("in queries: ",result);

    if(result){
        return user;
    } else {
        console.log("queries.js: userLogin - Password doesnt match");
        return null;
    }
}

async function userCreate(req,res,next){
    var uid = req.body.uuid;
    var username = req.body.username;
    var password = req.body.password;

    try{
        password = await bcrypt.hash(password,10);
    } catch(err){
        console.log("queries.js: userCreate - Error while hashing ",err);
        next(err);
    }

    console.log("queries.js: userCreate - Adding user ", [uid,username,password]);
    var result = await db.one('SELECT user_ins($1,$2,$3,$4)',[uid,username,password,"/images/avatar/default_avatar.png"]);

    return result;
}

async function findUserWithID(UID){
    var result = await db.oneOrNone('SELECT "UID","Username","Role","pathToAvatar" FROM "USER" WHERE "UID"=$1',UID);
    return result;
}

async function editUserAvatar(UID,newPath){
    var result = await db.result('UPDATE "USER" SET "pathToAvatar"=$2 WHERE "UID" = $1',[UID,newPath]);
    return result.rowCount; // number of row affected by UPDATE.
}

async function removeUser(UID){
    var result = await db.result('DELETE FROM "USER" WHERE "UID"=$1',[UID]);
    return result.rowCount; // number of row affected by DELETE.
}

// END OF QUERIES

module.exports = {
    userLogin: userLogin,
    userCreate: userCreate,
    findUserWithID: findUserWithID,
};
