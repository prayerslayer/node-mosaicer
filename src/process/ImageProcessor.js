import path from 'path';
import gm from 'gm';
import Q from 'q';
import ColorThief from 'couleur';
import winston from 'winston';

class ImageProcessor {
    constructor( config ) {
        this.config = config;
    }

    getColor( file ) {
        var defer = Q.defer();
        winston.info( 'analyzing', file );
        ColorThief.getColor( file, 5, function( err, c ) {
            if ( !err ) {
                // flickr "not available images" have this signature
                if ( c[0] === 42 && c[1] === 52 && c[2] === 64 ) {
                    defer.reject( new Error( 'probably a "not available" image' ) );
                } else {
                    defer.resolve({
                        file: file,
                        color: c
                    });
                }
            } else {
                defer.reject( err );
            }
        } );
        return defer.promise;
    }

    normalize( file ) {
        var self = this,
            defer = Q.defer(),
            filename = path.basename( file ),
            dir = path.dirname( file ) + path.sep,
            newFilename = dir + filename.substring( filename.indexOf( '_' ) + 1 ) + '.jpg';

        // crop square from center, then resize
        gm( file )
            .size( function( err, dim ) {
                if ( err  ) {
                    defer.reject( err );
                } else if ( dim ) {
                    var tileSize = Math.min( dim.width, dim.height );
                    gm( file )
                        .gravity( 'Center' )
                        .crop( tileSize, tileSize )
                        .resize( self.config.size.w, self.config.size.h + '>' )
                        .write( newFilename, function( err ) {
                            if ( !err ) {
                                defer.resolve( newFilename );
                            } else {
                                defer.reject( err );
                            }
                        });
                } else {
                    defer.reject( new Error( 'could not determine image size' ) );
                }
            });

        return defer.promise;
    }
}

export default ImageProcessor;