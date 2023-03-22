/**
 * Node.js test runner for rdf-canonize.
 *
 * See ./test.js for environment vars options.
 *
 * @author Dave Longley
 * @author David I. Lehn
 *
 * Copyright (c) 2011-2023 Digital Bazaar, Inc. All rights reserved.
 */
const assert = require('chai').assert;
const benchmark = require('benchmark');
const common = require('./test.js');
const fs = require('fs-extra');
const os = require('os');
const path = require('path');

// try to load native bindings
let rdfCanonizeNative;
// try regular load
try {
  rdfCanonizeNative = require('rdf-canonize-native');
} catch(e) {
  // try peer package
  try {
    rdfCanonizeNative = require('../../rdf-canonize-native');
  } catch(e) {
  }
}
// use native bindings
if(!rdfCanonizeNative) {
  // skip native tests
  console.warn('rdf-canonize-native not found');
}

const entries = [];

if(process.env.TESTS) {
  entries.push(...process.env.TESTS.split(' '));
} else {
  const _top = path.resolve(__dirname, '..');

  // W3C RDF Dataset Canonicalization "rdf-canon" test suite
  const testPath = path.resolve(
    _top, 'test-suites/rdf-canon/tests');
  if(fs.existsSync(testPath)) {
    entries.push(testPath);
  } else {
    // default to sibling dir
    entries.push(path.resolve(_top, '../rdf-canon/tests'));
  }

  // other tests
  //entries.push(path.resolve(_top, 'test/misc.js'));
}

// test environment
let testEnv = null;
if(process.env.TEST_ENV) {
  let _test_env = process.env.TEST_ENV;
  if(!(['0', 'false'].includes(_test_env))) {
    testEnv = {};
    if(['1', 'true', 'auto'].includes(_test_env)) {
      _test_env = 'auto';
    }
    _test_env.split(',').forEach(pair => {
      if(pair === 'auto') {
        testEnv.name = 'auto';
        testEnv.arch = 'auto';
        testEnv.cpu = 'auto';
        testEnv.cpuCount = 'auto';
        testEnv.platform = 'auto';
        testEnv.runtime = 'auto';
        testEnv.runtimeVersion = 'auto';
        testEnv.comment = 'auto';
        testEnv.version = 'auto';
      } else {
        const kv = pair.split('=');
        if(kv.length === 1) {
          testEnv[kv[0]] = 'auto';
        } else {
          testEnv[kv[0]] = kv.slice(1).join('=');
        }
      }
    });
    if(testEnv.label === 'auto') {
      testEnv.label = '';
    }
    if(testEnv.arch === 'auto') {
      testEnv.arch = process.arch;
    }
    if(testEnv.cpu === 'auto') {
      testEnv.cpu = os.cpus()[0].model;
    }
    if(testEnv.cpuCount === 'auto') {
      testEnv.cpuCount = os.cpus().length;
    }
    if(testEnv.platform === 'auto') {
      testEnv.platform = process.platform;
    }
    if(testEnv.runtime === 'auto') {
      testEnv.runtime = 'Node.js';
    }
    if(testEnv.runtimeVersion === 'auto') {
      testEnv.runtimeVersion = process.version;
    }
    if(testEnv.comment === 'auto') {
      testEnv.comment = '';
    }
    if(testEnv.version === 'auto') {
      testEnv.version = require('../package.json').version;
    }
  }
}

let benchmarkOptions = null;
if(process.env.BENCHMARK) {
  if(!(['0', 'false'].includes(process.env.BENCHMARK))) {
    benchmarkOptions = {};
    if(!(['1', 'true'].includes(process.env.BENCHMARK))) {
      process.env.BENCHMARK.split(',').forEach(pair => {
        const kv = pair.split('=');
        benchmarkOptions[kv[0]] = kv[1];
      });
    }
  }
}

const options = {
  nodejs: {
    path
  },
  assert,
  benchmark,
  rdfCanonizeNative,
  exit: code => process.exit(code),
  earl: {
    filename: process.env.EARL
  },
  verboseSkip: process.env.VERBOSE_SKIP === 'true',
  bailOnError: process.env.BAIL === 'true',
  entries,
  testEnv,
  benchmarkOptions,
  readFile: filename => {
    return fs.readFile(filename, 'utf8');
  },
  writeFile: (filename, data) => {
    return fs.outputFile(filename, data);
  },
  import: f => require(f)
};

// wait for setup of all tests then run mocha
common(options).then(() => {
  run();
}).catch(err => {
  console.error(err);
});

process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at:', p, 'reason:', reason);
});