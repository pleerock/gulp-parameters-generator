var gulp = require('gulp');
var rename = require('gulp-rename');
var configParameters = require('../index.js');

gulp.task('generate-parameters', function() {
    return gulp.src('./parameters.json.dist')
        .pipe(configParameters('./parameters.json'))
        .pipe(gulp.dest('./'));
});