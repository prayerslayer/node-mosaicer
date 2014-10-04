import ImageProcessor from './process/ImageProcessor';
import ImageAnalyzer from './analyze/ImageAnalyzer';
import RedisAssemblyLine from './assembly/RedisAssemblyLine';

var line = new RedisAssemblyLine();
var proc = new ImageProcessor({
    size: {
        w: 500,
        h: 500
    }
});
var analyzer = new ImageAnalyzer( line, proc );

analyzer.start();