var gulp = require("gulp")
var gulp_util = require("gulp-util")
var gulp_size = require("gulp-size")
var gulp_micro = require("gulp-micro")
var gulp_inline = require("gulp-inline")
var gulp_uglify = require("gulp-uglify")
var gulp_connect = require("gulp-connect")
var gulp_minify_css = require("gulp-minify-css")
var gulp_minify_html = require("gulp-minify-html")
var gulp_prefixify_css = require("gulp-autoprefixer")
var opn = require("opn")

gulp.task("default", function() {
    gulp.start("build")
})

gulp.task("build", function() {
    gulp.src("./source/index.html")
        .pipe(gulp_inline({
            base: "./source",
            js: gulp_uglify(),
            css: gulp_prefixify_css()
                .pipe(gulp_minify_css())
        }))
        .pipe(gulp_minify_html())
        .pipe(gulp_micro({limit: 13 * 1024}))
        .pipe(gulp_size({title: "JS13K"}))
        .pipe(gulp.dest("./build"))
        .pipe(gulp_connect.reload())
})

gulp.task("server", function() {
    gulp.start("build")
    gulp.watch("./source/**/*.*", function() {
        gulp.start("build")
    })
    gulp_connect.server({
        root: __dirname + "/build",
        livereload: true,
        port: 8080
    })
    opn("http://localhost:8080")
})

process.on("uncaughtException", function (error) {
    console.error(gulp_util.colors.red(error))
    gulp_util.beep()
})
