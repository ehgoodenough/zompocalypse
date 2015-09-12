var gulp = require("gulp")
var gulp_util = require("gulp-util")
var gulp_micro = require("gulp-micro")
var gulp_inline = require("gulp-inline")
var gulp_uglify = require("gulp-uglify")
var gulp_connect = require("gulp-connect")
var gulp_filesize = require("gulp-filesize")
var gulp_minify_css = require("gulp-minify-css")
var gulp_minify_html = require("gulp-minify-html")
var gulp_prefixify_css = require("gulp-autoprefixer")

gulp.task("default", function() {
    gulp.src("./source/index.html")
        .pipe(gulp_inline({
            base: "./source",
        })).pipe(gulp.dest("./build"))
})

process.on("uncaughtException", function (error) {
    console.error(gulp_util.colors.red(error))
    gulp_util.beep()
})
