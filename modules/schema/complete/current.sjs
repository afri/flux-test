@ = require(['mho:std', {id:'../client/current', name: 'client'}]);

function Schema() {

  // Concurrency in GCD is organized around 'ancestor trees'. All
  // records within the same tree are accessed in strongly consistent
  // fashion. Ancestors are records in the db, but they don't actually
  // need to exist. 
  // We give all of our entities the parent 'City:Chicago', so that we 
  // can uphold uniqueness constraints (in general this can only be done
  // within an ancestor tree):
  var parent = 'City:Chicago';



  var kinds = @client.Schema();

  kinds.Employee = kinds.Employee .. @merge(
    {
      __parent:    parent,
      last_name:   { __type: 'string', __required: true },
      import_date: { __type: 'date', __required: true },
      import_id:   { __type: 'integer', __unique: true, __required:true }
    }
  );

  kinds.Department = kinds.Department .. @merge(
    {
      __parent:   parent
    }
  );

  return kinds;
}

exports.Schema = Schema;

