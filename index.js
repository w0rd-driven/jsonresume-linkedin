#!/usr/bin/env node

/**
 * Created by Jeremy Brayton on 8/28/16.
 */
var program = require('commander');

program
  .version('2.0.0');

program
  .command('url')
  .description('Generate the url to gather data from LinkedIn\'s API console')
  .option('-c, --config <path/to/api.json>', 'set config definition. defaults to api.json')
  .action(function(options) {
    var config = options.config || "api.json";
    console.log('Looking for config in %s', config);
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

program.parse(process.argv);
program.help();
