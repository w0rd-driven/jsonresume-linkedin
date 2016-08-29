#!/usr/bin/env node

/**
 * Created by Jeremy Brayton on 8/28/16.
 */
var program = require('commander');
var fs = require('fs');
var jsonfile = require('jsonfile');

function increaseVerbosity(v, total) {
  return total < 3 ? total + 1 : 3;
}

program
  .version('2.0.0');

program
  .command('url')
  .description('Generate the url to gather data from LinkedIn\'s API console')
  .option('-c, --config <path/to/api.json>', 'Set config definition. Defaults to api.json.')
  .option('-v, --verbose', 'Increase the verbosity of messages: 1 for normal output, 2 for more verbose' +
    ' output and 3 for debug', increaseVerbosity, 0)
  .action(function(options) {
    var configFile = options.config || "/api.json";
    // var verbose = options.verbose || 0;
    // console.log(verbose);
    // console.log('Looking for config in %s', configFile);
    var filePath = __dirname + configFile;
    jsonfile.readFile(filePath, function(error, config) {
      var parameters = "people/~:(" + config.fields.join(',') + ")";
      // console.log("parameters: " + parameters);
      var url = config.url + parameters + "?format=" + config.format;
      console.log(url);
    });
  });

program
  .command('import')
  //.arguments('<path/to/data.json>') // This becomes required
  .description('Generate resume.json from LinkedIn API data')
  .option('-c, --categories <path/to/categories.json>', 'set categories definition. defaults to categories.json')
  .option('-d, --data <path/to/data.json>', 'set data definition. defaults to ./data.json')
  .action(function(options) {
    var categories = options.categories || "categories.json";
    var data = options.data || "./data.json";
    console.log('Looking for categories in %s, data in %s', categories, data);
  });

var parsedArguments = program.parse(process.argv);
