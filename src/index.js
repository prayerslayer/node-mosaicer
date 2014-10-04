import ImageAnalyzer from './analyze/ImageAnalyzer';
import FlickrImageFetcher from './fetch/FlickrImageFetcher';
import SqliteImageStore from './store/SqliteImageStore';
import Mosaicer from './mosaic/Mosaicer';
import Q from 'q';

var fetcher = new FlickrImageFetcher( process.env.FLICKR_API_KEY );
var store = new SqliteImageStore( './images' );
var anal = new ImageAnalyzer( store );

// fetcher
//     .start( 'basketball' )
//     .on( fetcher.FETCH_EVENT, store.put.bind( store ) );

// anal.start();

var mosaic = new Mosaicer( store );

mosaic.getMosaic( './test/jordan3.jpg', 20 );

// function noop() {}

// setInterval( noop, 3600000 );