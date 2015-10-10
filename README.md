# gulp-parameters-generator

Allows to generate parameters from the given parameters template based on users given values in CLI.

## Usage

```javascript
var parametersGenerator = require('gulp-parameters-generator');

gulp.task('generate-parameters', function() {
    return gulp.src('./parameters.json.dist')
        .pipe(parametersGenerator('./parameters.json'))
        .pipe(gulp.dest('./'));
});
```

## Todos

* cover with tests
* more documentation and samples