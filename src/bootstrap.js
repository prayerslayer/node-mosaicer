/* jshint ignore:start */
var argv = require('minimist')(process.argv.slice(2));
var traceur = require('traceur');
traceur.require.makeDefault(function(filename) {
  // don't transpile our dependencies, just our app
  return filename.indexOf('node_modules') === -1;
});
require( './' + argv.file );
// require( './index' );

/* jshint ignore:start */