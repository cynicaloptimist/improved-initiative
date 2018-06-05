module.exports = function (grunt) {
  grunt.loadNpmTasks('grunt-ts');
  grunt.loadNpmTasks('grunt-webpack');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    ts: {
      options: {
        removeComments: false,
        additionalFlags: '--strictNullChecks'
      },
      server: {
        src: ['server/*.ts'],
        options: {
          module: 'commonjs',
          target: 'es5'
        }
      },
    },
    webpack: {
      options: {
        keepalive: false
      },
      //prod: require('./webpack.config.prod'), Temporarily disabled for #209
      dev: require('./webpack.config')
    },
    less: {
      default: {
        files: {
          "public/css/improved-initiative.css": ["lesscss/improved-initiative.less"]
        }
      }
    },
    concat: {
      js_dependencies: {
        src: [
          'node_modules/jquery/dist/jquery.js',
          'node_modules/mousetrap/mousetrap.js',
          'node_modules/browser-filesaver/FileSaver.js',
          'node_modules/markdown-it/dist/markdown-it.js'
        ],
        dest: 'public/js/dependencies.js',
        sourceMap: true
      },
      js_dependencies_min: {
        src: [
          'node_modules/jquery/dist/jquery.min.js',
          'node_modules/mousetrap/mousetrap.min.js',
          'node_modules/browser-filesaver/FileSaver.min.js',
          'node_modules/markdown-it/dist/markdown-it.min.js'
        ],
        dest: 'public/js/dependencies.js'
      }
    },
    watch: {
      tsserver: {
        files: 'server/**/*.ts',
        tasks: ['ts:server']
      },
      lesscss: {
        files: 'lesscss/**/*.less',
        tasks: ['less']
      }
    },
    copy: {
      main: {
        files: [
          { expand: true, cwd: 'node_modules/font-awesome/fonts/', src: ['**'], dest: 'public/fonts/' }
        ]
      }
    }
  });

  grunt.registerTask('build_dev', ['webpack:dev', 'ts:server', 'less', 'concat:js_dependencies']);
  grunt.registerTask('build_min', [/*'webpack:prod', */'ts:server', 'less', 'concat:js_dependencies_min']);
  grunt.registerTask('default', ['build_dev', 'watch']);
  grunt.registerTask('postinstall', ['copy', 'build_min']);
};