# gulp-config-parameters

Allows to create and manage configuration files in your project. You can use [gulp-config-parameters][1] plugin
to automate how your configuration is created and managed.

## Usage

```javascript
var configParameters = require('gulp-config-parameters');

gulp.task('generate-parameters', function() {
    return gulp.src('./parameters.json.dist')
        .pipe(configParameters())
        .pipe(gulp.dest('./'));
});
```

## Todos

* cover with tests
* more documentation and samples