/**
 * Karma configuration for rdf-canonize.
 *
 * See ./test/test.js for env options.
 *
 * @author Dave Longley
 * @author David I. Lehn
 *
 * Copyright (c) 2011-2023 Digital Bazaar, Inc. All rights reserved.
 */
const os = require('os');
const webpack = require('webpack');

module.exports = function(config) {
  // bundler to test: webpack, browserify
  const bundler = process.env.BUNDLER || 'webpack';

  const frameworks = ['mocha', 'server-side'];
  // main bundle preprocessors
  const preprocessors = ['babel'];

  if(bundler === 'browserify') {
    frameworks.push(bundler);
    preprocessors.push(bundler);
  } else if(bundler === 'webpack') {
    preprocessors.push(bundler);
    preprocessors.push('sourcemap');
  } else {
    throw new Error('Unknown bundler');
  }

  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks,

    // list of files / patterns to load in the browser
    files: [
      {
        pattern: 'test/test-karma.js',
        watched: false, served: true, included: true
      }
    ],

    // list of files to exclude
    exclude: [],

    // preprocess matching files before serving them to the browser
    // available preprocessors:
    // https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      //'tests/*.js': ['webpack', 'babel'] //preprocessors
      'test/*.js': preprocessors
    },

    webpack: {
      mode: 'development',
      devtool: 'inline-source-map',
      plugins: [
        new webpack.DefinePlugin({
          'process.env.ASYNC': JSON.stringify(process.env.ASYNC),
          'process.env.BAIL': JSON.stringify(process.env.BAIL),
          'process.env.BENCHMARK': JSON.stringify(process.env.BENCHMARK),
          'process.env.EARL': JSON.stringify(process.env.EARL),
          'process.env.SYNC': JSON.stringify(process.env.SYNC),
          'process.env.TESTS': JSON.stringify(process.env.TESTS),
          'process.env.TEST_ENV': JSON.stringify(process.env.TEST_ENV),
          'process.env.TEST_ROOT_DIR': JSON.stringify(__dirname),
          'process.env.VERBOSE_SKIP': JSON.stringify(process.env.VERBOSE_SKIP),
          'process.env.WEBCRYPTO': JSON.stringify(process.env.WEBCRYPTO),
          // for 'auto' test env
          'process.env._TEST_ENV_ARCH': JSON.stringify(process.arch),
          'process.env._TEST_ENV_CPU': JSON.stringify(os.cpus()[0].model),
          'process.env._TEST_ENV_CPU_COUNT': JSON.stringify(os.cpus().length),
          'process.env._TEST_ENV_PLATFORM': JSON.stringify(process.platform),
          'process.env._TEST_VERSION':
            JSON.stringify(require('./package.json').version)
        })
      ],
      module: {
        noParse: [
          // avoid munging internal benchmark script magic
          /benchmark/
        ]
      }
    },

    browserify: {
      debug: false,
      transform: [
        [
          'envify', {
            ASYNC: process.env.ASYNC,
            BAIL: process.env.BAIL,
            BENCHMARK: process.env.BENCHMARK,
            EARL: process.env.EARL,
            SYNC: process.env.SYNC,
            TESTS: process.env.TESTS,
            TEST_ENV: process.env.TEST_ENV,
            TEST_ROOT_DIR: __dirname,
            VERBOSE_SKIP: process.env.VERBOSE_SKIP,
            WEBCRYPTO: process.env.WEBCRYPTO,
            // for 'auto' test env
            _TEST_ENV_ARCH: process.arch,
            _TEST_ENV_CPU: os.cpus()[0].model,
            _TEST_ENV_CPU_COUNT: os.cpus().length,
            _TEST_ENV_PLATFORM: process.platform,
            _TEST_VERSION: require('./package.json').version
          }
        ]
      ],
      plugin: [
        [
          require('esmify')
        ]
      ]
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    //reporters: ['progress'],
    reporters: ['mocha'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR ||
    // config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file
    // changes
    autoWatch: false,

    // start these browsers
    // available browser launchers:
    // https://npmjs.org/browse/keyword/karma-launcher
    //browsers: ['ChromeHeadless', 'Chrome', 'Firefox', 'Safari'],
    browsers: ['ChromeHeadless'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,

    // Mocha
    client: {
      mocha: {
        // increase from default 2s
        timeout: 10000,
        reporter: 'html',
        delay: true
      }
    },

    // Proxied paths
    proxies: {}
  });
};
