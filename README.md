# node-mosaicer

The generated image looks like shit. Why is that?

* Wrong ordering of Q.all() and subsequent stitching? — **Most probably not**
* Too less images in test corpus? (~1000) — **Kind of**
    * It's more like too less colors.
* Incorrect behavior of thief? — **Nope**
    * It's just that some images are better suited to be a pixel than others.

# Usage

0. Checkout repo
1. Setup ``node-canvas`` [here](https://github.com/Automattic/node-canvas#installation)
2. Setup ``redis`` (``brew install redis``)
3. Setup ``gm`` [here](https://github.com/aheckmann/gm#getting-started)
4. ``npm install -g foreman``
5. ``npm install``
6. Create a [``.env`` file](https://github.com/strongloop/node-foreman#environmental-variables) and define your Flickr API key
7. Edit files in ``src`` at will, you probably want to edit the search tags in ``fetcher.js``.
8. ``gulp build && foreman start``

Now there are several processes running that

* fetch URLs to photos from the Flickr API according to the specified tag
* download these URLs to the specified folder and normalize them (500x500 squares)
* analyze these images for the dominant color
* store path and color in a sqlite database.

Checkout ``mosaic.js`` for how to create an image mosaic.

## Todo

* Fiddle with mosaic algorithm
* High resolution mosaic not possible because ``gm`` apparently spawns too many subprocesses.