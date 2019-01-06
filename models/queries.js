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

    if(req.body.password != req.body.repassword)
        return "FAIL: Re Password doesn't match";

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
    console.log(result);
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

async function addProduct(steamid, name, price, cat, isnew, ishot,header_image){
    console.log([steamid, name, price, cat, isnew, ishot, header_image]);
    var result = await db.result('SELECT prod_ins($1, $2, $3, $4, $5, $6,$7)', [steamid, name, price, cat, isnew, ishot, header_image]);

    return result;
}

async function getAllCategory() {
    var result = await db.result('SELECT DISTINCT * FROM "CATEGORY"');
    return result;
}

async function changePassword(UID, newPassword, oldPassword) {
    var user = await db.oneOrNone('SELECT * FROM "USER" WHERE ("UID" = $1)', [UID]);

    console.log(user);

    if (user === null) {
        return null;
    }

    try {
        var result = await bcrypt.compare(oldPassword,user.Password);
        newPassword = await bcrypt.hash(newPassword,10); 
    } catch(err){
        console.log("queries.js: userLogin - Error while comparing password",err);
        next(err);
    };

    console.log(result);
    if (result) {
        var change_pw = await db.result('UPDATE "USER" SET "Password"=$1 WHERE "UID"=$2',[newPassword, UID]);
        console.log(change_pw);
        return change_pw;
    }
    else{
        return null;
    }
}

async function removeProduct(SteamID) {
    var result = await db.result('DELETE FROM "PRODUCT" WHERE "STEAMID"=$1', [SteamID]);

    return result;
}

async function searchProduct(Key) {
    Key = "%" + Key + "%"; // pattern
    var result = await db.result('SELECT * FROM "PRODUCT" WHERE "Name" LIKE $1', [Key]);

    return result;
}

async function createOrder(OID, UID, createDate) {
    var order = await db.result('SELECT * FROM "ORDER" WHERE "OID" = $1', [OID0]);

    if (order.rowCount) {
        return null;
    } else {
        var result = await db.result('INSERT INTO "ORDER"("OID", "UID", "Created_Date") VALUES($1, $2, $3)', [OID, UID, createDate]);
        return result;
    }
}

async function updateOrder(OID, Status, processDate) {
    var result = await db.result('UPDATE "ORDER" SET "Status" = $2,"Processed_Date"=$3 WHERE "OID" = $1',[OID,Status,processDate]);
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

    return result.rowCount;
}

async function getProductfromCategory(Endpoint){
    var category = await db.result('SELECT "Name" FROM "CATEGORY" WHERE "Endpoint"=$1',[Endpoint]);

    console.log(category.rows[0].Name);
    if(category.rowCount)
        var result = await db.result('SELECT * FROM "PRODUCT" WHERE "Category"=$1',[category.rows[0].Name]);
    else return category;

    return result;
}

async function getAllProduct(){
    var result = await db.result('SELECT * FROM "PRODUCT"');

    return result;
}

async function getProductfromID(PID){
    var result = await db.result('SELECT * FROM "PRODUCT" WHERE "STEAMID"=$1',[PID]);

    return result;
}

async function getUserCart(UID){
    var result = await db.result('SELECT * FROM "CART" WHERE "UID"=$1',[UID]);

    return result;
}

async function addProducttoCart(UID, PID, Amount){
    var existed = await db.result('SELECT * FROM "CART" WHERE "UID"=$1 AND "PID" = $2',[UID,PID]);

    console.log(existed);
    if(existed.rowCount){
        if(Amount > 0)
            var result = await db.result('UPDATE "CART" SET "Amount" = $3 WHERE "UID" = $1 AND "PID" = $2',[UID,PID,Amount]);
        else{
            var result = await db.result('DELETE FROM "CART" WHERE "UID" = $1 AND "PID" = $2',[UID,PID]);
        }
    }else{
        var result = await db.result('INSERT INTO "CART" VALUES($1,$2,$3)',[UID,PID,Amount]);
    }
    console.log(result);

    return result;
}

async function addNewCategory(name,endpoint){
    var exist = await db.result('SELECT * FROM "CATEGORY" WHERE "Name" = $1',[name]);

    if(exist.rowCount) return null;

    var result = await db.result('INSERT INTO "CATEGORY" VALUES ($1,$2)',[name,endpoint]);
    return result;
}

async function getHotProducts(){
    var result = await db.result('SELECT * FROM "PRODUCT" WHERE "Hot" = true');

    return result;
}

async function getNewProducts(){
    var result = await db.result('SELECT * FROM "PRODUCT" WHERE "New" = true');

    return result;
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
    removeOrderDetail: removeOrderDetail,
    updateOrder: updateOrder,
    getProductfromCategory: getProductfromCategory,
    getAllProduct: getAllProduct,
    getProductfromID: getProductfromID,
    getUserCart: getUserCart,
    addProducttoCart: addProducttoCart,
    addNewCategory: addNewCategory,
    getNewProducts: getNewProducts,
    getHotProducts: getHotProducts,
};
