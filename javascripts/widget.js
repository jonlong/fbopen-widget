(function() {

  // Namespace
  var fbopenWidget = fbopenWidget || {};

  // Utilities
  fbopenWidget.helpers = {
    preview: function(str) {
      var rtnstr = str.substring(0, 255);
      if (str.length > 255) {
        rtnstr += "...";
      }
      return rtnstr;
    },
    addCommas: function(nStr) {
      nStr += '';
      var x = nStr.split('.');
      var x1 = x[0];
      var x2 = x.length > 1 ? '.' + x[1] : '';
      var rgx = /(\d+)(\d{3})/;
      while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
      }
      return x1 + x2;
    },
    api_uri: 'http://api.data.gov/gsa/fbopen/v0/opps'
  };

  // Elements
  var widgetEl = document.getElementById('fbopen-widget-placeholder');
  var dataEl = document.getElementById('fbopen-widget-data');
  var resultsEl = document.getElementById('fbopen-widget-results');

  // Variables
  var serializedData = dataEl.value;
  var request = new XMLHttpRequest();

  // Functions
  var buildResultsTemplate = function(data) {
    var number = fbopenWidget.helpers.addCommas(data.numFound);
    var resultHTML = [];
    var i = -1;
    var initialHTML = [
      '<h2>FBOpen</h2>',
      '<h3>',
      number,
      ' Opportunities Found</h3>'
    ];

    for (var key = 0, size = data.docs.length; key < size; key++) {
      var description = "No description available.";

      if (data.docs[key].description) {
        description = fbopenWidget.helpers.preview(data.docs[key].description);
      }

      // Build the template
      resultHTML[++i] = '<div class="fbopen-opp"><a href="';
      resultHTML[++i] = data.docs[key].listing_url;
      resultHTML[++i] = '" target="_blank"><h4>';
      resultHTML[++i] = data.docs[key].title;
      resultHTML[++i] = '<h4></a><h5>';
      resultHTML[++i] = data.docs[key].agency;
      resultHTML[++i] = '</h5><p>';
      resultHTML[++i] = description;
      resultHTML[++i] = '</p><div>';
    }

    resultsEl.innerHTML = initialHTML.join('') + resultHTML.join('');
  };

  var initWidget = function() {
    var requestURI = fbopenWidget.helpers.api_uri + '?' + serializedData;

    // Set loading message
    resultsEl.innerHTML ='<h4>Loading...</h4>';

    // Open request
    request.open('GET', requestURI, true);

    // Process request
    request.onreadystatechange = function() {
      if (this.readyState === 4) {

        // On Success
        if (this.status >= 200 && this.status < 400) {
          var data = JSON.parse(this.responseText);

          // Show the widget
          widgetEl.style.display = 'block';

          buildResultsTemplate(data);

        } else {
          // On Error
          console.log('error', this.status, this.responseText);
        }
      }
    };

    request.send();
    request = null;
  };

  initWidget();

})();
