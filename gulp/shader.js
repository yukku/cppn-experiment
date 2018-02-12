var gutil = require('gulp-util');
var rename = require('gulp-rename');
var template = require('gulp-template');
var glslify = require("gulp-glslify");
var watch = require('gulp-watch');
module.exports = {

    build: function(gulp, browserSync, timestamp){
        return gulp.src("src/shader/**/*.{vert,frag,glsl}")
            .pipe(glslify())
            .pipe(gulp.dest("shader_precompiled"));
    },

    serve: function(gulp, browserSync, timestamp){
        return watch("src/shader/**/*.{vert,frag,glsl}")
            .pipe(glslify())
            .pipe(gulp.dest("shader_precompiled"));
    },

    deploy: function(gulp, browserSync, timestamp, distPath){

        var distFolder = (distPath) ? distPath + "/shader_precompiled" : "dist/shader_precompiled"

        return gulp.src("src/shader/**/*.{vert,frag,glsl}")
            .pipe(glslify())
            .pipe(gulp.dest(distFolder))
    }

}