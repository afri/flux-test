/*
  This filter mediates between the 'complete' schema, and the schema exposed to the client side
*/

@ = require([
  'mho:std',
  {id: 'flux:filter', include:['Filter']},
  {id: 'flux:schema', name:'schema'}
]);

var AdaptorProto = Object.create(@Filter);

AdaptorProto.write = function(record) {
  // XXX filter writes from the client here
  throw new Error('not allowed to modify/add records');

  //return this.upstream.write(record);
};

AdaptorProto.read = function(descriptor) {
  // remove fields not present in client schema
  var record = this.upstream.read(descriptor);
  var data = null;
  if (record.data) {
    data = {};
    // XXX not sure if this works for nested properties
    record.data .. @schema.cotraverse(this.client_schema[descriptor.schema]) {
      |node, field_descriptor|
      data .. @setPath(node.path, node.value);
    }
  }

  return descriptor .. @merge({data:data});
};

exports.Adaptor = function(upstream, client_schema, complete_schema) {
  var rv = Object.create(AdaptorProto);
  rv.upstream = upstream;
  rv.client_schema = client_schema;
  rv.complete_schema = complete_schema;
  // because we're going to be marshalling this across the bridge, we
  // have to make sure not to depend on 'this':
  return {
    read: descriptor -> rv.read(descriptor),
    write: descriptor -> rv.write(descriptor),
    query: descriptor -> rv.query(descriptor),
    withTransaction: (options, block) -> rv.withTransaction(options, block),
    watch: change_observer -> rv.watch(change_observer)
  }
};

