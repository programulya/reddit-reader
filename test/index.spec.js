/**
 * Created by programulya on 4/17/2015.
 */

var should = require('should');
var index = require('../source/index');

describe('index spec', function() {
    it('should index exists', function() {
        should(index).be.ok;
    });
});