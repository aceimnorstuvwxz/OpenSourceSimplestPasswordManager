var crypto = require('crypto')

function gen_iv(password) {
    let md5 = crypto.createHash('md5');
    let temp = md5.update(password + 'fateleak').digest('hex');
    return (temp + 'opensourcesimplestpasswordmanager').slice(0, 16)
}

function gen_key(password) {
    let md5 = crypto.createHash('md5');
    let temp = md5.update(password + 'fateleak').digest('hex');
    return (temp + 'opensourcesimplestpasswordmanager').slice(0, 16)
}
 
exports.encrypt = function (password, data) {
    let cipher = crypto.createCipheriv('aes-128-cbc', gen_key(password), gen_iv(password));
    let crypted = cipher.update(data, 'utf8', 'binary');
    crypted += cipher.final('binary');
    crypted = new Buffer(crypted, 'binary').toString('base64');
    return crypted;
};
 
exports.decrypt = function (password, crypted) {
    crypted = new Buffer(crypted, 'base64').toString('binary');
    let decipher = crypto.createDecipheriv('aes-128-cbc', gen_key(password), gen_iv(password));
    let decoded = decipher.update(crypted, 'binary', 'utf8');
    decoded += decipher.final('utf8');
    return decoded;
};
