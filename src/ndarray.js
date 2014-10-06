import ndarray from 'ndarray';

var images = [],
    n = 0;
while( n++ < 27 ) {
    images.push( n );
}

var nd = ndarray( images, [ 3,3,3 ] );
console.log( nd.get( 0, 1, 2 ) );
console.log( nd.pick( 0,0 ) );