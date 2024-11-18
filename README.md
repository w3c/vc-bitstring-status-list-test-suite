# VC Bitstring Status List Interoperability Test Suite

## Table of Contents

- [Background](#background)
- [Install](#install)
- [Usage](#usage)
- [Generator](#generator)
- [Implementation](#implementation)

## Background

Provides interoperability tests for issuers and verifiers that support
[VC Bitstring Status List](https://w3c.github.io/vc-bitstring-status-list/).

## Install

```sh
npm i
```

## Usage

```sh
npm test
```

## Generator

To generate new test data use this command:

```sh
npm run generate-vcs
```

## Implementation

To add your implementation to this test suite see the
`w3c/vc-test-suite-implementations` [README](https://github.com/w3c/vc-test-suite-implementations/blob/main/README.md). Add the tags
`BitstringStatusList` along with `Revocation` or `Suspension` to run your
issuer and verifier against this test suite.
