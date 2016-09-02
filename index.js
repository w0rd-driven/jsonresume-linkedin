#!/usr/bin/env node

/**
 * Created by Jeremy Brayton on 8/28/16.
 */
var program = require('commander'),
  jsonfile = require('jsonfile'),
  fs = require('fs'),
  path = require('path'),
  sh = require('shelljs'),
  resume = require('./resume');

function increaseVerbosity(v, total) {
  return total < 3 ? total + 1 : 3;
}

function getFilePath(fileName, type) {
  var result = fileName;
  var pathInfo = path.parse(fileName);

  if (!pathInfo.dir) {
    switch (type) {
      case "current":
        result = path.join(sh.pwd().toString(), fileName);
        if (!fs.existsSync(result)) {
          result = path.join(__dirname, fileName);
        }
        break;
      case "output":
        result = path.join(sh.pwd().toString(), fileName);
        break;
      case "package":
      default:
        result = path.join(__dirname, fileName);
        break;
    }
  }
  return result;
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
    var configFile = options.config || "api.json";
    // var verbose = options.verbose || 0;
    // console.log(verbose);
    // console.log('Looking for config in %s', configFile);
    var filePath = getFilePath(configFile);
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
  .option('-c, --categories <path/to/categories.json>', 'Set categories definition. Defaults to ./categories.json')
  .option('-d, --data <path/to/data.json>', 'Set data definition. Defaults to ./data.json')
  .option('-o, --output <path/to/resume.json>', 'Set output definition. Defaults to ./resume.json')
  .action(function(options) {
    var type = {
      current: "current",
      package: "package",
      output: "output"
    };
    var categoriesFile = options.categories || "categories.json";
    var dataFile = options.data || "data.json";
    var outputFile = options.output || "resume.json";
    // var verbose = options.verbose || 0;
    var templateFile = "template.json";
    // console.log('Looking for categories in %s, data in %s, output in %s, template in %s', categoriesFile, dataFile,
    //   outputFile, templateFile);
    var categoriesFilePath = getFilePath(categoriesFile, type.current);
    var dataFilePath = getFilePath(dataFile, type.current);
    var templateFilePath = getFilePath(templateFile, type.package);
    var outputFilePath = getFilePath(outputFile, type.output);

    var categories = jsonfile.readFileSync(categoriesFilePath);
    var data = jsonfile.readFileSync(dataFilePath);
    var template = jsonfile.readFileSync(templateFilePath);
    resume.convert(data, template, categories, outputFilePath);
  });

var parsedArguments = program.parse(process.argv);
