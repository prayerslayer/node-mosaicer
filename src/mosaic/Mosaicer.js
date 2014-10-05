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

    
    // FIXME the error is here somewhere
    // previously the array was formed column-first instead of row-first
    // now it's 90 degrees rotated
    // and for some reason a square the size of source image height
    _findPixels( pixels ) {
        var defer = Q.defer();
        var self = this;
        var columns = pixels.shape[0];
        var promises = [];

        for (var i = 0; i <= pixels.shape[1] - 1; i++) {
            for (var j = 0; j <= pixels.shape[0] - 1; j++) {
                var rgb = [ pixels.get( j, i, 0 ), pixels.get( j, i, 1 ), pixels.get( j, i, 2 ) ];
                promises.push( Q.delay( (i+j)*100 ).then( self.store.query.bind( self.store, rgb, 8 ) ).then( pick ) );
            }
        }

        
        Q.all( promises )
        .then(function( images ) {
            defer.resolve( [ columns ].concat( images ) );
        });

        return defer.promise;
    }

    _stitch( images ) {
        var columns = images.splice( 0, 1 )[0];
        var count = images.length;
        var width = columns * 500;
        var height = Math.floor( count / columns ) * 500;
        var mosaic = gm().background( '#000' );
        winston.info( 'plotting', count, 'images in', columns, 'columns on', width, height, 'canvas' );
        images.forEach( function( img, idx ) {
            var x = idx % columns,
                y = idx < columns ? 0 : Math.floor( idx / columns ),
                page = '+' + (x*500) + '+' + (y*500);
            winston.info( 'stiching image #', idx, img, x, y );
            
            if ( img ) {
                mosaic
                    .in( '-page', page )
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