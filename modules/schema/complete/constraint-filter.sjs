/*
  The constraint filter handles:

  __unique
  __required

  and other TBD (e.g. __default_value, etc)

  Ultimately this should go into the flux lib


*/

@ = require([
  'mho:std',
  {id: 'flux:filter', include:['Filter']},
  {id: 'flux:schema', name:'schema'}
]);

var FilterProto = Object.create(@Filter);

FilterProto.write = function(record) {
  var kind_descriptor = this.schema[record.schema];
  if (!kind_descriptor) throw new Error("Unknown kind #{record.schema}");

  // check if there are __unique constraints that need to be upheld:
  var has_unique_constraints = false;
  record.data .. @schema.cotraverse(kind_descriptor) {
    |node, field_descriptor|
    if (field_descriptor.value.__unique)
      has_unique_constraints = true;
    if (field_descriptor.value.__required && node.value == null)
      throw new Error("Required value missing for field #{field_descriptor.path} in record of kind #{record.schema}");
  }

  if (!has_unique_constraints) {
    // we can just write:
    return this.upstream.write(record);
  }

  // else ... we need to check the constraints within a transaction:
  if (!this.in_transaction) {
    var rv;
    this.withTransaction({}) {
      |T|
      rv = T.write(record);
    }
    return rv;
  }

  // ok, we are in a transactional context.

  
  // examine all __unique constraints:
  // XXX not tested with __unique on nested properties
  // XXX __unique doesn't work for arrays; should guard against that
  record.data .. @schema.cotraverse(kind_descriptor) {
    |node, field_descriptor|
    if (!field_descriptor.value.__unique) continue;

    if (node.value) {
      // see if there is record with the given value:
      var data = {};
      data[field_descriptor.path] = node.value;
      this.query({data: data, schema: record.schema}) .. @unpack .. @each {
        |{id}|
        if (id !== record.id) 
          throw new Error("Uniqueness constraint violation: Record of kind #{record.schema} with #{field_descriptor.path}='#{node.value}' already exists!");
      }
      // we're good to go:
      return this.upstream.write(record);
    } 
    
  }
  

};

exports.Filter = function(upstream, schema) {
  var rv = Object.create(FilterProto);
  rv.upstream = upstream;
  rv.schema = schema;
  return rv;
};

