/*

    # ImageAnalyzer

    - analyze( image )
*/

import FS from 'fs';
import ColorThief from 'couleur';

class ImageAnalyzer {
    constructor( store ) {
        this.store = store;
    }

    _analyze() {
        var self = this;
        self.store.getUnanalyzed( function( err, row ) {
            if ( err || !row ) {
                return;
            }
            ColorThief.getColor( row.path, 5, function( err, c ) {
                if ( !err ) {
                    // flickr "not available images" have this signature
                    if ( c[0] === 42 && c[1] === 52 && c[2] === 64 ) {
                        self.store.delete( row.id, row.path );
                    } else {
                        self.store.setColor( row.id, c);
                    }
                }
            } );
        });
    }

    start() {
        setInterval( this._analyze.bind( this ), 1000 );
    }
}

export default ImageAnalyzer;