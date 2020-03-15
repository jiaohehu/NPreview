# Blocks

In general a paragraph in a MD file is considered a block.
Following are two paragraphs in a MD file each of which is a block.

    Introductory to Pythagoream Theorem

    Pythagorean Theorem is one of the most fundamental
    theorems in mathematics and it defines the relationship
    between the three sides of a right-angled triangle.  ...
    Or, the sum of the squares of the two legs of a right
    triangle is equal to the square of its hypotenuse.

    ``` math
    a^2 + b^2 = c^2

    \frac{1}{a^2} + \frac{1}{b^2} = \frac{1}{h^2}
    ```

The first two blocks are paragraph blocks. The third block is a 'math' fenced
block. A paragraph block typically consists of only a single paragraph.  But a
fenced block can have multiple paragraphs. It has a familiar appearance as a
"python" block in a Markdown document, in which case one or more
paragraphs are surrounded by a pair of triple backquotes, and a name describing
the programming language such as "python" is attached to the right of the first
fence.

    ``` python
    import whois
    data = raw_input("Enter a domain: ")
    w = whois.whois(data)
    print w
    ```

But Nitrile expands the concept of a "python" block and allows for the contents
between the fences to be interpreted in many different ways. For example, when
the name 'math' appear next to the first fence, the lines between the fences are
considered LATEX math expressions.



## Fenced blocks

As of writing, following fenced blocks are implemented within Nitrile.

    imgs
    verse
    tabbing
    tabular
    longtable
    dt
    quot
    center
    flushright
    flushleft
    math
    verb
    listing

  + The imgs fenced block

    This block is to typeset a LATEX \begin{figure} environement
    or simply a group of images laid side-by-side.

    ~~~
    ``` imgs
    image (tree.png) This is a great tree.
    image (frog.png) This is a small frog.
    ```
    ~~~

    Options .gap, .margin, and .column can control the layout
    of the images. Especially, if .column is set to 2, then
    two images are to shape a single row, where each image
    shrinked to only take up half the page. The .gap is a number
    between 0-1 to indicate how much space of a page width
    is to be used as a gap between pages if two or more pages
    is to appear in a row. The .margin specifies the a number
    between 0-1 specifying the left/right margin for pictures.
    setting .margin to a non-zero value reduces the amount of
    space available for images.

  + The verse fenced block

    The 'verse' fenced block is to typeset a verse like structure, where each
    line in the source block is to be treated as a line by itself.

    ~~~
    ``` verse
    I cannot believe in a personal God,
    intervening in human affairs, but stand in awe
    of the terrible force which set the stars and galaxies in motion
    –strewing them like so much confetti–;
    the life-force running through each living creature,
    as straight and true as a ray of light from that galaxy in Andromeda,
    willing us to live, grow and be fruitful.
    ```
    ~~~

  + The tabbing fenced block

    This block is to typeset a LATEX \begin{tabbing} environement.

  + The tabular fenced block

    This block is to typeset a LATEX \begin{tabulary} environement.

  + The longtable fenced block

    This block is to typeset a LATEX \begin{xltabular} environement.

  + The dt fenced block

    This block is to simulate a LATEX \begin{description} paragraph.

    ~~~~
    ``` dt       
    Apple
      This is a great fruit.
    Pear
      This is a great fruit as well
      and can be quite tasty.
    Banana
    Kiwi
      These are fruits from tropical
      regions.
    ```
    ~~~~

    Each data term is to start at the first column. More than one data terms
    are allowed that share a single description text. Description texts
    are those that do not start in the first column. Consecutive lines
    of description text are accumulated and considered to have provided
    the description for the previous term or terms.


  + The quot fenced block

    This block is to typeset a LATEX \begin{quote} paragraph.

    ~~~
    ``` quot       

    ```
    ~~~


  + The center fenced block

    This block is to typeset a LATEX \begin{center} paragraph.

    ~~~
    ``` center     

    ```
    ~~~


  + The flushright fenced block

    This block is to typeset a LATEX \begin{flushright} paragraph.

    ~~~
    ``` flushright

    ```
    ~~~


  + The flushleft fenced block

    This block is to typeset a LATEX \begin{flushleft} paragraph.

    ~~~
    ``` flushleft

    ```
    ~~~


  + The math fenced block

    The 'math' fenced block is typeset a block of display math in LATEX.

    ~~~
    ``` math
    a^2 + b^2 = c^2
    ```
    ~~~

    If more than one math expression is to be listed, each one should be
    separated by at least one empty line.

    ~~~
    ``` math
    a^2 + b^2 = c^2

    \frac{1}{a^2} + \frac{1}{b^2} = \frac{1}{c^2}
    ```
    ~~~

    A math block can be typeset into a LATEX \begin{equation} environment
    if a '.label' option is provided.

    ~~~
    .label myeq1
    ``` math
    a^2 + b^2 = c^2

    \frac{1}{a^2} + \frac{1}{b^2} = \frac{1}{c^2}
    ```
    ~~~


  + The verb fenced block

    The 'verb' fenced block is to typset a block of verbatim text. The generated
    LATEX translation is a \begin{picture} environment such that a picture is
    made to capture all the text. The picture is made in such a way to simulate
    an infinite long terminal where its default text width is 80 characters. If
    the longest line is longer than 80 then the terminal is expanded to be that
    wide.

    ~~~
    ``` verb
    # Tcl package index file, version 1.1
    # This file is generated by the "pkg_mkIndex" command
    # and sourced either when an application starts up or
    # by a "package unknown" script.  It invokes the
    # "package ifneeded" command to set up package-related
    # information so that packages will be loaded automatically
    # in response to "package require" commands.  When this
    # script is sourced, the variable $dir must contain the
    # full path name of this file's directory.
    package ifneeded myfruits 1.0 [list source [file join $dir myfruits.tcl]]
    ```
    ~~~

    In addition, the picture is placed inside a \resizebox{} so that it's width
    is made the same as the width of the page. The \resizebox{} is then placed
    inside a \fbox{} so that it will have a border.


  + The listing fenced block

    The 'listing' fenced block allows for listing of software codes.

    ~~~
    ``` listing
    num1 = 15
    num2 = 12
    sum = num1 + num2
    print("Sum of {0} and {1} is {2}" .format(num1, num2, sum))
    ```
    ~~~

    The resulting LATEX translation is a \begin{lstlisting} environment where
    fixed font is used for typesetting the software code.  If a '.label' or
    '.caption' is present then the label and caption is to be used as part of an
    option for the \begin{lstlisting} environment.


## Paragraph blocks

As opposed to fenced block, a paragraph block consists of a single paragraph in
a MD file.  However, each paragraph block is to be recognized and processed
differently depending on its location within the MD document, as well as the
arrangement of some of its texts.  For ease of differentiation, each paragraph
block is also given a name.

    TEXT
    SAMP
    DESC
    LIST
    ITEM
    HDGS
    PART
    CITE
    PARA
    PRIM
    SECO
    PLST

  + The 'TEXT' blocks

    The 'TEXT' block is a normal paragraph block such that its entire content is
    treated as a paragraph.

  + The 'SAMP' blocks

    A 'SAMP' block is a paragraph with all lines indented four spaces to the right.

    ~~~
    In the following example, parameters a and b are
    positional-only, while c or d can be positional or
    keyword, and e or f are required to be keywords:

        def f(a, b, /, c, d, *, e, f):
            print(a, b, c, d, e, f)

    The following is a valid call:

        f(10, 20, 30, d=40, e=50, f=60)
    ~~~

    In the previous example the second and forth paragraph
    are considered 'SAMP' blocks.

  + The 'DESC' blocks

    A 'DESC' block is a block that starts with a plus-sign
    as the first column of the paragraph with no leading
    spaces.

    ~~~
    + pickle
    Pickle extensions subclassing the C-optimized Pickler
    can now override the pickling logic of functions and
    classes by defining the special reducer_override()
    method. (Contributed by Pierre Glaser and Olivier Grisel
    in bpo-35900.)

    + plistlib
    Added new plistlib.UID and enabled support for reading
    and writing NSKeyedArchiver-encoded binary plists.
    (Contributed by Jon Janzen in bpo-26707.)

    + pprint
    The pprint module added a sort_dicts parameter to
    several functions. By default, those functions continue
    to sort dictionaries before rendering or printing.
    However, if sort_dicts is set to false, the dictionaries
    retain the order that keys were inserted. This can be
    useful for comparison to JSON inputs during debugging.
    ~~~

    In the previous example there are three 'DESC' blocks
    each of which provides desription to a technical term.

  + The 'LIST' and 'ITEM' blocks

    The 'LIST' and 'ITEM' blocks work together to provide
    an environment for which paragraphs are either a list
    item or an indented paragraph.

    ~~~~
    The typing module incorporates several new features:

      + A dictionary type with per-key types. See PEP 589
        and typing.TypedDict.

        TypedDict uses only string keys. By default, every
        key is required to be present. Specify “total=False”
        to allow keys to be optional:

        ~~~
        class Location(TypedDict, total=False):
            lat_long: tuple
            grid_square: str
            xy_coordinate: tuple
        ~~~

      + “Final” variables, functions, methods and classes.
        See PEP 591, typing.Final and typing.final().

        The final qualifier instructs a static type checker
        to restrict subclassing, overriding, or
        reassignment:

        ~~~
        pi: Final[float] = 3.1415926536
        ~~~
    ~~~~

    In the previous example, the first paragraph is a 'TEXT'
    paragraph and the second one is a 'LIST' paragraph. The
    next few paragraphs are 'ITEM', 'ITEM', 'LIST', 'ITEM',
    and 'ITEM'.

    The 'LIST' paragraph is recognized when a plus-sign is
    detected as the first character of the first line of the
    paragraph, and the plus-sign is first followed by one or
    more spaces first and then followed by additional
    non-space characters.

    When a 'LIST' paragraph is detected, subsequent
    paragraphs immediately following a 'LIST' paragraph are
    checked to see if they are intended by four spaces, and
    if they are then they are labeled as 'ITEM' blocks.

    An 'ITEM' block can be considered as "follow on"
    paragraph that supply additional description that
    complements the description started out by the 'LIST'
    block. An 'ITEM' block is to be typeset either as a
    normal paragraph, with an indentation level the same as
    the list item, or a pre-formatted block where each line is
    respected and the text is shown using a fixed-width
    font, when the first and last line of that paragraph
    is a triple tilde.

  + The 'HDGS' block

    The 'HDGS' block is used to typset a LATEX chapter,
    section, subsection, and subsubsection. It must start
    with a hash as the first character of the first line
    with no leading spaces.

    ~~~
    # An introductory to Python Programming Language
    ~~~

    Note that a HDGS block can have an integer attached to it
    that expresses the heading level.

    ~~~
    # An introductory to Python Programming Language
    ## An introductory to Python Programming Language
    ### An introductory to Python Programming Language
    #### An introductory to Python Programming Language
    ##### An introductory to Python Programming Language
    ~~~

  + The 'PART' block

    A 'PART' block is recognized when a matching number of
    hashes are also detected at the end of the text.

    ~~~
    # An introductory to Python Programming Language #
    ## An introductory to Python Programming Language ##
    ### An introductory to Python Programming Language ###
    #### An introductory to Python Programming Language ####
    ##### An introductory to Python Programming Language ######
    ~~~

    Different from the 'HDGS' block, all the previus 'PART'
    blocks are considered equivalent.

  + The 'CITE' block

    A 'CITE' block is recognized when its first line is
    detected to start with a greater-than character '>'.

    ~~~
    > ch1.md
    > ch2.md
    > ch3.md
    ~~~

    This block is used to "import" other source MD files to
    fill up the content of this file.

  + The 'PARA' block

    The 'PARA' block is used to typeset a non-indented
    paragraph with extra "vertical" spaces inserted between
    this paragraph and the paragraph before it.

    It is recognized when a pair of square brackets are
    detected at the beginning of the first line with no
    leading spaces.

    ~~~
    [] The interpreter loop has been simplified by moving the
    logic of unrolling the stack of blocks into the
    compiler. The compiler emits now explicit instructions
    for adjusting the stack of values and calling the
    cleaning-up code for break, continue and return.
    ~~~

  + The 'PRIM' block

    This block is to typeset the LATEX \paragraph{} block.

    ~~~
    [ venv ] venv now includes an Activate.ps1 script on all
    platforms for activating virtual environments under
    PowerShell Core 6.1. (Contributed by Brett Cannon in
    bpo-32718.)

    [ weakref ] The proxy objects returned by
    weakref.proxy() now support the matrix multiplication
    operators @ and @= in addition to the other numeric
    operators. (Contributed by Mark Dickinson in bpo-36669.)
    ~~~

  + The 'SECO' block

    This block is to typeset the LATEX \subparagraph{} block.

    ~~~
    [[ venv ]] venv now includes an Activate.ps1 script on all
    platforms for activating virtual environments under
    PowerShell Core 6.1. (Contributed by Brett Cannon in
    bpo-32718.)

    [[ weakref ]] The proxy objects returned by
    weakref.proxy() now support the matrix multiplication
    operators @ and @= in addition to the other numeric
    operators. (Contributed by Mark Dickinson in bpo-36669.)
    ~~~

  + The 'PLST' block

    This block is to typeset a paragraph where it might
    consists of nested lists. Note that all items must
    start with a hyphen-minus, followed by at least one
    space before the text.

    ~~~
    - item 1
    - item 2
    - item 3
    - item 4
      - sub-item 1
      - sub-item 2
      - sub-item 3
        - sub-sub-item  
        - sub-sub-item  
        - sub-sub-item  
      - sub-item 4
    - item 5
    ~~~



# Block options

Each block can have additional "meta information" to be attached to it.  The
"meta information" can be thought of as additional text that "describes" each
block as to tell the LATEX or PREVIEW how to treate it better.

As of writting, following block options are supported:

    .adjust 2 3 5
    .caption A picture of a tree and a flog.
    .label mypic
    .margin .15
    .gap .10
    .column 2
    .alignequalsign 1
    .vlines 0 1 2 3 4
    .hlines t m b * *1 *2 *3
    .booktabs 1


The names of the block options are chosen so that each option tends to convey
the same semantics, and can be adapted to a variety of situations.

For example the block option '.adjust' is always to be specified with a list of
numbers. Thus, it is applied to 'imgs', 'tabularx', 'longtabu',
'tabbing'.

A block option must always start with a period, followed by only word
characters (no digits).  A block option must be placed at the beginning of a
line by itself, and must not be as part of the content of a block. More than
one block options can follow one another, in which case all of them will be
collected. All block options encountered prior to a block are collected and
used to "describe" that block, regardless the type of the block. Thus, it can
be for a normal block, a tabular block, a fenced block, a list block, or a
heading block. All block options are removed as soon as the block they chose to
describe has ended.

A block option can be specified in two or more lines. In such as case, a
backslash (`\`) character is to be placed at the end of all previous lines.
For example, in the following illustration the '.caption' option is to take up
three lines:

    .adjust 2 3 4
    .caption A picture of a\
       tree and\
       a flog.
    .label mypic
    ``` tabularx
    Name    Description     Cost
    Apple   A fruit         1.88     
    Pear    A fruit         2.88     
    Banana  A fruit         3.88     
    ```

In addition, empty lines can be placed between any two block options
and between the last block option and the start of the block.

The '.alignequalsign' option is used for the 'math' block so that the
first equal sign of each equation is to be vertical aligned.

    .alignequalsign
    ``` math
    a = b + c

    a = b + c + d
    ```

The .vlines, .hlines, and .booktabs are used for adjusting the appearance
of a table, such as adding horizontal and vertical lines and/or adjusting
row spacinng or adding horizontal lines to inbetween rows.
In particular, the .vlines controls whether vertical lines should appear
between columns. It is to be followed by a list of integers, and each integer
is to express whether a 'left-border' is to appear for that column, with
the first column being '0', second column being '1', third column being
'2', etc. For example, the following .vlines setting cause a vertical
line to be drawn between the first and second column

    .vlines 1

To draw the right border of the table, use the integer that is the same as the
total number of columns of the table.
Following example asks to draw a vertical line that is the left border of the
table and the right border of table, assuming the table is 5 columns wide.

    .vlines 0 5

The .hlines option configures the horizontal line drawing of the table. It is
to be followed by one or more of the following values: t, m, b, *, *1, *2, or *3.
Each value expresses which horizontal lines is to be drawn. The letter 't'
expresses that the top border of the table is drawn. The letter 'b' instructs
that the bottom border of the table is to be drawn. The 'm' letter instructs
that the line immediately below the header of the table is to be drawn.

The '*', '*1', '*2', and '*3' controls whether a line should be drawn between
two data rows or if there should be visible vertical spaces inserted between
two data rows. In particular, if '*' is specified, then a horizontal border
between two data rows is to be drawn. If '*1' is specified, then no horizontal
line is to be drawn between two data rows, but instead a small vertical space
is to be inserted in the form of `\noalign{\smallskip}`.

    *1      \noalign{\smallskip}
    *2      \noalign{\medskip}
    *3      \noalign{\bigskip}

If no '*', '*1', '*2', or '*3' appears, then no visible spaces nor horizontal
lines will appear between two data rows.

The .booktabs option is to be followed by a number that is 1. This is a flag
to express the fact that instead of inserting `\hline`, as LATEX normally
would have expected, it would instead insert the `\toprule`, `\medrule`,
and `\bottomrule` which are provided by the 'booktabs' LATEX package.

    \usepackage{booktabs}




## History

- It is planned to introduce a "started" version of the "subject" line.
  Such that it will insert a section sign (§)
