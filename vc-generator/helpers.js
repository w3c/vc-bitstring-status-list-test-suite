/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const didKeyDriver = require('@digitalbazaar/did-method-key').driver();
const {writeFile} = require('fs');
const {promisify} = require('util');
const {decodeSecretKeySeed} = require('bnid');

const asyncWriteFile = promisify(writeFile);
const _seed = 'z1AYMku6XEB5KV3XJbYzz9VejGJYRuqzu5wmq4JDRyUCjr8';

/**
 * Writes a json file to disc.
 *
 * @param {object} options - Options to use.
 * @param {string} options.path - A path to write to.
 * @param {object} options.data - A JSON Object.
 *
 * @returns {Promise} Resolves on write.
 */
const writeJSON = async ({path, data}) => {
  return asyncWriteFile(path, JSON.stringify(data, null, 2));
};

/**
 * Takes in a bs58 mutlicodec multibase seed and returns a did key.
 *
 * @param {object} options - Options to use.
 * @param {string} [options.keySeed=_seed] - A bs58 encoded string.
 *
 * @returns {Promise<object>} - Returns the resulting did key driver result.
 */
const getDiDKey = async ({keySeed = _seed} = {}) => {
  const seed = decodeSecretKeySeed({secretKeySeed: keySeed});
  return didKeyDriver.generate({seed});
};

module.exports = {
  getDiDKey,
  writeJSON,
};
