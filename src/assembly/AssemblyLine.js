/*
    # Assembly Line

    Transports data between components.

    - put( line, hash )
    - pop( line )
*/

class AssemblyLine {
    constructor() {
        this.FETCHED_LINE = 'FETCHED';
        this.DOWNLOADED_LINE = 'DOWNLOADED';
        this.ANALYZED_LINE = 'ANALYZED';
    }

    put() {
        throw 'not implemented';
    }

    pop() {
        throw 'not implemented';
    }
}

export default AssemblyLine;