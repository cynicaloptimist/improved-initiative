module.exports = function (grunt) {
  grunt.loadNpmTasks('grunt-ts');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-open');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    ts: {
      options: {
        removeComments: false,
      },
      default: {
        src: ['client/*.ts'],
        outDir: 'ImprovedInitiative.Client',
        options: {
          module: 'amd',
          target: 'es5'
        }
      },
      server: {
        src: ['server/*.ts'],
        outDir: '.',
        options: {
          module: 'commonjs',
          target: 'es5'
        }
      },
    },
    uglify: {
      options: {
        mangle: false
      },
      prod: {
        files: {
          'client.min.js': ['ImprovedInitiative.Client/*.js']
        }
      },
      socketio: {
        files: {
          'node_modules/socket.io-client/socket.io.min.js': ['node_modules/socket.io-client/socket.io.js']
        }
      }
    },
    less: {
      development: {
        options: {
          paths: ["."]
        },
        files: {
          "improved-initiative.less.css": "improved-initiative.less"
        }
      }
    },
    concat: {
      js: {
        src: [
          'node_modules/knockout/build/output/knockout-latest.debug.js',
          'node_modules/knockout-mapping/dist/knockout.mapping.js',
          'node_modules/jquery/dist/jquery.js',
          'node_modules/awesomplete/awesomplete.js',
          'node_modules/mousetrap/mousetrap.js',
          'node_modules/socket.io-client/socket.io.js',
          'node_modules/browser-filesaver/FileSaver.js',
          'node_modules/markdown-it/dist/markdown-it.js',
          'ImprovedInitiative.Client/*.js'
        ],
        dest: 'public/js/ImprovedInitiative.js'
      },
      js_min: {
        src: [
          'node_modules/knockout/build/output/knockout-latest.js',
          'node_modules/knockout-mapping/dist/knockout.mapping.min.js',
          'node_modules/jquery/dist/jquery.min.js',
          'node_modules/awesomplete/awesomplete.min.js',
          'node_modules/mousetrap/mousetrap.min.js',
          'node_modules/socket.io-client/socket.io.min.js',
          'node_modules/browser-filesaver/FileSaver.min.js',
          'node_modules/markdown-it/dist/markdown-it.min.js',
          'client.min.js'
        ],
        dest: 'public/js/ImprovedInitiative.js'
      },
      css: {
        src: [
          'node_modules/awesomplete/awesomplete.css',
          'improved-initiative.less.css'
        ],
        dest: 'public/css/improved-initiative.css'
      }
    },
    watch: {
      ts: {
        files: '**/*.ts',
        tasks: ['ts', 'concat:js']
      },
      lesscss: {
        files: '**/*.less',
        tasks: ['less', 'concat:css']
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

  grunt.registerTask('build_dev', ['ts:default', 'ts:server', 'less', 'concat:js', 'concat:css']);
  grunt.registerTask('build_min', ['ts:default', 'ts:server', 'uglify', 'less', 'concat:js_min', 'concat:css']);
  grunt.registerTask('default', ['build_dev', 'watch']);
  grunt.registerTask('postinstall', ['copy', 'build_min']);
};