# Typesetting tables  

Nitrile recognize following fenced blocks as expressing tabular
information.

    TABB, TABL, TABF, LONG 


The TABB fenced block is to create a LATEX tabular block where each column
is a "l". This table is by design to allow each row to be tightly packed
and the overall width of the table depends on the width of each column.
For each column the text will always be shown in a single line.

The TABL fenced block is to create a LATEX tabular block where each column
is a "p{}". The width of the table is always set to be the same as the page
(\linewidth). The width of individual column depends on the total width 
of the page, and the relative column width wiith respect to other columns.
On the other hand, text within each column is going to appear as a paragraph.

    \begin{tabular}
      ....
    \end{tabular}

The TABF fenced block is the same as that of a TABL block except for the fact
that it is to be made a float by the presence of 

    \begin{table} 
      \begin{tabular}
      ....
      \end{tabular}
    \end{table} 

The LONG fenced block is to create a \begin{longtable} block.
The format for each column is the same as that of the TABL or TABF blocks,
such that each column is a paragraph style (p{}).

For fenced blocks of TABB, TABL, TABF and LONG, 
the content of the table is to be extracted from the arrangement of the text
within the block.

There are two arrangements that will be recognized. In the first arrangement,
each line expresses the entire content of a row, and data cells within that row
are detected by the presence of two or more consecutive white spaces.
For example, in the following TABL block it is detected that there are four
rows and for each row three columns.

    ```  tabl
    Name           Value   Example
    ELEMENT_NODE   1       The <body> element
    TEXT_NODE      3       Text that is not part of an element
    COMMENT_NODE   8       <!-- an HTML comment -->
    ```

The second arrangement is that each data cell in a single row is to be in its
own line and all data cells of a row is to occupy as a cluster of lines
separated by one or more blank lines.

For example, in the following TABL block the first three lines are considered
to be the three data cells for the first row, and next three lines the three
data cells for the second row, etc.


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

Usually, the first arrangement is assumed, unless it is detected that the very
first line only entails a single column and there are at least one empty line
within the content of the block.  In this case the second arrangement is
assumed.

For TABL, TABF, and LONG blocks, the first row of the table is always assumed
to be the header row and rest as data rows.  For TABB all rows are considered
data rows.

In addition, following paragraph will be recognized as expressing a TABL fenced
block. 

    |--------------|--------------|-------------------|
    | Names        | Value        | Example           |
    |--------------|--------------|-------------------|
    | ELEMENT_NODE |  1           | The <body>        |
    |              |              | element           |
    |--------------|--------------|-------------------|
    | TEXT_NODE    |  3           | Text that is not  |
    |              |              | part of an        |
    |              |              | element           |
    |--------------|--------------|-------------------|
    | COMMENT_NODE |  8           | <!-- an HTML      |
    |              |              | comment ->        |
    |              |              |                   |
    |--------------|--------------|-------------------|

This paragraph is detected when the first and last line is detected to be
exactly the same, and they each only contains nothing but vertical bars and
hyphen-minus characters. 

When a paragraph like this is detected, all subsequent lines that is exactly
the same as the first/last line are considered the "separator lines".  Lines
that are not separator lines are considered expressing the contents of table
rows.  As can be seen, each table row is to be scanned for the presence of a
vertical bar, and texts between vertical bars are table cells. 

Consecutive lines for the same table row are split accordingly, with each
resulting table cell considered as the "continuation text" that extends the
text of the same table cell described by previous lines of the same table row.
This allows you to split long texts of a table cell text into multiple lines. 

Currently, this paragraph is recognized as expressing a TABL fenced block.





