// install hubs
require.hubs.push(['flux:', '/__flux/']);
require.hubs.push(['schema:', '/__schema/']); 

@ = require([
  'mho:app', 
  'mho:std',
  {id:'flux:cache', include:['Cache']},
  {id:'./widgets', name:'widgets'},
  {id:'schema:current', name:'schema'}
]);

@mainContent .. @appendContent(@PageHeader("Flux Test"));

var schema = @schema.Schema();

@withAPI('./main.api') {
  |api|

  var db = api.getDB();
  
  // slap a cache on top:
  db = db .. @Cache;

  var departments = db.query({schema:"Department"}) .. 
    @unpack .. 
    @transform.par.unordered(descriptor -> db.read(descriptor).data) ..
    @filter(x -> !!x) ..
    @transform({name} -> name) ..
    @toArray;

  var Department = @ObservableVar('POLICE');

  var Employees = @observe(Department, 
                           department ->
                             db.query({data: {department: department}, schema: 'Employee'}) ..
                             @unpack .. 
                             @transform.par(500, descriptor -> db.read(descriptor).data) ..
                             @filter(x -> !!x)
                          );

  @mainContent .. @appendContent([
    @Row([
      @Col('md-2', @Label("Department:")),
      @Col('md-8', @Select({items: departments, selected: Department}))
    ]),
    @Hr(),
    @widgets.DynamicTableWidget(Employees, 
                                @propertyPairs(schema.Employee) .. 
                                @map([name, descr] -> { header: descr.__description,
                                                        render: record -> record[name] }))
  ]) {
    ||
    hold();
  }

}
