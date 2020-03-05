# Blocks

In general a paragraph in a MD file is considered a block.
Following are two paragraphs in a MD file each of which is a block.

    Introductory to triangle mesh

    A triangle mesh is a type of polygon mesh in computer 
    graphics. It comprises a set of triangles (typically 
    in three dimensions) that are connected by their common 
    edges or corners.

Besides a paragraph, a block can also be a Fenced Block. A fenced block is
considered a composite block made up of one or more paragraphs. It is started
by the appearance of triple backquotes in its own line, and ended by another
triple backquotes in its own line.

    ``` math
    a^2 + b^2 = c^2
    ```

A word is typically placed to the right of the first triple backquotes to 
express the specific fenced block. As of writing, following fenced blocks
are recognized by Nitrile.

  - imgs 
  - line 
  - longtabu 
  - tabbing 
  - tabular 
  - tabulary 
  - tabularx 
  - dt 
  - quot 
  - center 
  - flushright 
  - flushleft 
  - math 
  - verb 
  - code 

As opposed to fenced block, each normal paragraph would also be recognized as 
expressing a different block depending on its location in the MD document, and
by the arrangement of some of its texts.  In order for a non-fenced block
to be referred to, each non-fenced block is also assigned a special name
inside Nitrile. 

  - TEXT 
  - SAMP 
  - DESC 
  - LIST 
  - HDGS 
  - PART 
  - PARA 
  - PRIM 
  - SECO 
  - PLST 
  - ITEM 
  - CITE 

## Fenced blocks

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

  + The longtabu fenced block

    This block is to typeset a LATEX \begin{longtabu} environement.

  + The tabbing fenced block

    This block is to typeset a LATEX \begin{tabbing} environement.

  + The tabular fenced block

    This block is to typeset a LATEX \begin{tabular} environement.

  + The tabulary fenced block

    This block is to typeset a LATEX \begin{tabulary} environement.


  + The tabularx fenced block

    This block is to typeset a LATEX \begin{tabularx} environement.


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

    This block is to simulate a LATEX \begin{quote} paragraph.

    ``` quot       

    ```


  + The center fenced block

    This block is to simulate a LATEX \begin{center} paragraph.

    ``` center     

    ```


  + The flushright fenced block

    This block is to simulate a LATEX \begin{flushright} paragraph.

    ``` flushright 

    ```


  + The flushleft fenced block

    This block is to simulate a LATEX \begin{flushleft} paragraph.

    ``` flushleft

    ```


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
    LATEX translation is a \begin{picture} environment such that a picture is made
    to capture all the text. The picture is made in such a way to simulate an infinite
    long terminal where its default text width is 80 characters. If the longest line
    is longer than 80 then the terminal is expanded to be that wide.

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

In addition, the picture is placed inside a \resizebox{} so that it's width is
made the same as the width of the page. The \resizebox{} is then placed inside
a \fbox{} so that it will have a border.


## The code fenced block

The 'code' fenced block allows for listing of software codes.

    ``` code
    num1 = 15
    num2 = 12
    sum = num1 + num2
    print("Sum of {0} and {1} is {2}" .format(num1, num2, sum))
    ```

The resulting LATEX translation is a \begin{lstlisting} environment where fixed
font is used for typesetting the software code.  If a '.label' or '.caption' is
present then the label and caption is to be used as part of an option for the
\begin{lstlisting} environment.




