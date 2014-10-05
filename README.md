# node-mosaicer

Builds a pool of images out of which it can create an image mosaic.

# Usage

0. Checkout repo
1. Setup ``node-canvas`` [here](https://github.com/Automattic/node-canvas#installation)
2. Setup ``redis`` (``brew install redis``)
3. Setup ``gm`` [here](https://github.com/aheckmann/gm#getting-started)
4. ``npm install -g foreman``
5. ``npm install``
6. Create a [``.env`` file](https://github.com/strongloop/node-foreman#environmental-variables) and define your Flickr API key. See ``sample.env`` for details.
7. Edit files in ``src`` at will, you probably want to edit the search tags in ``fetcher.js`.
8. ``gulp build && foreman start``

Now there are several processes running that

* fetch URLs to photos from the Flickr API according to the specified tag
* download these URLs to the specified folder and normalize them (500x500 squares)
* analyze these images for the dominant color
* store path and color in a sqlite database.

Checkout ``mosaic.js`` for how to create an image mosaic.

## Todo

* Performance optimizations, e.g. reducing DB calls
* High resolution mosaic not possible because ``gm`` apparently spawns too many subprocesses.
* Better preselection of images
* Fiddle with mosaic algorithm