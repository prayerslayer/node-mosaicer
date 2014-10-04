import AssemblyLine from './AssemblyLine';

var lines = {};

class InMemoryAssemblyLine extends AssemblyLine {

    constructor() {
        super();
    }

    put( line, hash ) {
        if ( !lines[ line ] ) {
            lines[ line ] = [];
        }
        lines[ line ].push( hash );
    }

    pop( line, amount ) {
        if ( !lines[ line ] ) {
            return null;
        }
        return lines[ line ].splice( 0, amount || 1 );
    }

}

export default InMemoryAssemblyLine;