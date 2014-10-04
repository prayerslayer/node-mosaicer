/*
    # Mosaicer

    - getMosaic( sourceImg [, dimension, tags])
*/

import gm from 'gm';
import Q from 'q';
import GetPixels from 'get-pixels';
import winston from 'winston';

function takeRandom( array ) {
    var max = array.length - 1,
        min = 0;

    if ( array.length === 1 ) {
        return array[ 0 ];
    }
    return array[ Math.floor( Math.random() * ( max - min + 1 ) + min ) ];
}

function pick( imgArray ) {
    console.log( 'picking from', imgArray );
    var val = imgArray && imgArray.length ? takeRandom( imgArray ).path : false;
    return Q().thenResolve( val );
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

    

    _findPixels( pixels ) {
        var defer = Q.defer();
        var self = this;
        var columns = pixels.shape[0];
        var funcs = [];
        var images = [];


        for (var i = 0; i <= pixels.shape[0] - 1; i++) {
            for (var j = 0; j <= pixels.shape[1] - 1; j++) {
                var rgb = [ pixels.get( i, j, 0 ), pixels.get( i, j, 1 ), pixels.get( i, j, 2 ) ];
                funcs.push( self.store.query.bind( self.store, rgb, 8 ) );
            }
        }

        winston.info( funcs.length );

        var all = funcs.reduce( function( prev, curr, idx  ) {
                        // console.log( idx, typeof prev, typeof curr );
                        return prev
                                    .then( pick )
                                    .then( function( picked ) {
                                        images.push( picked );
                                        return Q().thenResolve();
                                    })
                                    .then( curr );
                    }, Q().thenResolve() );

        console.log( all );

        all
        // .then( pick )
        .then( function() {
            console.log( images );
            defer.resolve( [ columns ].concat( images ) );
        });

        return defer.promise;
    }

    _stitch( images ) {
        var columns = images.splice( 0, 1 )[0];
        var mosaic = gm();

        images.forEach( function( img, idx ) {
            var x = idx % columns,
                y = idx < columns ? 0 : Math.floor( idx / columns );
            winston.info( 'stiching image', img, x, y );
            if ( img ) {
                mosaic
                .in( '-page', '+' + (x*540) + '+' + (y*540) )
                .in( img );
            }
        });

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