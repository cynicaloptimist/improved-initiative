const appVersion = require("./package.json").version;
const { spawnSync } = require("child_process");
const webpack = require("webpack");

module.exports = function (grunt) {
  grunt.loadNpmTasks("grunt-webpack");
  grunt.loadNpmTasks("grunt-contrib-less");
  grunt.loadNpmTasks("grunt-contrib-watch");

  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    webpack: {
      options: {
        keepalive: false
      },
      dev: require("./webpack.config.dev"),
      prod: require("./webpack.config.prod")
    },
    less: {
      default: {
        files: {
          ["public/css/improved-initiative." + appVersion + ".css"]: [
            "lesscss/improved-initiative.less"
          ]
        }
      }
    },
    watch: {
      tsserver: {
        files: "server/**/*.ts",
        tasks: ["ts:server"]
      },
      lesscss: {
        files: "lesscss/**/*.less",
        tasks: ["less"]
      }
    }
  });

  grunt.registerTask("ts:server", "Compile the server TypeScript", function () {
    const result = spawnSync(
      process.execPath,
      [
        require.resolve("typescript/bin/tsc"),
        "--project",
        "./server/tsconfig.json"
      ],
      { stdio: "inherit" }
    );

    if (result.error) {
      grunt.log.error(result.error);
    }

    return result.status === 0;
  });

  grunt.registerTask(
    "webpack:build",
    "Build the production client",
    function () {
      const done = this.async();
      const compiler = webpack(require("./webpack.config.prod"));

      compiler.run((error, stats) => {
        if (error) {
          grunt.log.error(error);
        } else {
          grunt.log.writeln(stats.toString({ colors: true }));
        }

        const failed = Boolean(error) || Boolean(stats && stats.hasErrors());
        compiler.close(closeError => {
          if (closeError) {
            grunt.log.error(closeError);
          }
          done(!failed && !closeError);
        });
      });
    }
  );

  grunt.registerTask("build_dev", ["webpack:dev", "ts:server", "less"]);
  grunt.registerTask("build_min", ["webpack:build", "ts:server", "less"]);
  grunt.registerTask("server_watch", ["ts:server", "watch"]);
  grunt.registerTask("default", ["build_dev", "watch"]);
};
