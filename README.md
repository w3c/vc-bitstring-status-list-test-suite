# Status List 2021 Interoperability Test Suite

## Table of Contents

- [Background](#background)
- [Install](#install)
- [Usage](#usage)
- [Generator](#generator)
- [Implementation](#implementation)

## Background

Provides interoperability tests for issuers and verifiers that support [VC StatusList2021](https://w3c-ccg.github.io/vc-status-list-2021/).

## Install

```js
npm i
```

## Usage

```
npm test
```

## Generator

To generate new test data use this command:

```js
npm run generate-vcs
```

## Implementation
To add your implementation to this test suite see the [README here.](https://github.com/w3c-ccg/vc-api-test-suite-implementations)
Add the tag `StatusList2021` to the issuers and verifiers you want tested.
To run the tests and to generate VCs, some implementations require client
secrets that can be passed as env variables to the test script. To see which
ones require client secrets, you can check the [vc-api-test-suite-implementations](https://github.com/w3c-ccg/vc-api-test-suite-implementations)
library.
