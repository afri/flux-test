/*

  This is a 'redacted' schema that we expose to the client-side.
  It is incorporated into the complete schema in ../complete/current.sjs

*/

function Schema() {

  var kinds = {};

  kinds.Employee = {
    first_name: { __type: 'string', __required:true, __description: "First Name" },
    position:   { __type: 'string', __description: "Position" },
    department: { __type: 'string', __description: "Department" },
    salary:     { __type: 'float', __required:true, __description: "Salary"  }
  };

  kinds.Department = {
    name:       { __type: 'string', __unique:true }
  };

  return kinds;
}

exports.Schema = Schema;

