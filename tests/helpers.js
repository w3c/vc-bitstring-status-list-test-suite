/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

// Javascript's default ISO timestamp is contains milliseconds.
// This lops off the MS part of the UTC RFC3339 TimeStamp and replaces
// it with a terminal Z.
const ISOTimeStamp = ({date = new Date()} = {}) => {
  return date.toISOString().replace(/\.\d+Z$/, 'Z');
};

const deepClone = data => JSON.parse(JSON.stringify(data, null, 2));

//FIXME this might not be needed in this test
const unwrapResponse = data => {
  if(data['@context']) {
    return data;
  }
  // if the response.data is not directly jsonld unwrap it
  for(const key of Object.keys(data)) {
    const prop = data[key];
    // recurse through each key looking for jsonld
    const jsonld = unwrapResponse(prop);
    // when we find the first context that should be the VC
    if(jsonld) {
      return jsonld;
    }
  }
  return false;
};

module.exports = {
  ISOTimeStamp,
  deepClone,
  unwrapResponse
};
