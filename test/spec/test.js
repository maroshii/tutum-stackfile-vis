/* jshint camelcase: false */
/* global describe, it, assert */

(function () {
  'use strict';

  describe('JSON Stackfile to D3 data tree', function () {
    var fn = window.App.createHierarchy;

    it('should convert only the root element', function () {
      var input = {
        lib: { image: 'lib', target_num_container: 3 }
      };

      var expected = {
        name: 'lib',
        embedded: input.lib
      };

      assert.deepEqual(fn(input),expected);
    });

    it('should convert root children elements if links exist ',function() {
      var input = {
        lib: { image: 'lib', target_num_container: 3, links: ['web'] },
        web: { image: 'web', target_num_container: 5 }
      };

      var expected = {
        name: 'lib',
        embedded: input.lib,
        children: [{
          name: 'web',
          embedded: input.web
        }]
      };
      
      assert.deepEqual(fn(input),expected);
    });

    it('should recursively convert all link',function() {
      var input = {
        lib: { image: 'lib', target_num_container: 3, links: ['web','cron'] },
        web: { image: 'web', target_num_container: 5, links: ['redis', 'mysql', 'mongodb'] },
        cron: { image: 'cron', target_num_container: 2, links: ['elasticsearch']},
        redis: { image: 'redis' },
        mysql: { image: 'mysql' },
        mongodb: { image: 'mongodb' },
        elasticsearch: { image: 'elasticsearch', target_num_container: 1 },
      };

      var expected = {
        name: 'lib',
        embedded: input.lib,
        children: [{
          name: 'web',
          embedded: input.web,
          children: [{
            name: 'redis',
            embedded: input.redis
          },{
            name: 'mysql',
            embedded: input.mysql
          },{
            name: 'mongodb',
            embedded: input.mongodb
          }]
        },{
          name: 'cron',
          embedded: input.cron,
          children: [{
            name: 'elasticsearch',
            embedded: input.elasticsearch
          }]
        }]
      };

      assert.deepEqual(fn(input),expected);

    });

    it('should gracefully omit a link of it doesn\'t exist in the file',function() {
      var input = {
        lib: { image: 'lib', target_num_container: 3, links: ['web'] },
        web: { image: 'web', target_num_container: 5, links: ['redis'] }
      };

      var expected = {
        name: 'lib',
        embedded: input.lib,
        children: [{
          name: 'web',
          embedded: input.web
        }]
      };

      assert.deepEqual(fn(input),expected);

    });


  });
})();
