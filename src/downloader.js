import ImageProcessor from './process/ImageProcessor';
import ImageDownloader from './download/ImageDownloader';
import RedisAssemblyLine from './assembly/RedisAssemblyLine';

var line = new RedisAssemblyLine();
var proc = new ImageProcessor({
    size: {
        w: 500,
        h: 500
    }
});
var downloader = new ImageDownloader( line, proc, {
    path: './downloaded'
} );

downloader.start();