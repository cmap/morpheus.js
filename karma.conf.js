module.exports = function (config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      {
        pattern: 'js/morpheus-external-latest.min.js',
        watched: false
      },
      {
        pattern: 'js/morpheus-latest.min.js',
        watched: false
      },
      {
        pattern: 'jasmine/matchers/*.js',
        watched: false
      },
      {
        pattern: 'jasmine/spec/*.js',
        watched: false
      },
      {
        pattern: 'jasmine/test_files/*',
        included: false,
        served: true,
        watched: false,
        nocache: true
      }
    ],
    browserNoActivityTimeout: 100000,
    proxies: {
      '/test_files/': '/base/jasmine/test_files/'
    },

    // list of files to exclude
    exclude: ['jasmine/spec/marker_selection_test.js'],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {},

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['MyChromeHeadless'],

    customLaunchers: {
      MyChromeHeadless: {
        base: 'ChromeHeadless',
        flags: ['--disable-hang-monitor']
      }
    },
    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: 1
  });
}
