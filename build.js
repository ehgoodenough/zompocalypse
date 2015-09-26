var gulp = require("gulp")
var gulp_if = require("gulp-if")
var gulp_util = require("gulp-util")
var gulp_size = require("gulp-size")
var gulp_debug = require("gulp-debug")
var gulp_order = require("gulp-order")
var gulp_concat = require("gulp-concat")
var gulp_inline = require("gulp-inline")
var gulp_uglify = require("gulp-uglify")
var gulp_connect = require("gulp-connect")
var gulp_nwify = require("gulp-nw-builder")
var gulp_browserify = require("gulp-browserify")
var gulp_minify_css = require("gulp-minify-css")
var gulp_minify_html = require("gulp-minify-html")
var gulp_prefixify_css = require("gulp-autoprefixer")

var opn = require("opn")
var chalk = require("chalk")
var yargs = require("yargs")

var build = function() {
    gulp.src("./source/index.html")
        .pipe(gulp_minify_html())
        .pipe(gulp.dest("./build/web"))
        .pipe(gulp_connect.reload())
    gulp.src("./source/**/*.css")
        .pipe(gulp_minify_css())
        .pipe(gulp_prefixify_css())
        .pipe(gulp.dest("./build/web"))
        .pipe(gulp_connect.reload())
    gulp.src("./source/index.js")
        .pipe(gulp_browserify({
            transform: [
                "reactify",
                "babelify"
            ]
        }))
        .pipe(gulp_uglify())
        .pipe(gulp.dest("./build/web"))
        .pipe(gulp_connect.reload())
}

build()

if(yargs.argv.server) {
    gulp.watch("./source/**/*", build)
    gulp_connect.server({
        root: __dirname + "/build/web",
        livereload: true,
        port: 8080
    })
    opn("http://localhost" + ":" + 8080)
}
