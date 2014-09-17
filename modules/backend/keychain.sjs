@ = require(['mho:std', 'mho:server/storage', {id:'sjs:sjcl', name:'sjcl'}]);

/**
   @summary leveldb-backed database of individually encrypted credentials 
*/

var KEYCHAIN_DB = require.url('../../keychain_data') .. @url.toPath;

exports.derivePassword = plaintext -> 
  plaintext .. 
  @sjcl.hash.sha256.hash ..
  @sjcl.codec.base64.fromBits;

exports.put = function(key, password, value) {
  value = @sjcl.encrypt(password, value);
  @Storage(KEYCHAIN_DB) {
    |itf|
    itf.put(key, value);
  }
};

exports.get = function(key, password) {
  var rv;
  @Storage(KEYCHAIN_DB) {
    |itf|
    rv = String(itf.get(key));
  }
  try {
    rv = @sjcl.decrypt(password, rv);
  }
  catch(e) { 
    // sjcl doesn't throw typeof Error *sigh*
    throw new Error(e); 
  }
  return rv;
};

exports.del = function(key) { 
  @Storage(KEYCHAIN_DB) {
    |itf|
    itf.del(key);
  }
};

exports.keys = function() {
  var rv;
  @Storage(KEYCHAIN_DB) {
    |itf|
    rv = itf.query({values:false}) .. @map([key] -> String(key));
  }
  return rv;
};
