var gutil = require('gulp-util');
var rename = require('gulp-rename');
var template = require('gulp-template');

module.exports = {

    build: function(gulp, browserSync, timestamp){

        return gulp.src('src/index.html')
            .pipe(template({
                timestamp: timestamp,
            }))
            .pipe(rename('index.html'))
            .pipe(gulp.dest('public'))
            .pipe(browserSync ? browserSync.stream() : gutil.noop());
    }

}