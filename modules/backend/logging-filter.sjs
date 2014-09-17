/*
  This filter logs traffic
*/

var count = 0;

@ = require([
  'mho:std',
  {id: 'flux:filter', include:['Filter']},
  {id: 'flux:schema', name:'schema'}
]);

var FilterProto = Object.create(@Filter);

FilterProto.write = function(record) {
  console.log(this.description, "write", ++count);
  return this.upstream.write(record);
};

FilterProto.read = function(descriptor) {
  console.log(this.description, "read", ++count);
  return this.upstream.read(descriptor);
};

FilterProto.query = function(descriptor) {
  console.log(this.description, "query", ++count);
  return this.upstream.query(descriptor);
};

FilterProto.withTransaction = function(options, block) {
  console.log(this.description, "withTransaction", ++count);
  return this.upstream.withTransaction(options, block);
};

FilterProto.watch = function(observer) {
  console.log(this.description, "watch", ++count);
  return this.upstream.watch(observer);
};


exports.Filter = function(upstream, description) {
  var rv = Object.create(FilterProto);
  rv.upstream = upstream;
  rv.description = description;

  return rv;
};

