/* global fbopenWidget */

$(function() {
  var $form = $('#fbopen-widget-demo');
  var $inputs = $form.find("input, select, button, textarea");
  var $dataStore = $('#fbopen-widget-data');
  var $widgetCode = $('#widget-code');
  var $widget = $('#fbopen-widget-placeholder');
  var $searchText = $('#fbopen-widget-results-demo small');

  $form.submit(function(e) {
    var serializedData = $form.serialize();
    var widgetHTML = $widget[0].outerHTML;

    // set values for widget snippet
    $dataStore.val(serializedData);

    $inputs.prop("disabled", true);

    $('#widget-textarea').val(widgetHTML);

    if (fbopenWidget) {
      var options = fbopenWidget.helpers.queryString.parse(serializedData);

      fbopenWidget.initWidget(options, function(err) {
        if (err) {
          console.error(err);
        }

        $inputs.prop("disabled", false);

        if (!$widgetCode.is(':visible')) {
          $widgetCode.fadeIn();
        }

        if (!$widget.is(':visible')) {
          $searchText.hide();
          $widget.fadeIn();
        }
      });
    }

    e.preventDefault();
  });

  $('#widget-textarea').mouseenter(function() {
    ctrlA($(this));
  });

});


// HTML to JavaScript converter
// By John Krutsch (http://asp.xcentrixlc.com/john)
// Moderator of the JavaScript Kit Help Forum: http://freewarejava.com/cgi-bin/Ultimate.cgi

function scriptIt(val) {
  val.value = val.value.replace(/"/gi, "&#34;")
  val.value = val.value.replace(/'/gi, "&#39;")
  valArr = escape(val.value).split("%0D%0A")
  val.value = ""
  for (i = 0; i < valArr.length; i++) {
    val.value += (i == 0) ? "<script>\ninfo=" : ""
    val.value += "\"" + unescape(valArr[i])
    val.value += (i != valArr.length - 1) ? "\" + \n" : "\"\n" 
  }
  // val.value+="\ndocument.write(info)\n<\/script>"
  val.value += "\nconsole.log(info)\n<\/script>"
}

function ctrlA(el) {
  with(el) {
    focus();
    select() 
  }
  if (document.all) {
    txt = el.createTextRange()
    txt.execCommand("Copy") 
    window.status = 'Selected and copied to clipboard!'
  } else window.status = 'Press ctrl-c to copy the text to the clipboard'
  setTimeout("window.status=''", 3000)
}
