/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const {promisify} = require('util');
const {writeFile} = require('fs');

const asyncWriteFile = promisify(writeFile);

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

module.exports = {
  writeJSON
};
