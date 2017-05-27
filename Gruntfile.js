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
      server: {
        src: ['server/*.ts'],
        outDir: 'server/',
        options: {
          module: 'commonjs',
          target: 'es5'
        }
      },
    },
    less: {
      default: {
        files: {
          "public/css/improved-initiative.css": ["lesscss/improved-initiative.less"]
        }
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

  grunt.registerTask('build_dev', ['ts:server', 'less']);
  grunt.registerTask('build_min', ['ts:server', 'less']);
  grunt.registerTask('default', ['build_dev', 'watch']);
  grunt.registerTask('postinstall', ['build_min']);
};