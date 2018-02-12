var gutil = require("gulp-util");
var rename = require("gulp-rename");
var copy = require("gulp-copy");
var through = require('through2');

module.exports = {

    build: function(gulp, browserSync, timestamp){

        var verify = function () {
        return through({objectMode: true}, function(file, enc, done){
                gutil.log(file.path  + " copied");
                done(null, file);
            }, function(done){
                done();
            })
        }

        return gulp.src(["assets/**/*"])
            .pipe(copy("public", {prefix: 1}))
            .pipe(verify())
            .pipe(browserSync ? browserSync.stream() : gutil.noop());
    },

    deploy: function(gulp, browserSync, timestamp, distPath){

        var distFolder = (distPath) ? distPath : "dist"
        console.log(distFolder);
        var verify = function () {
            return through({objectMode: true}, function(file, enc, done){
                gutil.log(file.path  + " copied");
                done(null, file);
            }, function(done){
                done();
            })
        }

        return gulp.src(["assets/**/*"])
            .pipe(copy(distFolder, {prefix: 1}))
            .pipe(verify())
            .pipe(browserSync ? browserSync.stream() : gutil.noop());
    },

}