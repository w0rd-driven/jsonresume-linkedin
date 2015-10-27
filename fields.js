var config = require('./config');

function getUrl() {
  var parameters = "people/~:(" + config.api_fields.join(',') + ")";
  //console.log("parameters: " + parameters);
  return config.api_url + parameters + "?format=" + config.api_format;
}

var url = getUrl();
console.log(url);

module.exports = url;
