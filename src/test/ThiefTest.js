import gm from 'gm';
import FS from 'fs';
import path from 'path';

/*
    # Thieftest

    Takes all images from the store and draws a border in the dominant color around them.

    - test()
*/

class ThiefTest {
    constructor( store ) {
        this.store = store;
    }

    test() {
        FS.mkdir( './thief' );
        this.store.getAll().then( function( rows ) {
            rows.forEach( function( row ) {
                gm( row.path )
                    .borderColor( 'rgb(' + row.r + ',' + row.g + ',' + row.b + ')' )
                    .border( 20, 20 )
                    .write( './thief/' + path.basename( row.path ), function( err ) {
                        if ( err ) {
                            console.log( err );
                        }
                    });
            });
        });
    }

}

export default ThiefTest;