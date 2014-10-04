var gulp = require( 'gulp' ),
    jshint = require( 'gulp-jshint' ),
    traceur = require( 'gulp-traceur' );

gulp.task( 'build', function() {
    gulp
        .src( 'src/**/*.js' )
        .pipe( jshint() )
        .pipe( traceur() )
        .pipe( gulp.dest( 'dist' ) )
        .pipe( jshint.reporter('default') );
});