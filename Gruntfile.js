/*global module: true, require: true */
module.exports = function (grunt) {
  'use strict';
 
  var path = require('path');
  var nunjucks = require('nunjucks');
 
  grunt.option('stack', true);
 
  // Configuration
  var userConf = {
    patter_client_id: 'sQZSnTo-Cw9EIQyaXm-RnCKijCanJwxL',
    dev: {
      using_server: false
    },
    prod: {
      using_server: false
    }
  };
 
  if (grunt.file.exists('config.json')) {
    userConf = grunt.util._.merge(
      {},
      userConf,
      grunt.file.readJSON('config.json')
    );
  } else {
    grunt.log.warn('config.json not found; using defaults.');
  }
 
  var sourceDir = 'src';
  var buildDir = 'build';
  var distDir = 'dist';
 
  // Reusable template configuration
  function templateConfig(environment) {
    return {
      options: {
        root: sourceDir,
        site_config: userConf[environment]
      },
      src: [
        'src/*.njk',
        '!src/base.njk'
      ],
      dest: buildDir
    };
  }
 
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
 
    jshint: {
      files: [
        'gruntfile.js',
        'src/js/core/*.js'
      ],
      options: grunt.file.readJSON('.jshintrc')
    },
 
    nunjucks: {
      dev: templateConfig('dev'),
      prod: templateConfig('prod')
    },
 
    copy: {
      normal: {
        files: [{
          expand: true,
          cwd: buildDir,
          src: [
            '*.html',
            '**/*.css',
            'js/**/*.js',
            '**/*.ico',
            '**/*.png',
            '**/*.jpg',
            '**/*.gif',
            '**/*.mp3',
            'fonts/*'
          ],
          dest: distDir
        }]
      }
    },
 
    connect: {
      server: {
        options: {
          port: 9001,
          base: distDir,
          hostname: 'localhost',
          keepalive: false
        }
      }
    },
 
    clean: {
      build: [buildDir],
      dist: [distDir],
      all: [buildDir, distDir]
    },
 
    requirejs: {
      compile: {
        options: {
          appDir: sourceDir,
          baseUrl: '.',
          dir: buildDir,
          optimize: 'none',
          useSourceUrl: true,
          fileExclusionRegExp: /(^\.)|(~$)/,
          findNestedDependencies: true,
          optimizeAllPluginResources: true,
 
          text: {
            env: 'node'
          },
 
          paths: {
            'jquery': 'js/deps/require-jquery',
            'jquery-caret': 'js/deps/jquery.caret.min',
            'jquery-cookie': 'js/deps/jquery.cookie',
            'jquery-easydate': 'js/deps/jquery.easydate-0.2.4.min',
            'jquery-imagesloaded': 'js/deps/lib/jquery.imagesloaded.min',
            'jquery-jfontsize': 'js/deps/jquery.jfontsize-1.0',
            'jquery-titlealert': 'js/deps/jquery.titlealert.min',
            'jquery-translator': 'js/deps/jquery.translator',
            'underscore': 'js/deps/underscore-min',
            'bootstrap': 'js/deps/bootstrap.min',
            'moment': 'js/deps/moment.min',
            'util': 'js/core/util',
            'pnut': 'js/core/pnut',
            'pnut-api': 'js/core/pnut-api',
            'pnut-note': 'js/core/pnut-note',
            'backbone': 'js/deps/backbone-min',
            'jquery-pnut': 'js/deps/pnut',
            'jquery-cloud': 'js/deps/jqcloud-1.0.4.min'
          },
 
          shim: {
            'jquery-caret': ['jquery'],
            'jquery-cookie': ['jquery'],
            'jquery-easydate': ['jquery'],
            'jquery-imagefit': ['jquery'],
            'jquery-imagesloaded': ['jquery'],
            'jquery-jfontsize': ['jquery'],
            'jquery-titlealert': ['jquery'],
            'jquery-translator': ['jquery'],
            'jquery-cloud': ['jquery'],
            'bootstrap': ['jquery'],
            'underscore': {
              exports: '_'
            },
            'backbone': {
              exports: 'Backbone'
            }
          },
 
          modules: [
            {
              name: 'js/core/room',
              exclude: ['jquery']
            },
            {
              name: 'js/core/lobby',
              exclude: ['jquery']
            },
            {
              name: 'js/core/auth',
              exclude: ['jquery']
            }
          ]
        }
      }
    },
 
    watch: {
      options: {
        spawn: false
      },
 
      scripts: {
        files: ['src/**/*.js', 'src/template/**/*.njk'],
        tasks: ['jshint', 'rebuild:dev']
      },
 
      css: {
        files: ['src/**/*.css'],
        tasks: ['rebuild:dev']
      },
 
      templates: {
        files: ['src/**/*.njk'],
        tasks: ['nunjucks:dev', 'copy']
      },
 
      html: {
        files: ['src/**/*.html'],
        tasks: ['rebuild:dev']
      },
 
      assets: {
        files: [
          'src/**/*.ico',
          'src/**/*.png',
          'src/**/*.jpg',
          'src/**/*.gif',
          'src/**/*.mp3',
          'src/fonts/**/*'
        ],
        tasks: ['rebuild:dev']
      }
    }
  });
 
  // Load plugins
  [
    'grunt-contrib-jshint',
    'grunt-contrib-requirejs',
    'grunt-contrib-clean',
    'grunt-contrib-copy',
    'grunt-contrib-connect',
    'grunt-contrib-watch',
  ].forEach(grunt.loadNpmTasks);
 
  // Compile Nunjucks templates
  grunt.registerMultiTask(
    'nunjucks',
    'Compile Nunjucks templates',
    function () {
      var options = this.options();
 
      var env = nunjucks.configure(options.root, {
        autoescape: true,
        noCache: true,
        throwOnUndefined: false
      });
 
      this.filesSrc.forEach(function (src) {
        var relative = path.relative(options.root, src);
        var templateName = relative.split(path.sep).join('/');
        var dest = path.join(
          this.data.dest,
          relative.replace(/\.njk$/, '.html')
        );
 
        try {
          var html = env.render(templateName, {
            site_config: options.site_config
          });
 
          grunt.file.write(dest, html);
          grunt.log.ok('Rendered ' + src + ' -> ' + dest);
        } catch (error) {
          grunt.fail.warn(
            'Failed to render ' + src + ': ' + error.message
          );
        }
      }, this);
    }
  );

  grunt.registerTask('configjs', 'Generate client config', function () {
    var output = nunjucks.render(
      'src/template/config.njk',
      { patter_client_id: userConf.patter_client_id }
    );

    grunt.file.write('build/js/core/config.js', output);
  });
 
  // Full build pipeline
  grunt.registerTask('build', function (environment) {
    environment = environment || 'dev';
 
    if (environment !== 'dev' && environment !== 'prod') {
      grunt.fail.fatal('Unknown environment: ' + environment);
    }
 
    grunt.task.run([
      'clean:all',
      'jshint',
      'requirejs',
      'configjs',
      'nunjucks:' + environment,
      'copy'
    ]);
  });
 
  // Rebuild generated assets without cleaning output
  grunt.registerTask('rebuild', function (environment) {
    environment = environment || 'dev';
 
    grunt.task.run([
      'requirejs',
      'configjs',
      'nunjucks:' + environment,
      'copy'
    ]);
  });
 
  grunt.registerTask('dev', ['build:dev']);
  grunt.registerTask('dist', ['build:prod']);
 
  grunt.registerTask('server', [
    'dev',
    'connect:server',
    'watch'
  ]);
 
  grunt.registerTask('default', ['dev']);
};
