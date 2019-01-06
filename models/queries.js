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

    try {
        password = await bcrypt.hash(password,10);
    } catch(err) {
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
    var result = await db.result('UPDATE "USER" SET "pathToAvatar"=$2 WHERE "UID"=$1',[UID,newPath]);
    console.log(newPath);
    return result.rowCount; // number of row affected by UPDATE.
}

async function removeUserWithID(UID){
    var result = await db.result('DELETE FROM "USER" WHERE "UID"=$1',[UID]);
    return result.rowCount; // number of row affected by DELETE.
}

async function addProduct(steamid, name, price, cat, isnew, ishot){
    var result = await db.one('SELECT prod_ins($1, $2, $3, $4, $5, $6)', [steamid, name, price, cat, isnew, ishot]);

    return result;
}

async function getAllCategory() {
    var result = await db.oneOrMany('SELECT DISTINCT * FROM "CATEGORY"');

    return result;
}

async function changePassword(Username, newPassword, oldPassword) {
    var user = await db.oneOrNone('SELECT * FROM "USER" WHERE ("Username" = $1)', [Username]);

    if (user = null) {
        return null;
    }

    try {
        var result = await bcrypt.compare(oldPassword,user.Password); 
    } catch(err){
        console.log("queries.js: userLogin - Error while comparing password",err);
        next(err);
    };

    if (result) {
        var change_pw = await db.result('UPDATE "USER" SET "Password"=$1 WHERE "Username"=$2',[newPassword, Username]);
        return change_pw.rowCount;
    }
}

async function removeProduct(SteamID) {
    var result = await db.result('DELETE FROM "PRODUCT" WHERE "STEAMID"=$1', [SteamID]);

    return result;
}

async function searchProduct(Key) {
    var result = await db.result('SELECT * FROM "PRODUCT" WHERE "Name" LIKE $1', [Key]);

    return result;
}

async function createOrder(OID, UID, createDate) {
    var order = await db.oneOrNone('SELECT * FROM "ORDER" WHERE "OID" = $1', [OID0]);

    if (order) {
        return null;
    } else {
        var result = await db.none('INSERT INTO "ORDER"("OID", "UID", "Created_Date") VALUES($1, $2, $3)', [OID, UID, createDate]);
        return result;
    }
}

async function updateOrder(OID, Status, processDate) {
    var result = await db.none('INSERT INTO "ORDER"("Status", "Processed_Date") VALUES($2, $3) WHERE "OID" = $1', [OID, Status, processDate]);

    return result;
}

async function addOrderDetail(OID, UID, Price, Amount) {
    var result = await db.result('INSERT INTO "ORDER_DETAIL"("OID", "UID", "Amount") VALUES($1, $2, $3)', [OID, UID, Amount]);

    var result2 = await db.result('UPDATE "ORDER" SET "Total" = "Total" + $2*$3 WHERE "OID" = $1', [OID, Price, Amount]);

    if(result.rowCount > 0 && result2.rowCount > 0)
    {
        return true;
    }else{
        return false;
    }
}

async function removeOrderDetail(OID) {
    var result = await db.result('DELETE FROM "ORDER_DETAIL" WHERE "OID" = $1', [OID]);

    if (result.rowCount) {
        return true;
    } else return false;
}

// END OF QUERIES

module.exports = {
    userLogin: userLogin,
    userCreate: userCreate,
    findUserWithID: findUserWithID,
    editUserAvatar: editUserAvatar,
    removeUserWithID: removeUserWithID,
    searchProduct: searchProduct,
    removeProduct: removeProduct,
    changePassword: changePassword,
    addProduct: addProduct,
    getAllCategory: getAllCategory,
    createOrder: createOrder,
    searchProduct: searchProduct,
    addOrderDetail: addOrderDetail,
};
