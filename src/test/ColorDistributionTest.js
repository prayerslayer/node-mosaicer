import FS from 'fs';
import gm from 'gm';

class ColorDistributionTest {
    constructor( store ) {
        this.store = store;
    }

    test() {

        var histo = {};

        function colorToString( r, g, b ) {
            return 'rgb(' + r + ',' + g + ',' + b + ')';
        }

        for( var r = 0; r <= 255; r += 16 ) {
            for( var g = 0; g <= 255; g += 16 ) {
                for( var b = 0; b <= 255; b += 16 ) {
                    histo[ colorToString( r, g, b ) ] = 0;
                }
            }
        }

        function getBucket( color ) {
            var r = Math.floor( color.r / 16 ) * 16,
                g = Math.floor( color.g / 16 ) * 16,
                b = Math.floor( color.b / 16 ) * 16;

            return colorToString( r, g, b );
        }

        this.store.getAll().then( function( rows ) {
            rows.forEach( function( row ) {
                histo[ getBucket( row ) ] += 1;
            });

            Object.keys( histo ).forEach( function( color ) {
                if ( !histo[ color ] ) {
                    delete histo[ color ];
                }
            });

            var count = Object.keys( histo ).length,
                w = 10,
                maxHeight = 50,
                img = gm( count * w, maxHeight, "#fff" );

            Object.keys( histo ).forEach( function( color, idx  ) {
                img
                    .fill( color )
                    .drawRectangle( idx * w, Math.max( 0, maxHeight - histo[color] ), ( idx + 1 ) * w, maxHeight );
            });

            img.write( 'colorDistribution.jpg', function( err ) {
                if ( err ) {
                    console.log( err );
                }
            });

            console.log( histo );

            FS.writeFile( 'colorDistribution.json', JSON.stringify( histo, null, 4 ), console.log.bind( console ) );
        });
    }
}

export default ColorDistributionTest;