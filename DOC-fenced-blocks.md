# Fenced Blocks



## The TABB, TABL, TABF, and LONG blocks   

The TABB fenced block is to create a LATEX tabular block where each column
is a "l".

The TABL fenced block is to create a LATEX tabular block where each column
is a "p{}".

The TABF fenced block is exactly the same as that of the TABL except that
a \begin{table} and \end{table} will be used to create a floating table.

The LONG fenced block is to create a \begin{longtable} block.

Within the fence the content of the block is going to be recognized
as follows.

    ```  tabl
    Name           Value   Example
    ELEMENT_NODE   1       The <body> element
    TEXT_NODE      3       Text that is not part of an element
    COMMENT_NODE   8       <!-- an HTML comment -->
    ```

You can place each row in a single line if the text is short enough. You must
insert a double-space to be recognized as the column boundaries for each
data columns of that row. For TABL, TABF, and LONG, the first row is always
recognized as the table header.

The other option is to place the content of each column in its own line.
And then insert a blank line to start a new row.

    ``` tabl
    Name
    Value
    Example

    ELEMENT_NODE
    1
    The <body> element

    TEXT_NODE
    3
    Text that is not part of an element

    COMMENT_NODE
    8
    <!-- an HTML comment -->
    ```

The table format of the following is also recognized:

    |---------|--------------|-------------------|
    | Names   | Value        | Description       |
    |---------|--------------|-------------------|
    |   .........                                |
    |   .........                                |
    |---------|--------------|-------------------|

Note that Nitriles insists that all subsequent row separators
must be exactly the same as the first one.


## The IMGS block

The IMGS block is used to typeset images.

    ``` imgs
    image (tree.png) A tree.
    image (flog.png) A flog.
    ```

All images are by default set to be the width of the entire page.

When two images are specified, they will appear on top of each other.

If you want two images laid out side-by-side, you need to use the '.column'
fence option.

    .column 2
    ``` imgs
    image (tree.png) A tree.
    image (flog.png) A flog.
    ```

By default, two images are placed side by side and they each take half the
width of the page. The image's height is automatically determined by the
aspect ratio of the image file and auto adjusted by LATEX and/or HTML.

You can override the width of the image. For example, you can specify that
one image takes up 40-percent of the width of the page and the other 60-percent.
You can do that by using the '.adjust' fence option.

    .column 2
    .adjust 4 6
    ``` imgs
    image (tree.png) A tree.
    image (flog.png) A flog.
    ```

The '.adjust' option expect a list of numbers for the table columns. These
numbers will always be treated as relative length to each other. You can
consider the previous width specification to be 4 : 6 in terms of the ratio
between the first image and the second image. Setting it to "2 3" would have
achieved the same goal.

If you do not what the image to be the width of the page, you can specify to add
some left and right margins. You will use the '.margin' option to specify a
margin. Such as following:

    .margin .1
    .column 2
    .adjust 4 6
    ``` imgs
    image (tree.png) A tree.
    image (flog.png) A flog.
    ```

Note that this number must be a number between 0-1, which specifies the  portion
of the page width that is reserved as the left and right margin. Setting  it to
"0.1" is going to reserve 10-percent of the page width for the left  and the
right margin, thus leaving only 80-percent of remaining spaces for  the images.
In the previous case both images will be placed together side-by-side,  where
they will occupy a total of 80-percent of the page width. Among the 80-percent
width, The first image will share 40-percent of the space, and the second image
will share 60-percent  of the space.

Usually, there is no gap between the images. You can specify that they have
some gaps. The '.gap' option specifies a number for the gap to be placed
between images.

    .gap .1
    .margin .1
    .column 2
    .adjust 4 6
    ``` imgs
    image (tree.png) A tree.
    image (flog.png) A flog.
    ```

The number for the '.gap' is also a number between 0-1 that specifies the
percentage of the page width reserved for the gap. So the previous setting would
have only left 70-percent of the page width for the images themselves. Sinces
the first image is 40-percent of the total, it would end up occupying the page
width of 40% x 70% which is 28% of the screen width. And the second image would
have occupied a width of 60% x 70% which is 42%. You can add a short description
text for each image. This text will be replaced at the bottom of each page. The
width of the text box for this short text will be the same width as the image
itself. If you need to break the text into two or more lines, place a backslash
at the end of each line of text.

    .gap .1
    .margin .1
    .column 2
    .adjust 4 6
    ``` imgs
    image (tree.png) A beautiful tree of\
       century old.
    image (flog.png) A flog.
    ```
