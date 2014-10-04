/*
    # Mosaicer

    - getMosaic( sourceImg [, dimension, tags])
*/

import FS from 'fs';
import gm from 'gm';
import Q from 'q';
import path from 'path';
import GetPixels from 'get-pixels';
import winston from 'winston';

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

    _takeRandom( array ) {
        var max = array.length - 1,
            min = 0;
        return array[ Math.floor( Math.random() * ( max - min + 1 ) + min ) ];
    }

    _findPixels( pixels ) {
        var defer = Q.defer();
        var self = this;
        var columns = pixels.shape[0];
        var promises = [];
        var images = [];

        for (var i = 0; i <= pixels.shape[0] - 1; i++) {
            for (var j = 0; j <= pixels.shape[1] - 1; j++) {
                var rgb = [ pixels.get( i, j, 0 ), pixels.get( i, j, 1 ), pixels.get( i, j, 2 ) ];
                promises.push( Q.ninvoke( self.store, 'query', rgb, 8 ) );
            }
        }

        Q
        .all( promises )
        .then( function( imgArrays ) {
            for (var i = 0; i <= imgArrays.length - 1; i++) {
                if ( imgArrays[i].length ) {
                    images.push( self._takeRandom( imgArrays[i] ).path ); 
                } else {
                    images.push( false );
                }
            }
            winston.info( images );
            defer.resolve( [ columns ].concat( images ) );
        })
        .fail( defer.reject.bind( defer ) );

        return defer.promise;
    }

    _stitch( images ) {
        var columns = images.splice( 0, 1 )[0];
        var mosaic = gm();

        images.forEach( function( img, idx ) {
            var x = idx % columns,
                y = idx < columns ? 0 : Math.floor( idx / columns );
            winston.debug( 'stiching image', idx );
            if ( img ) {
                mosaic
                .in( '-page', '+' + (x*500) + '+' + (y*500) )
                .in( img );
            }
        });

        mosaic
            .mosaic()
            .write( 'mosaic.jpg', function( err ) {
                if ( err ) {
                    winston.error( err );
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

    getMosaic( source, patchSize, tags ) {
        var dir = path.dirname( source ),
            file= path.basename( source );

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