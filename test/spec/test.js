/* jshint camelcase: false */
/* global describe, it, assert */

(function () {
  'use strict';

  describe('JSON Stackfile to D3 data tree', function () {
    var fn = window.App.createHierarchy;

    it('should convert only the root element', function () {
      var input = {
        lb: { image: 'img:lb', target_num_container: 3 }
      };

      var expected = {
        name: 'lb',
        embedded: input.lb
      };

      assert.deepEqual(fn(input),expected);
    });

    it('should convert root children elements if links exist ',function() {
      var input = {
        lb: { image: 'img:lb', target_num_container: 3, links: ['web'] },
        web: { image: 'img:web', target_num_container: 5 }
      };

      var expected = {
        name: 'lb',
        embedded: input.lb,
        children: [{
          name: 'web',
          parent: 'lb',
          embedded: input.web
        }]
      };
      
      assert.deepEqual(fn(input),expected);
    });

    it('should recursively convert all link',function() {
      var input = {
        lb: { image: 'img:lb', target_num_container: 3, links: ['web','cron'] },
        web: { image: 'img:web', target_num_container: 5, links: ['redis', 'mysql', 'mongodb'] },
        cron: { image: 'img:cron', target_num_container: 2, links: ['elasticsearch']},
        redis: { image: 'img:redis' },
        mysql: { image: 'img:mysql' },
        mongodb: { image: 'img:mongodb' },
        elasticsearch: { image: 'img:elasticsearch', target_num_container: 1 },
      };

      var expected = {
        name: 'lb',
        embedded: input.lb,
        children: [{
          name: 'web',
          parent: 'lb',
          embedded: input.web,
          children: [{
            name: 'redis',
            parent: 'web',
            embedded: input.redis
          },{
            name: 'mysql',
            parent: 'web',
            embedded: input.mysql
          },{
            name: 'mongodb',
            parent: 'web',
            embedded: input.mongodb
          }]
        },{
          name: 'cron',
          parent: 'lb',
          embedded: input.cron,
          children: [{
            name: 'elasticsearch',
            parent: 'cron',
            embedded: input.elasticsearch
          }]
        }]
      };

      assert.deepEqual(fn(input),expected);

    });

    it('should gracefully omit a link of it doesn\'t exist in the file',function() {
      var input = {
        lb: { image: 'img:lb', target_num_container: 3, links: ['web'] },
        web: { image: 'img:web', target_num_container: 5, links: ['redis'] }
      };

      var expected = {
        name: 'lb',
        embedded: input.lb,
        children: [{
          name: 'web',
          parent: 'lb',
          embedded: input.web
        }]
      };

      assert.deepEqual(fn(input),expected);

    });


  });
})();
