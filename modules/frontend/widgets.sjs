/**
   @summary UI building blocks
*/


@ = require(['mho:std', 'mho:app']);

//----------------------------------------------------------------------
// backfill; should go into surface


/**
   @function DynamicTableWidget
   @summary Automatically updating table widget with lazy scroll-based row construction 
   @param {sjs:observable::Observable} [data] Observable yielding a [sjs:sequence::Sequence] of data records
   @param {Array} [coldef] Array with column definitions; see below
   @return {mho:surface::Element} Html element; see below
   @desc
      ### Column Definitions

        Elements in the `coldef` array are of form:

        { header: HtmlFragment,
          render: record -> HtmlFragment
        }

     ### Return value

       The returned HTML element has the following additional members:

       done:  Observable that is `true` if all rows are displayed
       count: Observable with the number of rows currently displayed
*/
function DynamicTableWidget(dataObs, coldef, row_classes) {
  var doneObs  = @ObservableVar(false);
  var countObs = @ObservableVar(0);
  
  var Message = content -> @Tr(`<td colspan='${coldef .. @count}'>$content</td>`);

  var Row;
  if (row_classes)
    Row = row_data -> @Tr(coldef .. @map({render} -> @Td(render(row_data)))) .. 
                      @Class(row_classes(row_data)) ;
  else
    Row = row_data -> @Tr(coldef .. @map({render} -> @Td(render(row_data))));

  var ui =
    @Table([
      @THead(coldef .. @map({header} -> `<th>$header</th>`)),
      dataObs .. @transform(data ->
        @TBody() .. @Mechanism(function(body) {
          countObs.set(0);
          doneObs.set(false);
          try {
            data ..
              @transform.par(20, row_data -> Row(row_data)) ..
              // append a maximum of 5 rows in one go
              @pack(5) ..
              @each {
                |batch|
                body .. @appendContent(batch);
                countObs.modify(n -> n+batch.length);
                // on every 50th row we wait for the user to scroll:
                if (countObs.get() % 50 === 0) {
                  window .. @events('scroll') .. @each {
                    ||
                    // only append more rows if we're not hidden:
                    if (body.offsetParent == null) {
                      continue;
                    }

                    // give a tolerance of 50px:
                    if (document.body.clientHeight -pageYOffset - 50 <= window.innerHeight)
                      break;
                  }
                }
              }
            if (countObs.get() === 0) {
              body .. @appendContent(Message(`<br><center><h1><small> <span class='glyphicon glyphicon-thumbs-down'>  </span> <br> no entries found  </small></h1></center><br>`));
            }
          }
          catch(e) {
            body .. @appendContent(Message(e));
          }
          doneObs.set(true);
        })),
      doneObs .. @transform(done ->
        !done ? @TBody(Message(`<span style='background-color:yellow;padding:5px;'>Retrieving data from server</span>`)) .. @Class('text-center'))
    ]) ..
    @Class('table-striped table-condensed table-hover');


  ui.count = countObs;
  ui.done  = doneObs;

  return ui;
}
exports.DynamicTableWidget = DynamicTableWidget;
