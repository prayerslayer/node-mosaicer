import Crypto from 'crypto';
import request from 'request';
import FS from 'fs';
import path from 'path';
import Q from 'q';
import winston from 'winston';

class ImageDownloader {
    constructor( line, processor, config ) {
        this.assemblyLine = line;
        this.processor = processor;
        this.config = config;
        this.interval = false;
        FS.mkdir( config.path );
    }

    _hash( string ) {
        return Crypto.createHash( 'sha1' ).update( string ).digest( 'hex' );
    }

    _download( uri ) {
        var tmpFile = path.normalize( this.config.path + path.sep ) + 'tmp_' + this._hash( uri );
        var defer = Q.defer();

        winston.info( 'downloading', uri );

        request( uri )
            .pipe( FS.createWriteStream( tmpFile ) )
            .on( 'close', function( err ) {
                if ( err ) {
                    console.log( err );
                    defer.reject( err );
                } else {
                    defer.resolve( tmpFile );
                }
            });
        return defer.promise;
    }

    _process( file ) {
        return this.processor
                    .normalize( file )
                    .then( function( normalized ) {
                        FS.unlink( file );
                        return Q().thenResolve( normalized );
                    });
    }

    _doWork() {
        var self = this;
        this.assemblyLine
            .pop( this.assemblyLine.FETCHED_LINE )
            .then( this._download.bind( this ) )
            .then( this._process.bind( this ) )
            .then( function( file ) {
                winston.info( 'saved to', file );
                self.assemblyLine.put( self.assemblyLine.DOWNLOADED_LINE, file );
            });
    }

    start() {
        if ( !this.interval ) {
            this.interval = setInterval( this._doWork.bind( this ), 5000 );
        }
    }

    stop() {
        if ( this.interval ) {
            clearInterval( this.interval );
        }
    }

}

export default ImageDownloader;