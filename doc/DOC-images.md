# Supporting images


Nitrile only support typesetting images inside a special fenced block
that is 'imgs'.

The IMGS block is used to typeset images.

    ``` imgs
    image (tree.png) A tree.
    image (flog.png) A flog.
    ```

All images are by default set to be the width of the entire page.  When two
images are specified, they will appear on top of each other.  If you want two
images laid out side-by-side, you need to use the '.column' fence option.

    .column 2
    ``` imgs
    image (tree.png) A tree.
    image (flog.png) A flog.
    ```

The ".column" fence option specifies that for each row two images are going to
appear.  By default, each image is to take up half the width of the page. The
image's height is automatically determined by the aspect ratio of the image
file. LATEX, and HTML both exhibit this behavior.

You can override the width of the image. For example, you can specify that one
image takes up 40-percent of the width of the page and the other 60-percent.
You can do that by using the '.adjust' fence option.

    .column 2
    .adjust 4 6
    ``` imgs
    image (tree.png) A tree.
    image (flog.png) A flog.
    ```

The '.adjust' option expects a list of numbers. Each number applies to each
subsequent column starting from the first column. These numbers will always be
treated as relative to each other. For example, you can expect the that the
first image be   occupying 40 percent of the page width and the second image
occupying 60 percent of the page width with the prevous setting.  Setting the 
'.adjust' option to the following achieves the same effect.

    .adjust 2 3

For a single image, if you do not want the images to be taking up the entire page width,
then you can arrange to specify a non-zero margin, using the '.margin' option.

    .margin .1

The number following this option must a number from 0-1 specifying the fraction
of the page that will be reserved as margin. Thus, specifying a '0.1' will set
up 10 percent of the page width as the left margin as well as the same amount
for the right margin. This leaves the rest 80 percent for the image, and the image
will be displayed at the center of the page at 80 percent the width of the page.

If there are two images, then the same margin would still apply. However, since
the rest of the spaces for images are reduced, say to 80 percent, then the two
images such as following will compete for the 80 percent space, with the first
image getting '.8 x .4 = .32' or 32 percent of the width, and the second image
getting '.8 x .6 = .48' or 48 percent of the page width.

    .margin .1
    .column 2
    .adjust 4 6
    ``` imgs
    image (tree.png) A tree.
    image (flog.png) A flog.
    ```

You can also arrange to add additional "gaps" between images so that they don't 
push against each other. The '.gap' option can be used for that.

    .gap .1

The number following the '.gap' is a number between 0-1 expressing the fraction
of the page width that will be used as the gaps between each two images (if
there are more than two).  Thus, the previous setting would have only left
70-percent of the page width for the images themselves (10 percent left margin,
10 percent right margin, and 10 percent gap between the two images). 

    .gap .1
    .margin .1
    .column 2
    .adjust 4 6
    ``` imgs
    image (tree.png) A tree.
    image (flog.png) A flog.
    ```

Sinces the first image is 40-percent of the total, it would end up occupying
the page width of '.4 x .7 = .28'  which is 28 percent of the page width.
Similarly, the second image would have taken up only '.6 x .7 = .42', or 42
percent of the page width.

Within the block, each image is to start with the word "image", followed by the
image file which must be placed in a set of open-close parentheses. Additional text
after that line is considered as the subtitle for the image, which will appear 
underneath the image, whether in LATEX or PREVIEW.

You can use a single-backslash at the end of the line to signal that this line
is to be continued at the next line.

    .gap .1
    .margin .1
    .column 2
    .adjust 4 6
    ``` imgs
    image (tree.png) A beautiful tree of\
       century old.
    image (flog.png) A flog.
    ```

The notation of `![Tree](tree.png)` to express an image is not supported by
Nitrile. As a result, images will never appear anywhere else except for 
when it is within a IMGS block.



