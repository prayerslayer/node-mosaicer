import SqliteImageStore from './store/SqliteImageStore';
import ColorDistributionTest from './test/ColorDistributionTest';

var store = new SqliteImageStore();
var colorTest = new ColorDistributionTest( store );

colorTest.test( 32);