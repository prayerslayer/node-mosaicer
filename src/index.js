/* jshint ignore:start */

import ImageAnalyzer from './analyze/ImageAnalyzer';
import FlickrImageFetcher from './fetch/FlickrImageFetcher';
import SqliteImageStore from './store/SqliteImageStore';
import Mosaicer from './mosaic/Mosaicer';
import ThiefTest from './test/ThiefTest';
import ColorDistributionTest from './test/ColorDistributionTest';
import Q from 'q';
import winston from 'winston';

var fetcher = new FlickrImageFetcher( process.env.FLICKR_API_KEY );
var store = new SqliteImageStore( './images' );
var anal = new ImageAnalyzer( store );
var thiefTest = new ThiefTest( store );
var colorTest = new ColorDistributionTest( store );

colorTest.test();

// fetcher
//     .start( 'basketball' )
//     .on( fetcher.FETCH_EVENT, store.put.bind( store ) );

// anal.start();

// var mosaic = new Mosaicer( store );

// mosaic.getMosaic( './test/jordan3.jpg', 50 );

// var func = Q.nbind( store.query, store, [ 20, 41, 55 ], 8 );
// winston.info( func().then( function() {
//     winston.info( arguments );
// } ) );


// function noop() {}

// setInterval( noop, 3600000 );

/* jshint ignore:end 