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
        outDir: 'build/client',
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
          'build/client.min.js': ['build/client/*.js']
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
      js_dependencies: {
        src: [
          'node_modules/awesomplete/awesomplete.js',
          'node_modules/mousetrap/mousetrap.js',
          'node_modules/socket.io-client/dist/socket.io.js',
          'node_modules/moment/moment.js',
          'node_modules/browser-filesaver/FileSaver.js',
          'node_modules/markdown-it/dist/markdown-it.js',
          'node_modules/react/dist/react.js',
          'node_modules/react-dom/dist/react-dom.js',
          'node_modules/redux/dist/redux.js'
        ],
        dest: 'public/js/vendors.js'
      },
      js_client: {
        src: ['ImprovedInitiative.Client/*.js'],
        dest: 'public/js/ImprovedInitiative.js',
        sourceMap: true
      },
      js_dependencies_min: {
        src: [
          'node_modules/awesomplete/awesomplete.min.js',
          'node_modules/mousetrap/mousetrap.min.js',
          'node_modules/socket.io-client/dist/socket.io.min.js',
          'node_modules/moment/min/moment.min.js',
          'node_modules/browser-filesaver/FileSaver.min.js',
          'node_modules/markdown-it/dist/markdown-it.min.js',
          'node_modules/react/dist/react.min.js',
          'node_modules/react-dom/dist/react-dom.min.js',
          'node_modules/redux/dist/redux.min.js'
        ],
        dest: 'public/js/dependencies.js'
      },
      js_client_min: {
        src: ['client.min.js'],
        dest: 'public/js/ImprovedInitiative.js',
        sourceMap: true
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
        files: 'client/*.ts',
        tasks: ['ts:default', 'concat:js_client']
      },
      server: {
        files: 'server/*.ts',
        tasks: ['ts:server']
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

  grunt.registerTask('build_dev', ['ts:default', 'ts:server', 'less', 'concat:js_client', 'concat:js_dependencies', 'concat:css']);
  grunt.registerTask('build_min', ['ts:default', 'ts:server', 'uglify', 'less', 'concat:js_client_min', 'concat:js_dependencies_min', 'concat:css']);
  grunt.registerTask('default', ['build_dev', 'watch']);
  grunt.registerTask('postinstall', ['copy', 'build_min']);
};