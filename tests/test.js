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

var fs = require('fs'), a = require('avro');

function AssertException(message) { this.message = message; }
AssertException.prototype.toString = function () {
  return 'AssertException: ' + this.message;
}

function assert(exp, message) {
  if (!exp) {
    throw new AssertException(message);
  }
}

function assert_json(val, expected) {
    var got = JSON.stringify(val);
    assert(got === expected, "Got " + got + "; expected " + expected);
}

var schema = JSON.parse(fs.readFileSync('search.avsc', 'utf8'));

assert_json(a.decode(schema, a.encode(schema, {"query":"search"})), '{"query":"search"}');

var string_schema = JSON.parse('{"type": "string"}');

assert(a.validate(string_schema, "search") === true, "string schema");

var enum_schema = JSON.parse('{ "type" : "enum", "name" : "TestEnum", "symbols" : [ "A", "B", "C" ]}');

assert(a.validate(enum_schema, "A") === true, "enum schema");

var array_schema = JSON.parse('{"type" : "array", "items" : "string"}');

assert(a.validate(array_schema, ["val"]) === true, "array schema");

var map_schema = JSON.parse('{"type" : "map", "values" : "string"}');

var map = {"abc": "def"};

//TODO: fix
//assert(a.validate(map_schema, map) === true, "map schema");

assert_json(a.decode(map_schema, a.encode(map_schema, map)), '{"abc":"def"}');

var map_schema = JSON.parse('{"type" : "map", "values" : "string"}');

var map = new Array();
map[99] = 99;

assert(a.validate(map_schema, map) === false, "arary as map");

var union_schema = JSON.parse('[ "int", "string" ]');

assert(a.validate(union_schema, 1) === true, "union schema");

var record_schema = JSON.parse('{"type" : "record", "name" : "ShippingServiceOption", "fields" : [ { "name" : "field1", "type" : "int" }, { "name" : "field2", "type" : "string" }]}');

var record = new Array();
record["field1"] = 1;
record["field2"] = "abc";

assert(a.validate(record_schema, record) === true, "array schema");

assert_json(a.decode(union_schema, a.encode(union_schema, 1)), '1');

assert_json(a.decode(union_schema, a.encode(union_schema, "abc")), '"abc"');

var profile_created_schema = JSON.parse(fs.readFileSync('ProfileCreate.avsc', 'utf8'));

var returnPolicy = {"description": "return policy 1"};

var shipping = {
    "shippingLocaleServices":
    [ {"rateType": "FLAT",
       "localeType": "DOMESTIC",
       "applyPromotionalShippingRule": true,
       "shippingServiceOptions": [{
	   "sellerPriority": 1,
	   "serviceName": "service",
	   "cost": {"amount": 5.0, "code": "USD"},
       }]
      }]};

var profile = {
    "name": "name",
    "xAccountId": "id",
    "returnPolicy": returnPolicy,
    "shipping": shipping
};

var profile_create = { "p": profile };

val = a.decode(profile_created_schema, a.encode(profile_created_schema, profile_create));

assert_json(val, '{"p":{"xId":null,"name":"name","siteCode":null,"xAccountId":"id","payment":null,"shipping":{"shippingLocaleServices":[{"rateType":"FLAT","localeType":"DOMESTIC","applyPromotionalShippingRule":true,"shippingServiceOptions":[{"sellerPriority":1,"serviceName":"service","cost":{"amount":5,"code":"USD"},"discountAmount":null,"additionalCost":null,"packagingHandlingCost":null,"surcharge":null,"shipToLocations":null}]}]},"returnPolicy":{"description":"return policy 1","returnAccepted":null,"buyerPaysReturnShipping":null,"returnByDays":null,"refundMethod":null},"marketSpecifics":null}}');

var inventory_schema = JSON.parse(fs.readFileSync('Inventory.avsc', 'utf8'));

var inventory = {
    "items": [ {"sku":"123", "title":"my title", "currentPrice": "1.00", "url": "http://x.com", "dealOfTheDay": "true"},
	     {"sku":"456", "title":"my title 2", "currentPrice": "2.00", "url": "http://x.com", "dealOfTheDay": "false"}]
};

val = a.decode(inventory_schema, a.encode(inventory_schema, inventory));
assert_json(val, '{"items":[{"sku":"123","title":"my title","currentPrice":"1.00","url":"http://x.com","dealOfTheDay":"true"},{"sku":"456","title":"my title 2","currentPrice":"2.00","url":"http://x.com","dealOfTheDay":"false"}]}');

var nested_schema = JSON.parse('{"type":"record","name":"SearchRequest", "version":"1.0.1","namespace":"com.x.pingpong","fields":[{"name":"query","type":"string"},{"name":"xyz","type":{"type":"record","name":"ref", "version":"","fields":[{"name":"sub","type":"string"}]}}]}');

console.log(a.decode(nested_schema, a.encode(nested_schema, JSON.parse('{"query":"x","xyz": {"sub":"abc"}}'))));

var producttype_get_schema = JSON.parse(fs.readFileSync('get', 'utf8'));

var get = {"locale": {"language": "EN", "country": "US"}};

a.encode(producttype_get_schema, get);

var producttype_get_succeeded_schema = JSON.parse(fs.readFileSync('getSucceeded.avsc', 'utf8'));

var get_succeeded = fs.readFileSync('getSucceeded.bin', 'binary');

console.log(a.decode(producttype_get_succeeded_schema, get_succeeded));


