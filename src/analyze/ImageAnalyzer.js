/*

    # ImageAnalyzer

    - analyze( image )
*/

class ImageAnalyzer {
    constructor( line, proc ) {
        this.assemblyLine = line;
        this.processor = proc;
        this.interval = false;
    }

    _analyze() {
        var self = this;

        this.assemblyLine
            .pop( this.assemblyLine.DOWNLOADED_LINE )
            .then( this.processor.getColor )
            .then( function( image ) {
                self.assemblyLine.put( self.assemblyLine.ANALYZED_LINE, image );
            });
    }

    start() {
        if ( !this.interval ) {
            this.interval = setInterval( this._analyze.bind( this ), 1000 );
        }
    }

    stop() {
        if ( this.interval ) {
            clearInterval( this.interval );
            this.interval = false;
        }
    }
}

export default ImageAnalyzer;