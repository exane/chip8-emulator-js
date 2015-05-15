var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var babelify = require("babelify");

//fast install
//npm i --save-dev browserify vinyl-source-stream babelify gulp-livereload gulp gulp-sass


gulp.task('browserify', function(){
  browserify('./js/main.js', {standalone: "app", debug: true})
  .transform(babelify)
  .bundle().on("error", function(err){
    console.log(err);
  })
  .pipe(source('app.js').on("error", function(err){
    console.log(err);
  }))
  .pipe(gulp.dest('./build/').on("error", function(err){
    console.log(err);
  }));
});

gulp.task("watch", function(){
  gulp.watch("./js/*", ["browserify"]);
})

gulp.task("default", ["watch", "browserify"]);
