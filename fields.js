var config = require("./config");

function getUrl() {
  var parameters = "people/~:(" + config.api.fields.join(',') + ")";
  //console.log("parameters: " + parameters);
  return config.api.url + parameters + "?format=" + config.api.format;
}

var url = getUrl();
console.log(url);

module.exports = {
  url: url,
  getUrl: getUrl()
};
