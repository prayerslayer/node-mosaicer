/*
    # SqliteImageStore
*/

import ImageStore from './ImageStore';
import SQLite from 'sqlite3';
import FS from 'fs';
import Crypto from 'crypto';
import OS from 'os';
import gm from 'gm';
import _ from 'lodash';
import request from 'request';
import winston from 'winston';

var COLOR_THRESHOLD = 64;

class SqliteImageStore extends ImageStore {
    constructor( folder ) {
        this.folder = folder || OS.tmpdir() + '/node-mosaicer';
        FS.mkdir( this.folder );
        SQLite.verbose();
        this.db = new SQLite.Database( 'node-mosaicer' );
        this.db.on( 'trace', winston.info.bind( winston ) );
        this.db.on( 'profile', winston.info.bind( winston ) );
        this._setup();
    }

    _setup() {
        var db = this.db;
        db.serialize( function() {
            // create table images
            db.run( 'CREATE TABLE IF NOT EXISTS mosaic_image ( ' +
                    'mi_id INTEGER CONSTRAINT c_mi_pk PRIMARY KEY AUTOINCREMENT, ' +
                    'mi_path TEXT, ' +
                    'mi_red INTEGER, ' +
                    'mi_green INTEGER, ' +
                    'mi_blue INTEGER ); '
                );

            // terms
            db.run( 'CREATE TABLE IF NOT EXISTS mosaic_term ( ' +
                    'mt_term TEXT CONSTRAINT c_mt_pk PRIMARY KEY );'
            );

            // images with terms
            db.run( 'CREATE TABLE IF NOT EXISTS mosaic_image_term ( ' + 
                    'mit_image_id INTEGER CONSTRAINT c_mit_fk_mi REFERENCES mosaic_image( mi_id ), ' + 
                    'mit_term TEXT CONSTRAINT c_mit_fk_mt REFERENCES mosaic_term( mt_term ) ); '
            );
        });
        this.insertImg = db.prepare( 'INSERT INTO mosaic_image( mi_path ) VALUES ( ? )');
        this.queryColor = db.prepare(   'SELECT mi_id as id, mi_path as path ' +
                                        'FROM mosaic_image ' +
                                        'WHERE mi_red BETWEEN ?1 - ?4 AND ?1 + ?4 ' +
                                        'AND mi_green BETWEEN ?2 - ?4 AND ?2 + ?4 ' +
                                        'AND mi_blue BETWEEN ?3 - ?4 AND ?3 + ?4;' );
        this.deleteImg = db.prepare( 'DELETE FROM mosaic_image WHERE mi_id=?;' );

        this.selectUnanalyzed = db.prepare( 'SELECT mi_id as id, mi_path as path ' +
                                            'FROM mosaic_image ' +
                                            'WHERE mi_green is NULL and mi_blue IS NULL and mi_red IS NULL;' );
        this.analyze = db.prepare( 'UPDATE mosaic_image SET mi_red=?, mi_green=?, mi_blue=? WHERE mi_id=?;' );

        winston.info( 'database setup done' );
    }

    _hash( string ) {
        return Crypto.createHash( 'sha1' ).update( string ).digest( 'hex' );
    }

    _download( uri, path, filename, callback ) {
        var size = { w: 500, h: 500 };
        var tmpFile = 'tmp_' + filename;
        request( uri )
            .pipe( FS.createWriteStream( path + tmpFile ) )
            .on( 'close', function() {
                gm( path + tmpFile )
                    .size( function( err, dim ) {
                        if ( dim ) {
                            var tileSize = Math.min( dim.width, dim.height );
                            gm( path + tmpFile )
                                .gravity( 'Center' )
                                .crop( tileSize, tileSize )
                                .resize( size.w, size.h + '>' )
                                .write( path + filename, function( err ) {
                                    FS.unlink( path + tmpFile );
                                    if ( !err ) {
                                        callback();
                                    }
                                });
                        }
                    });
            });
    }

    _insertImage( image ) {
        var self = this,
            filename = this._hash( image ) + '.jpg',
            path = this.folder + '/' ;
        this._download( image, path, filename, function() {
            self.insertImg.run( path + filename );
            winston.info( 'new image', path + filename );
        });
    }

    delete( imgId, path ) {
        winston.info( 'deleting', imgId );
        this.deleteImg.run( imgId );
        FS.unlink( path );
    }

    put( images ) {
        _.each( images, this._insertImage, this );
    }

    setColor( imageId, color ) {
        winston.info( imageId, 'has color', color );
        this.analyze.run.apply( this.analyze, color.concat([ imageId ]) );
    }

    getUnanalyzed( cb ) {
        this.selectUnanalyzed.get( cb );
    }

    query( color, threshold, cb ) {
        winston.info( 'querying for color', color );
        this.queryColor.all( color[0], color[1], color[2], threshold || COLOR_THRESHOLD, cb);
    }
}

export default SqliteImageStore;