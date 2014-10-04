/*
    # SqliteImageStore
*/

import ImageStore from './ImageStore';
import SQLite from 'sqlite3';
import FS from 'fs';
import Q from 'q';
import winston from 'winston';

var COLOR_THRESHOLD = 64;

class SqliteImageStore extends ImageStore {
    constructor() {
        SQLite.verbose();
        this.db = new SQLite.Database( 'node-mosaicer' );
        this.db.on( 'trace', winston.info.bind( winston ) );
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
        });
        this.insertImg = db.prepare( 'INSERT INTO mosaic_image( mi_path, mi_red, mi_green, mi_blue ) VALUES ( ?, ?, ?, ? )');
        this.queryColor = db.prepare(   'SELECT mi_id as id, mi_path as path ' +
                                        'FROM mosaic_image ' +
                                        'WHERE mi_red BETWEEN ?1 - ?4 AND ?1 + ?4 ' +
                                        'AND mi_green BETWEEN ?2 - ?4 AND ?2 + ?4 ' +
                                        'AND mi_blue BETWEEN ?3 - ?4 AND ?3 + ?4;' );
        this.deleteImg = db.prepare( 'DELETE FROM mosaic_image WHERE mi_id=?;' );

        this.queryAll = db.prepare( 'SELECT mi_id as id, mi_path as path, mi_red as r, mi_green as g, mi_blue as b ' +
                                    'FROM mosaic_image;' );

        
        winston.info( 'database setup done' );
    }

    delete( imgId, path ) {
        winston.info( 'deleting', imgId );
        FS.unlink( path );
        return Q.ninvoke( this.deleteImg, 'run', imgId );
    }

    put( image ) {
        winston.info( 'storing image', image.file );
        this.insertImg.run.apply( this.insertImg, [ image.file ].concat( image.color ) );
    }

    getAll() {
        return Q.ninvoke( this.queryAll, 'all' );
    }

    query( color, threshold ) {
        var defer = Q.defer();
        this.queryColor.all( color[0], color[1], color[2], threshold || COLOR_THRESHOLD, function( err, rows ) {
            if ( err ) {
                defer.reject( err );
            } else {
                defer.resolve( rows );
            }
        });
        return defer.promise;
    }
}

export default SqliteImageStore;