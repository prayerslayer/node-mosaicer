import winston from 'winston';
import AssemblyLine from './AssemblyLine';
import redis from 'redis';
import _ from 'lodash';
import Q from 'q';

class RedisAssemblyLine extends AssemblyLine {
    constructor( config ) {
        super();

        this.config = config || {};
        this._connect();
    }

    _connect() {
        var self = this;
        this.connected = false;
        this.client = redis.createClient( this.config.port || 6379, this.config.ip || '127.0.0.1', this.config.options );
        this.client.on( 'ready', function() {
            self.connected = true;
            winston.info( 'connected to redis' );
        });
    }

    put( line, hashes ) {
        var self = this;
        if ( _.isArray( hashes ) ) {
            _.each( hashes, function( hash ) {
                self.client.lpush( line, JSON.stringify( hash ) );
            });
        } else {
            this.client.lpush( line, JSON.stringify( hashes ) );
        }
    }

    pop( line ) {
        var defer = Q.defer();
        Q.ninvoke( this.client, 'rpop', line ).then( function( hashString ) {
            defer.resolve( JSON.parse( hashString ) );
        });
        return defer.promise;
    }
}

export default RedisAssemblyLine;