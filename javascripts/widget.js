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
    api_uri: 'http://api.data.gov/gsa/fbopen/v0/opps',
    queryString: {

      /**
       * query-string
       * Parse and stringify URL query strings
       * https://github.com/sindresorhus/query-string
       * courtesy of Sindre Sorhus
       * MIT License
       */

      parse: function(str) {
        if (typeof str !== 'string') {
          return {};
        }

        str = str.trim().replace(/^\?/, '');

        if (!str) {
          return {};
        }

        return str.trim().split('&').reduce(function(ret, param) {
          var parts = param.replace(/\+/g, ' ').split('=');
          var key = parts[0];
          var val = parts[1];

          key = decodeURIComponent(key);
          // missing `=` should be `null`:
          // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
          val = val === undefined ? null : decodeURIComponent(val);

          if (!ret.hasOwnProperty(key)) {
            ret[key] = val;
          } else if (Array.isArray(ret[key])) {
            ret[key].push(val);
          } else {
            ret[key] = [ret[key], val];
          }

          return ret;
        }, {});
      },
      stringify: function(obj) {
        return obj ? Object.keys(obj).map(function(key) {
          var val = obj[key];

          if (Array.isArray(val)) {
            return val.map(function(val2) {
              return encodeURIComponent(key) + '=' + encodeURIComponent(val2);
            }).join('&');
          }

          return encodeURIComponent(key) + '=' + encodeURIComponent(val);
        }).join('&') : '';
      }
    }
  };

  // Elements
  var widgetEl = document.getElementById('fbopen-widget-placeholder');
  var dataEl = document.getElementById('fbopen-widget-data');
  var resultsEl = document.getElementById('fbopen-widget-results');
  var formEl = document.getElementById('fbopen-widget-search');

  // Variables
  var serializedData = '?' + dataEl.value;
  var queryParams = fbopenWidget.helpers.queryString.parse(serializedData);

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

  var getSearchResults = function(query) {
    if (query) {
      queryParams.q = query;
    }

    var serializedParams = fbopenWidget.helpers.queryString.stringify(queryParams);
    var requestURI = fbopenWidget.helpers.api_uri + '?' + serializedParams;
    var request = new XMLHttpRequest();

    // Set loading message
    resultsEl.innerHTML = '<h4>Loading...</h4>';

    // IE8 CORS support
    if (window.XDomainRequest) {
      var xdr = new XDomainRequest();
      xdr.open("get", requestURI);
      xdr.onload = function() {
        var data = JSON.parse(xdr.responseText);

        if (data === null || typeof(data) === 'undefined') {
          data = JSON.parse(data.firstChild.textContent);
        }

        buildResultsTemplate(data);
      };

      xdr.send();

    } else {

      // Standard CORS support
      request.open('GET', requestURI, true);

      // Process request
      request.onreadystatechange = function() {
        if (this.readyState === 4) {

          // On Success
          if (this.status >= 200 && this.status < 400) {
            var data = JSON.parse(this.responseText);

            buildResultsTemplate(data);

          } else {
            // On Error
            console.log('error', this.status, this.responseText);
          }
        }
      };

      request.send();
    }
  };

  var initOpenSearch = function() {
    // Don't send the `open_search_enabled` param with the API request
    delete queryParams.open_search_enabled;

    // show the form
    formEl.style.display = 'block';

    // Submit handler for form
    if (formEl.attachEvent) {
      // <= IE8 event support
      formEl.attachEvent("submit", handleSubmit);
    } else {
      formEl.addEventListener("submit", handleSubmit);
    }
  };

  var handleSubmit = function(e) {
    var query = document.getElementById('fbopen-widget-search-query').value;

    getSearchResults(query);
    e.preventDefault();
  };

  var initWidget = function() {
    var openSearchEnabled = queryParams.open_search_enabled;
    var searchQuery = queryParams.q;
    var apiKey = queryParams.api_key;

    // Hide the form initially
    formEl.style.display = 'none';

    // Show the widget
    widgetEl.style.display = 'block';

    if (searchQuery && apiKey) {
      getSearchResults();
    } else if (apiKey) {
      // If there's no pre-specified data, show the search box
      openSearchEnabled = true;
    }

    if (openSearchEnabled) {
      initOpenSearch();
    }

  };

  initWidget();

})();
