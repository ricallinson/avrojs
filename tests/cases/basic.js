//    (The MIT License)
//
//    Copyright (c) 2012 Richard S Allinson <rsa@mountainmansoftware.com>
//
//    Permission is hereby granted, free of charge, to any person obtaining
//    a copy of this software and associated documentation files (the
//    'Software'), to deal in the Software without restriction, including
//    without limitation the rights to use, copy, modify, merge, publish,
//    distribute, sublicense, and/or sell copies of the Software, and to
//    permit persons to whom the Software is furnished to do so, subject to
//    the following conditions:
//
//    The above copyright notice and this permission notice shall be
//    included in all copies or substantial portions of the Software.
//
//    THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
//    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
//    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
//    IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
//    CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
//    TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
//    SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

"use strict";

var Y = require('yui').use('test'),
    fs = require('fs'),
    avro = require('../../'), // avro
    fixtures = require('path').join(__dirname, '../fixtures/');

var assert = Y.Test.Assert;

function assert_json(val, expected) {
    var got = JSON.stringify(val);
    assert.isTrue(got === expected, "Got " + got + "; expected " + expected);
}

var testCase = new Y.Test.Case({

    name: "avro basic",

    'test 1': function () {

        var schema = JSON.parse(fs.readFileSync(fixtures + 'search.avsc', 'utf8'));

        assert_json(avro.decode(schema, avro.encode(schema, {"query":"search"})), '{"query":"search"}');
    },

    'test 2': function () {

        var string_schema = JSON.parse('{"type": "string"}');

        assert.isTrue(avro.validate(string_schema, "search") === true, "string schema");
    },

    'test 3': function () {

        var enum_schema = JSON.parse('{ "type" : "enum", "name" : "TestEnum", "symbols" : [ "A", "B", "C" ]}');

        assert.isTrue(avro.validate(enum_schema, "A") === true, "enum schema");
    },

    'test 4': function () {

        var array_schema = JSON.parse('{"type" : "array", "items" : "string"}');

        assert.isTrue(avro.validate(array_schema, ["val"]) === true, "array schema");
    },

    'test 5': function () {

        var map_schema = JSON.parse('{"type" : "map", "values" : "string"}');

        var map = {"abc": "def"};

        //TODO: fix
        //assert(a.validate(map_schema, map) === true, "map schema");

        assert_json(avro.decode(map_schema, avro.encode(map_schema, map)), '{"abc":"def"}');
    },

    'test 6': function () {

        var map_schema = JSON.parse('{"type" : "map", "values" : "string"}');

        var map = new Array();
        map[99] = 99;

        assert.isTrue(avro.validate(map_schema, map) === false, "arary as map");
    },

    'test 7': function () {

        var union_schema = JSON.parse('[ "int", "string" ]');

        assert.isTrue(avro.validate(union_schema, 1) === true, "union schema");
    },

    'test 8': function () {

        var union_schema = JSON.parse('[ "int", "string" ]');
        
        var record_schema = JSON.parse('{"type" : "record", "name" : "ShippingServiceOption", "fields" : [ { "name" : "field1", "type" : "int" }, { "name" : "field2", "type" : "string" }]}');

        var record = new Array();
        
        record["field1"] = 1;
        record["field2"] = "abc";

        assert.isTrue(avro.validate(record_schema, record) === true, "array schema");

        assert_json(avro.decode(union_schema, avro.encode(union_schema, 1)), '1');

        assert_json(avro.decode(union_schema, avro.encode(union_schema, "abc")), '"abc"');
    },

    'test 9': function () {

        var profile_created_schema = JSON.parse(fs.readFileSync(fixtures + 'ProfileCreate.avsc', 'utf8'));

        var returnPolicy = {"description": "return policy 1"};

        var shipping = {
            "shippingLocaleServices":
            [ {"rateType": "FLAT",
               "localeType": "DOMESTIC",
               "applyPromotionalShippingRule": true,
               "shippingServiceOptions": [{
               "sellerPriority": 1,
               "serviceName": "service",
               "cost": {"amount": 5.0, "code": "USD"}
               }]
              }]};

        var profile = {
            "name": "name",
            "xAccountId": "id",
            "returnPolicy": returnPolicy,
            "shipping": shipping
        };

        var profile_create = { "p": profile };

        var val = avro.decode(profile_created_schema, avro.encode(profile_created_schema, profile_create));

        assert_json(val, '{"p":{"xId":null,"name":"name","siteCode":null,"xAccountId":"id","payment":null,"shipping":{"shippingLocaleServices":[{"rateType":"FLAT","localeType":"DOMESTIC","applyPromotionalShippingRule":true,"shippingServiceOptions":[{"sellerPriority":1,"serviceName":"service","cost":{"amount":5,"code":"USD"},"discountAmount":null,"additionalCost":null,"packagingHandlingCost":null,"surcharge":null,"shipToLocations":null}]}]},"returnPolicy":{"description":"return policy 1","returnAccepted":null,"buyerPaysReturnShipping":null,"returnByDays":null,"refundMethod":null},"marketSpecifics":null}}');
    },

    'test 10': function () {

        var inventory_schema = JSON.parse(fs.readFileSync(fixtures + 'Inventory.avsc', 'utf8'));

        var inventory = {
            "items": [ {"sku":"123", "title":"my title", "currentPrice": "1.00", "url": "http://x.com", "dealOfTheDay": "true"},
                 {"sku":"456", "title":"my title 2", "currentPrice": "2.00", "url": "http://x.com", "dealOfTheDay": "false"}]
        };

        var val = avro.decode(inventory_schema, avro.encode(inventory_schema, inventory));
        assert_json(val, '{"items":[{"sku":"123","title":"my title","currentPrice":"1.00","url":"http://x.com","dealOfTheDay":"true"},{"sku":"456","title":"my title 2","currentPrice":"2.00","url":"http://x.com","dealOfTheDay":"false"}]}');
    },

    'test 11': function () {
        assert.isTrue(false);
    }
});

module.exports = testCase;