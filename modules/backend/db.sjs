@ = require(['mho:std', 
             {id:'lib:schema/complete/current', name:'complete_schema'},
             {id:'lib:schema/client/current', name:'client_schema'},
             {id:'lib:schema/complete/constraint-filter', name:'constraints'},
             {id:'lib:schema/complete/client-schema-adaptor', name:'client_schema_adaptor'},
             {id:'./logging-filter', name:'log'},
             {id:'lib:backend/keychain', name:'keychain'},
             {id:'flux:gcd', name:'gcd'},
             {id:'flux:cache', name:'cache'}
            ]);


var complete_schema = @complete_schema.Schema();
var client_schema = @client_schema.Schema();

var gcd;

// this is called on app startup by config.mho
exports.initDB = function(password) {
  gcd = @gcd.GoogleCloudDatastore(
    {
      context: {
        dataset: @keychain.get('gcd.project', password) .. @rstrip('\n'),
        email:   @keychain.get('gcd.email', password) .. @rstrip('\n'),
        key:     @keychain.get('gcd.key', password) .. @rstrip('\n')
      },
      schemas: complete_schema
    }
  );

  // add a cache in front of gcd, and a logging filter in between, so
  // that we can see how much traffic actually goes to gcd, and what
  // is served through the cache:
  gcd = gcd .. @log.Filter('traffic to gcd:') .. @cache.Cache;
};


exports.getClientDB = function() {
  return gcd .. @client_schema_adaptor.Adaptor(client_schema, complete_schema);
};
