var gulp = require("gulp")
var gulp_if = require("gulp-if")
var gulp_util = require("gulp-util")
var gulp_debug = require("gulp-debug")
var gulp_inline = require("gulp-inline")
var gulp_uglify = require("gulp-uglify")
var gulp_connect = require("gulp-connect")
var gulp_nwify = require("gulp-nw-builder")
var gulp_minify_css = require("gulp-minify-css")
var gulp_minify_html = require("gulp-minify-html")
var gulp_prefixify_css = require("gulp-autoprefixer")

var babelify = require("babelify")
var uglifyify = require("uglifyify")
var browserify = require("browserify")
var watchify = require("watchify")

var vinyl_buffer = require("vinyl-buffer")
var vinyl_source = require("vinyl-source-stream")

var fs = require("fs")
var opn = require("opn")
var del = require("del")
var chalk = require("chalk")
var yargs = require("yargs")
var beepbeep = require("beepbeep")

browsering = browserify()
    .add("./source/index.js")
    .transform(babelify)
    .transform(uglifyify)

var error = function(error) {
    console.log(chalk.red(error))
    beepbeep()
}

var build = {
    "index.html": function() {
        console.log("Building index.html")
        gulp.src("./source/index.html")
            .pipe(gulp_minify_html())
            .pipe(gulp.dest("./build/web"))
            .pipe(gulp_connect.reload())
    },
    "index.js": function() {
        console.log("Building index.js")
        browsering.bundle().on("error", error)
            .pipe(vinyl_source("index.js"))
            .pipe(gulp.dest("./build/web"))
            .pipe(gulp_connect.reload())
    },
    "index.css": function() {
        console.log("Building index.css")
        gulp.src("./source/index.css")
            .pipe(gulp_minify_css())
            .pipe(gulp_prefixify_css())
            .pipe(gulp.dest("./build/web"))
            .pipe(gulp_connect.reload())
    }
}

build["index.html"]()
build["index.js"]()
build["index.css"]()

if(!!yargs.argv.server) {
    gulp.watch("./source/index.html", build["index.html"])
    gulp.watch("./source/index.js", build["index.js"])
    gulp.watch("./source/index.css", build["index.css"])
    gulp_connect.server({root: "./build/web", livereload: true, port: 8080})
    opn("http://localhost" + ":" + 8080)
}
