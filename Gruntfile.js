module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-typescript');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-open');

  grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),
      typescript: {
          base: {
              src: ['ts/**/*.ts'],
              dest: 'js/ImprovedInitiative.js',
              options: {
                  module: 'amd',
                  target: 'es5',
                  declaration: true
              }
          },
          test: {
              src: ['test/**/*.ts'],
              dest: 'js/test.js',
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
      watch: {
        typescript: {
          files: '**/*.ts',
          tasks: ['typescript']
        },
        lesscss: {
          files: '**/*.less',
          tasks: ['less']
        }
      }
  });

  grunt.registerTask('default', 'watch');
};