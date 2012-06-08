# Native Javascript Avro Implementation

[![Build Status](https://secure.travis-ci.org/capecodehq/avrojs.png?branch=master)](http://travis-ci.org/capecodehq/avrojs)

## Background

This code was taken from http://search.npmjs.org/#/avro. Which was initially taken from http://code.google.com/p/javascript-avro/, then significantly improved by Ali Bawany.  Since, it's been substantially trimmed, restricted to meet the needs of the X.commerce infrastructure (see below) and converted into a Node.js module.

## Limitations

To optimize for use with the X.commerce platform, the module operates with Avro schemas, not protocols.