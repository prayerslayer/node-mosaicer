import ImageCollector from './collect/ImageCollector';
import SqliteImageStore from './store/SqliteImageStore';
import RedisAssemblyLine from './assembly/RedisAssemblyLine';

var line = new RedisAssemblyLine();
var store = new SqliteImageStore();

var collector = new ImageCollector( line, store );

collector.start();