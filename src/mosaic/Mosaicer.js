/*
    # Mosaicer

    - getMosaic( sourceImg [, dimension, tags])
*/

import gm from 'gm';
import Q from 'q';
import GetPixels from 'get-pixels';
import winston from 'winston';
import ndarray from 'ndarray';

function set( images, i, j ) {
    return function( img ) {
        images.set( i, j, img );
        winston.info( 'image', i, j, img );
        return Q().thenResolve();
    };
}

function takeRandom( array ) {
    var max = array.length - 1,
        min = 0;

    if ( array.length === 1 ) {
        return array[ 0 ];
    }
    return array[ Math.floor( Math.random() * ( max - min + 1 ) + min ) ];
}

function pick( imgArray ) {
    var val = imgArray && imgArray.length ? takeRandom( imgArray ).path : false;
    return function() {
        return Q().thenResolve( val );
    };
}

class Mosaicer {
    constructor( store ) {
        this.store = store;
    }

    _getDimensions( source ) {
        var defer = Q.defer();
        gm( source )
            .size( function( err, dim ) {
                winston.info( source, dim );
                if ( !err && dim ) {
                    defer.resolve([ dim.width, dim.height ]);
                } else {
                    defer.reject( err );
                }
            });
        return defer.promise;
    }

    _getRGB( source ) {
        return Q.nfcall( GetPixels, source, 'image/jpeg' );
    }

    
    // TODO
    // future optimization: pre-bucketize the colors in the image, then query for buckets
    // to further reduce DB calls
    _findPixels( pixels ) {
        var defer = Q.defer();
        var self = this;
        var columns = pixels.shape[0];
        var rows = pixels.shape[1];
        var promises = [];
        var colors = {};

        function colorToArray( c ) {
            return c.split(',').map( function( rgb ) {
                return parseInt( rgb, 10 );
            });
        }

        for (var i = 0; i < columns; i++) {
            for (var j = 0; j < rows; j++) {
                var rgb = [ pixels.get( i, j, 0 ), pixels.get( i, j, 1 ), pixels.get( i, j, 2 ) ];
                colors[ rgb.join( ',' ) ] = [];
            }
        }

        console.log( Object.keys( colors ).length );

        Object.keys( colors )
            .forEach( function( color ) {
                var prom = Q.delay()
                            .then( self.store.query.bind( self.store, colorToArray( color ) ) )
                            .then( function( images ) {
                                colors[ color ] = images;
                                return Q().thenResolve();
                            });
                promises.push( prom );
            });
        
        Q.all( promises )
        .then(function() {
            var images = ndarray( [], [ columns, rows ] );
            var pickPromises = [];


            for (var i = 0; i < columns; i++) {
                for (var j = 0; j < rows; j++) {
                    var rgb = [ pixels.get( i, j, 0 ), pixels.get( i, j, 1 ), pixels.get( i, j, 2 ) ];
                    var pickProm = Q.delay()
                                    .then( pick( colors[ rgb.join( ',' ) ] ) )
                                    .then( set( images, i, j ) );
                    pickPromises.push( pickProm );
                }
            }
            Q.all( pickPromises )
            .then( function() {
                defer.resolve( images );
            });

        });

        return defer.promise;
    }

    // TODO make images as 2x2 ndarray
    // then stitch smaller parts first by divide and conquer
    // lastly stich smaller parts together to final mosaic
    _stitch( images ) {
        var columns = images.shape[0];
        var rows = images.shape[1];
        var mosaic = gm().background( '#000' );

        console.log( images.data );

        for (var x = 0; x < columns; x++) {
            for (var y = 0; y < rows; y++) {
                var img = images.get( x, y ),
                    page = '+' + (x*500) + '+' + (y*500);

                winston.info( 'stiching image', img, x, y );
                if ( img ) {
                    mosaic
                        .in( '-page', page )
                        .in( img );
                }
            }
        }

        mosaic
            .mosaic()
            .write( 'mosaic.jpg', function( err ) {
                if ( err ) {
                    winston.info( 'error', err );
                } else {
                    winston.info( 'mosaic created' );
                }
            } );
            
    }

    _resize( patchSize, source, size ) {
        var defer = Q.defer(),
            newSize = [ Math.floor( size[0] / patchSize ), Math.floor( size[1] / patchSize ) ],
            newFilename = source + newSize[0] + 'x' + newSize[1];

        gm( source )
            .resize( newSize[ 0 ], newSize[ 1 ] )
            .write( newFilename, function( err ) {
                if ( !err ) {
                    defer.resolve( newFilename );
                } else {
                    defer.reject( err );
                }
            });
        return defer.promise;
    }

    getMosaic( source, patchSize ) {
        var resizeTo = this._resize.bind( this._resize, patchSize, source );

        this
        ._getDimensions( source )
        .then( resizeTo )
        .then( this._getRGB.bind( this ) )
        .then( this._findPixels.bind( this ) )
        .then( this._stitch );
    }
}

export default Mosaicer;