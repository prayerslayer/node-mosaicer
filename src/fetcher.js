import FlickrImageFetcher from './fetch/FlickrImageFetcher';
import RedisAssemblyLine from './assembly/RedisAssemblyLine';

var line = new RedisAssemblyLine();
var fetcher = new FlickrImageFetcher( line, {
    key: 'redacted'
});

fetcher.start( 'water' );