'use strict';

module.exports = function(config) {
  config.set({

    // frameworks to use
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      'https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.3.15/angular.js',
      'https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.3.15/angular-mocks.js',
      'src/module.js',
      'src/*.js',
      'tests/*.js'
    ],

    // list of files to exclude
    exclude: [
    ],

    // test results reporter to use
    reporters: ['dots'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // Start these browsers
    browsers: ['Chrome'],

    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: true,

    plugins: [
      'karma-chrome-launcher',
      'karma-coverage',
      'karma-firefox-launcher',
      'karma-jasmine'
    ],

  });
};
