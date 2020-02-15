# Block options

Each block can have additional "meta information" to be attached to it.  The
"meta information" can be thought of as additional text that "describes" each
block as to tell the LATEX or PREVIEW how to treate it better.

As of writting, following block options are supported:

    .adjust 2 3 5
    .caption A picture of a tree and a flog.
    .table TABL
    .label mypic
    .margin .15
    .gap .10
    .column 2


The names of the block options are chosen so that each option tends to convey
the same semantics, and can be adapted to a variety of situations.

For example the block option '.adjust' is always to be specified with a list of
numbers. Its semantics are set to express the relative width of columns.  In
the situation when the block it describes is a tabular block, such as TABL,
TABB, TABF, or LONG, then it serves to adjust the columns for the table.
However, when the block it describes is a IMGS block, it serves to adjust the
widths of the images if two or more images are laid side by side.

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

In addition, empty lines can be placed between any two block options and
between the last block option and the start of the block. Thus, following 
are valid and all three block options will be collected to describe the TABL
block.

    .adjust 2 5 2

    .caption A picture of a\
       tree and\
       a flog.

    .label mypic

    ``` tabl
    Name    Description     Cost
    Apple   A fruit         1.88     
    Pear    A fruit         2.88     
    Banana  A fruit         3.88     
    ```

It is just a matter of style. Following illustration achieves the same effect
as the one before without the presence of any empty lines:

    .adjust 2 5 2
    .caption A picture of a\
       tree and\
       a flog.
    .label mypic
    ``` tabl
    Name    Description     Cost
    Apple   A fruit         1.88     
    Pear    A fruit         2.88     
    Banana  A fruit         3.88     
    ```





