var gulp = require("gulp");
var runSequence = require("run-sequence");
var commandLineArgs = require("command-line-args");
var htmlGulp = require("./gulp/html.js");
var jsGulp = require("./gulp/js.js");
var assetsGulp = require("./gulp/assets.js");
var shaderGulp = require("./gulp/shader.js");

var options = commandLineArgs([
  { name: "task", type: String, defaultOption: true },
  { name: "environment", alias: "e", type: String },
]);

var timestamp = new Date().getTime();

switch (options.task) {
  case "serve":
    var browserSync = require("browser-sync").create();

    browserSync.init({
      server: {
        baseDir: "public",
      },
      notify: false,
      open: false,
      reloadOnRestart: true,
      logConnections: false,
      logFileChanges: false,
      online: true,
    });

    gulp.task(
      "html-build",
      htmlGulp.build.bind(this, gulp, browserSync, timestamp)
    );
    gulp.task(
      "assets-build",
      assetsGulp.build.bind(this, gulp, browserSync, timestamp)
    );
    gulp.task(
      "shader-build",
      shaderGulp.build.bind(this, gulp, browserSync, timestamp)
    );
    gulp.task(
      "shader-serve",
      shaderGulp.serve.bind(this, gulp, browserSync, timestamp)
    );
    gulp.task(
      "js-serve",
      jsGulp.serve.bind(this, gulp, browserSync, timestamp)
    );

    gulp.task("serve", function () {
      gulp.watch(["src/index.html"], gulp.series("html-build"));

      gulp.task("html-build")();
      gulp.task("assets-build")();
      gulp.task("shader-build")();
      gulp.task("shader-serve")();
      gulp.task("js-serve")();

      // gulp.series("html-build", "assets-build")();
      // gulp.series("shader-build")();
      // gulp.series("shader-serve", "js-serve")();

      //
      //       runSequence(
      //         ["html-build", "assets-build"],
      //         ["shader-build"],
      //         ["shader-serve", "js-serve"]
      //       );
    });

    break;

  case "build":
    gulp.task(
      "html-build",
      htmlGulp.build.bind(this, gulp, browserSync, timestamp)
    );
    gulp.task(
      "assets-build",
      assetsGulp.build.bind(this, gulp, browserSync, timestamp)
    );
    gulp.task(
      "shader-build",
      shaderGulp.build.bind(this, gulp, browserSync, timestamp)
    );
    gulp.task(
      "js-build",
      jsGulp.build.bind(this, gulp, browserSync, timestamp)
    );

    gulp.task("build", function () {
      runSequence(
        ["html-build", "assets-build"],
        ["shader-build"],
        ["js-build"]
      );
    });

    break;
}
