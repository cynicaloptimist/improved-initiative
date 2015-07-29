module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-typescript');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-open');

  grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),
      connect: {
          server: {
              options: {
                  port: 8080,
                  base: './'
              }
          }
      },
      typescript: {
          base: {
              src: ['ts/**/*.ts'],
              dest: 'js/ImprovedInitiative.js',
              options: {
                  module: 'amd',
                  target: 'es5'
              }
          },
          test: {
              src: ['test/**/*.ts'],
              dest: 'js/ImprovedInitiativeTests.js',
              options: {
                  module: 'amd',
                  target: 'es5'
              }
          }
      },
      less: {
        development: {
          options: {
            paths: ["."]
          },
          files: {
            "tracker.css": "tracker.less"
          }
        }
      },
      mochaTest: {
        test: {
          src: ['js/ImprovedInitiativeTests.js'],
        }
      },
      watch: {
        typescript: {
          files: '**/*.ts',
          tasks: ['typescript']
        },
        lesscss: {
          files: '**/*.less',
          tasks: ['less']
        },
        mochaTest: {
          files: 'test/*.js',
          tasks: ['mochaTest']
        }
      },
      open: {
          dev: {
              path: 'http://localhost:8080/index.html'
          }
      }
  });

  grunt.registerTask('default', ['connect', 'open', 'watch']);
};