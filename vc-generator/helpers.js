/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */
import * as didKey from '@digitalbazaar/did-method-key';
import {writeFile} from 'fs';
import {promisify} from 'util';
import {decodeSecretKeySeed} from 'bnid';

const didKeyDriver = didKey.driver();
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
export const writeJSON = async ({path, data}) => {
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
export const getDiDKey = async ({keySeed = _seed} = {}) => {
  const seed = decodeSecretKeySeed({secretKeySeed: keySeed});
  return didKeyDriver.generate({seed});
};
