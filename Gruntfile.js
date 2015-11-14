module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-ts');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-open');

  grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),
      ts: {
          options: {
            removeComments: false,
          },
          default: {
              src: ['ts_src/**/*.ts'],
              out: 'public/js/ImprovedInitiative.js',
              options: {
                  module: 'amd',
                  target: 'es5'
              }
          },
          test: {
              src: ['test/**/*.ts', 'ts_src/**/*.ts'],
              out: 'public/js/test.js',
              options: {
                  module: 'amd',
                  target: 'es5'
              }
          },
          server : {
              src: ['server/**/*.ts'],
              outDir: '.',
              options: {
                module: 'commonjs',
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
            "public/css/tracker.css": "tracker.less"
          }
        }
      },
      watch: {
        ts: {
          files: '**/*.ts',
          tasks: ['ts']
        },
        lesscss: {
          files: '**/*.less',
          tasks: ['less']
        }
      }
  });

  grunt.registerTask('default', ['ts', 'less']);
};