import FS from 'fs';
import gm from 'gm';

class ColorDistributionTest {
    constructor( store ) {
        this.store = store;
    }

    test( size ) {

        var histo = {},
            bucketSize = size || 16;

        function colorToString( r, g, b ) {
            return 'rgb(' + r + ',' + g + ',' + b + ')';
        }

        for( var r = 0; r <= 255; r += bucketSize ) {
            for( var g = 0; g <= 255; g += bucketSize ) {
                for( var b = 0; b <= 255; b += bucketSize ) {
                    histo[ colorToString( r, g, b ) ] = 0;
                }
            }
        }

        function getBucket( color ) {
            var r = Math.floor( color.r / bucketSize ) * bucketSize,
                g = Math.floor( color.g / bucketSize ) * bucketSize,
                b = Math.floor( color.b / bucketSize ) * bucketSize;

            return colorToString( r, g, b );
        }

        this.store.getAll().then( function( rows ) {
            rows.forEach( function( row ) {
                histo[ getBucket( row ) ] += 1;
            });

            var count = Object.keys( histo ).length,
                w = 10,
                maxHeight = 50,
                img = gm( count * w, maxHeight, '#fff' );

            Object.keys( histo ).forEach( function( color, idx  ) {
                img
                    .fill( color )
                    .drawRectangle( idx * w, Math.max( 0, maxHeight - histo[color] ), ( idx + 1 ) * w, maxHeight );
            });

            img.write( 'colorDistribution.gif', function( err ) {
                if ( err ) {
                    console.log( err );
                }
            });

            FS.writeFile( 'colorDistribution.json', JSON.stringify( histo, null, 4 ), console.log.bind( console ) );
        });
    }
}

export default ColorDistributionTest;