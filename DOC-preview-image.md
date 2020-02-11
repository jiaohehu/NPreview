# Prevewing images in HTML

In PREVIEW, the images are previewd by modifying the img.src member
posthumously at the background *after* the innerHTML has been assigned.

The innerHTML constructed always points to the original src file such as

    <img id='my-unieque-id' src='./tree.png' />

The Img-element is also given a unique Id, taken from the last HTML parser's
this.imgId value. The actual ID is irrelevant but it should always be unique.
The idea is that once the Img-element is constructed it can be unique identified
later on by its ID.

The HTML parser calls the *view.requestImage* and pass it the *imgid* and *src*
member. The *view.requestImage* member will take care of setting up a *fs.readFileAsync*
call to load the image from the file and then do a global search using

    document.querySelector('img#my-unique-id')

to find the node that is our Img-element and then change its *img.src* member
to a URI that expresses an PNG file that is base64-encoded. So in the end,
or Img-element should have looked like the following in DOM:

    <img id='my-unique-id' src="image:data/png;base64,..." />

However, the origial HTML still looked like:

    <img id='my-unieque-id' src='./tree.png' />

The NitrilPreviewView class has a build-in image cache named *this.imagemap*,
which is a JavaScript *Map* object that caches the image data read from
previous calls to *fs.readFileAsync*. Thus if the same image is to be asked
again it can simply retrieve it from *this.imagemap*.

The *fs.readFileAsync* always returns a JavaScript *Buffer* object which
stores binary data. This is what is stored with *this.imagemap*, indexed
by the name of the image file, such as "tree.png".

The *this.imagemap* is cleared when a new file has been asked to be previewed.

During the translation of HTML, all images encountered will left with a trace
in the *chaps* array. It's entry starts with the string 'image':

    ['PART',   'nitri....1',''        ,'   ','PART I..',0  ,'']
    ['CHAPTER','nitri...12','my:intro','1  ','Intro...',1  ,'']
    ['image'  ,''          ,''        ,''   ,'tree.png','' ,'']
    ['SECTION','nitri...24',''        ,'1.1','Welco...',225,'']
    ['CHAPTER','nitri...34',''        ,'2  ','regexp  ',300,'']

In the previous example the third line is an 'image' entry. The fifth column is
filled with the name of the image file and other columns are irrelevant and
left unfilled.

The presence of the 'image' entry in "chaps" array allows for the posthumous
process such as EPUB translation to scan and detect all external image files
referenced. It can thus build proper entries for these external images for its
"manifest" section of the "package.opf" document, and also ensures that the
content of the image files themselves are added to the archive.

This is assuming that HTML itself always generate images referencing the name
only:

    <img id='my-unieque-id' src='./tree.png' />

NOTE: only PNG files are supported, and they will always be treated as PNG
files even if their file names might appear as tree.jpg, tree.pdf, etc.,
regardless.
