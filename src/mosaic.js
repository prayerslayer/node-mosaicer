import SqliteImageStore from './store/SqliteImageStore';
import Mosaicer from './mosaic/Mosaicer';

var store = new SqliteImageStore();
var mosaic = new Mosaicer( store );

mosaic.getMosaic( 'test/jordan.jpg', 25 );