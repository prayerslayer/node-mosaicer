/*
    # FlickrImageFetcher

    - fetch( searchString )
    - start( interval )
    - stop()
*/

import Flickr from 'node-flickr';
import ImageFetcher from './ImageFetcher';

var MAX_IMAGES = 1000,
    PAGE_SIZE = 100;

class FlickrImageFetcher extends ImageFetcher {
    constructor( assemblyLine, config ) {
        super( assemblyLine );

        console.log( config );

        this.config = config;
        this.flickr = new Flickr({
            'api_key': config.key
        });
        this.interval = false;
        this.nextPage = 0;
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
            self.assemblyLine.put( self.assemblyLine.FETCHED_LINE, result.photos.photo.map( self._constructUrl ) );
        });
    }

    start( search ) {
        var self = this;
        if ( !this.interval ) {
            this.fetch( search );
            setInterval( function() {
                if ( self.nextPage * PAGE_SIZE < MAX_IMAGES ) {
                    self.fetch( search );
                } else {
                    self.stop();
                }
            }, this.config.interval || 30000 );
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
