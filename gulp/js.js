var browserify = require("browserify");
var babel = require("gulp-babel");
var uglify = require("gulp-uglify");
var babelify = require("babelify");
var source = require("vinyl-source-stream");
var gutil = require("gulp-util");
var buffer = require("vinyl-buffer");
var watchify = require("watchify");
var uglifyes = require("gulp-uglifyes");

module.exports = {
  build: function (gulp, timestamp) {
    var bundle = function (gulp, timestamp) {
      return transformer
        .bundle()
        .on("error", function (err) {
          gutil.log(err.stack, err.message);
          process.exit(1);
        })
        .pipe(source("app." + "build" + ".js"))
        .pipe(buffer())
        .pipe(uglifyes())
        .pipe(gulp.dest("./public"))
        .on("data", function () {});
    };

    var transformer = browserify({
      cache: {},
      packageCache: {},
      debug: false,
      fullPaths: false,
      entries: ["src/main.js"],
    });

    transformer.transform(babelify, {
      presets: ["es2015"],
      compact: true,
    });

    transformer.on("time", function (time) {
      var fmted = Math.round(time / 10) / 100 + "s";
      gutil.log("JS transform took " + gutil.colors.bold.cyan(fmted));
    });

    return bundle(gulp, timestamp);
  },

  serve: function (gulp, browserSync, timestamp) {
    var bundle = function (gulp, browserSync, timestamp) {
      return transformer
        .bundle()
        .on("error", function (err) {
          console.log(err);
          gutil.log(err.stack, err.message);
        })
        .pipe(source("app." + "build" + ".js"))
        .pipe(buffer())
        .pipe(gulp.dest("./public"))
        .on("data", function () {
          if (browserSync) browserSync.reload();
        });
    };

    var transformer = browserify({
      cache: {},
      packageCache: {},
      debug: true,
      fullPaths: false,
      entries: ["src/main.js"],
    });

    transformer.plugin(watchify, {
      ignoreWatch: ["**/node_modules/**"],
      poll: true,
    });

    transformer.transform(babelify, {
      presets: ["es2015"],
      compact: true,
    });

    transformer.on("update", bundle.bind(this, gulp, browserSync, timestamp));
    transformer.on("time", function (time) {
      var fmted = Math.round(time / 10) / 100 + "s";
      gutil.log("JS transform took " + gutil.colors.bold.cyan(fmted));
    });

    return bundle(gulp, browserSync, timestamp);
  },

  deploy: function (gulp, browserSync, timestamp, distPath) {
    var distFolder = distPath ? distPath + "/app" : "dist/app";

    return gulp
      .src(["src/**/*.js"])
      .pipe(
        babel({
          presets: ["es2015"],
          plugins: ["add-module-exports"],
        })
      )
      .pipe(uglify())
      .pipe(gulp.dest(distFolder));
  },
};
