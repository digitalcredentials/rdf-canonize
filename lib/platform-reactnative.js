/*!
 * Copyright (c) 2023 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

require('setimmediate');
require('fast-text-encoding');
const crypto = require('isomorphic-webcrypto');

exports.setImmediate = setImmediate;

// Exported by 'isomorphic-webcrypto'
exports.crypto = crypto;

// Exported by 'fast-text-encoding'
exports.TextEncoder = TextEncoder;

// precompute byte to hex table
const byteToHex = [];
for(let n = 0; n <= 0xff; ++n) {
  byteToHex.push(n.toString(16).padStart(2, '0'));
}

exports.bufferToHex = function bufferToHex(buffer) {
  let hex = '';
  const bytes = new Uint8Array(buffer);
  for(let i = 0; i < bytes.length; ++i) {
    hex += byteToHex[bytes[i]];
  }
  return hex;
};
