class ImageCollector {
    constructor( line, store ) {
        this.assemblyLine = line;
        this.store = store;
        this.interval = false;
    }

    _collect() {
        this.assemblyLine
            .pop( this.assemblyLine.ANALYZED_LINE )
            .then( this.store.put.bind( this.store ) );
    }

    start() {
        if ( !this.interval ) {
            this.interval = setInterval( this._collect.bind( this ), 100 );
        }
    }

    stop() {
        if ( this.interval ) {
            clearInterval( this.interval );
            this.interval = false;
        }
    }
}

export default ImageCollector;