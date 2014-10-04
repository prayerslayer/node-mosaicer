/*
    # FlickrImageFetcher

    - fetch( searchString )
    - start( interval )
    - stop()
*/

import Flickr from 'node-flickr';
import ImageFetcher from './ImageFetcher';
import Events from 'events';

var MAX_IMAGES = 1000,
    PAGE_SIZE = 100;

class FlickrImageFetcher extends ImageFetcher {
    constructor( key ) {
        this.flickr = new Flickr({
            'api_key': key
        });
        this.interval = false;
        this.nextPage = 0;
        this.emitter = new Events.EventEmitter();
        this.FETCH_EVENT = 'FETCHED_FLICKR';
    }

    _constructUrl( photo ) {
        //https://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}_[mstzb].jpg
        return [
            'https://farm',
            photo.farm,
            '.staticflickr.com/',
            photo.server,
            '/',
            photo.id,
            '_',
            photo.secret,
            '_b.jpg'
        ].join( '' );
    }

    fetch( search ) {
        var self = this;
        this.flickr.get( 'photos.search', {
            'tags': search,
            'page': ++this.nextPage,
            'per_page': PAGE_SIZE,
            'sort': 'interestingness-desc'
        }, function( result ) {
            self.emitter.emit( self.FETCH_EVENT, result.photos.photo.map( self._constructUrl ) );
        });
    }

    start( search, interval ) {
        var self = this;
        if ( !this.interval ) {
            this.fetch( search );
            setInterval( function() {
                if ( self.nextPage * PAGE_SIZE < MAX_IMAGES ) {
                    self.fetch( search );
                } else {
                    self.stop();
                }
            }, interval || 30000 );
        }
        return this.emitter;
    }

    stop() {
        if ( this.interval ) {
            clearInterval( this.interval );
            this.interval = false;
        }
    }
}

export default FlickrImageFetcher;
