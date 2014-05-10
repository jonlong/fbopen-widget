/* global fbopenWidget, Prism */

$(function() {
  var $form = $('#fbopen-widget-demo');
  var $inputs = $form.find("input, select, button, textarea");
  var $dataStore = $('#fbopen-widget-data');
  var $widgetCode = $('#widget-code');
  var $widgetCodeBox = $widgetCode.find('code');
  var $widget = $('#fbopen-widget-placeholder');
  var $searchText = $('#fbopen-widget-results-demo small');

  $form.submit(function(e) {
    var serializedData = $form.serialize();

    // set values for widget snippet
    $dataStore.val(serializedData);

    $inputs.prop("disabled", true);

    var $widgetCopy = $widget.clone();

    // Remove generated data
    $widgetCopy.find('script').each(function() {
      if (!$(this).hasClass('embed')) {
        $(this).remove();
      }
    });

    $widgetCopy.find('link').each(function() {
      $(this).remove();
    });

    $widgetCopy.find('#fbopen-widget-entries').html();

    // Insert the scrubbed data
    $widgetCodeBox.html(escapeHTML($widgetCopy[0].outerHTML));

    // Add syntax highlighting with Prism
    Prism.highlightElement($widgetCodeBox[0]);

    // Initialize the widget
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

  $widgetCodeBox.mouseenter(function() {
    ctrlA($(this));
  });

});

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

function escapeHTML(html) {
  return html.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
