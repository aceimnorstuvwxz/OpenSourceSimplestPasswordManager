const c = require('./mycrypto')




var key = 'hello123456789123456789b';
console.log('加密的key:', key.toString('hex'));
var data = "Hello, nodejs. 演示aes-128-cbc加密和解密";
console.log("需要加密的数据:", data);
var crypted = c.encrypt(key, data);
console.log("数据加密后:", crypted);
var dec = c.decrypt(key, crypted);
console.log("数据解密后:", dec);