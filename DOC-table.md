# Typesetting tables  

Nitrile recognize following fenced blocks as expressing tabular
information.

    TABB, TABL, TABF, LONG 


The TABB fenced block is to create a LATEX tabular block such that each column
is styled as a "l". As a result the table is tightly packed and each column is
only as wide as the longest text of that column As a result, the overall table
width varies, and is the sum of the width of individual columns.

    \begin{tabular}{lll}
      ....
    \end{tabular}

The TABL fenced block is to create a LATEX tabular block where each column
is a "p{}". The width of the table is always set to be the same as the page
(\linewidth). The width of individual column depends on the total width 
of the page, and the relative column width with respect to other columns.
On the other hand, text within each column is going to appear as a paragraph.

    \begin{tabular}{p{...}p{...}{...}}
      ....
    \end{tabular}

The TABF fenced block is the same as that of a TABL block except for the fact
that it is to be made a float by the presence of the "table" environment.

    \begin{table} 
      \begin{tabular}{p{...}p{...}{...}}
      ....
      \end{tabular}
    \end{table} 

The LONG fenced block is to create a \begin{longtable} block.
The format for each column is the same as that of the TABL or TABF blocks,
such that each column is a paragraph (p{}).

    \begin{longtable}{p{...}p{...}{...}}
    ....
    \end{longtable}

For fenced blocks of TABB, TABL, TABF and LONG, the content of the table is to
be extracted from the arrangement of the text within the block.

There are two arrangements that will be recognized. In the first arrangement,
each line expresses the entire content of a row, and data cells within that row
are detected by the presence of two or more consecutive white spaces, each of
which marks the boundaries of two data cells.  For example, in the following
TABL block it is detected that there are four rows and for each row three
columns.

    ```  tabl
    Name           Value   Example
    ELEMENT_NODE   1       The <body> element
    TEXT_NODE      3       Text that is not part of an element
    COMMENT_NODE   8       <!-- an HTML comment -->
    ```

The second arrangement is that data cells in a table row is to be placed in its
own line and all data cells of the same table row is to occupy as a cluster of
lines separated by one or more blank lines.

For example, in the following TABL block the first three lines are recognized
as expressing the three data cells for the first table row, and next three
lines after the the blank line are considered to be expressing the three data
cells for the second table row, and so on.


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
first text line only yields a single table cell and there are at least one
empty lines within the rest of the block.  In this case the second
arrangement is assumed.

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

This paragraph is recognized when the first and last line is detected to be
exactly the same, and they each only contains nothing but vertical bars and
hyphen-minus characters. 

When a paragraph like this is recognized, all subsequent lines that are exactly
the same as the first/last line are considered the "separator lines".  Lines
that are not separator lines are considered expressing the contents of table
rows.  As can be seen, each table row is to be scanned for the presence of a
vertical bar, and texts between vertical bars are table cells. 

There could be more than one lines expressing the contents of the same table
row.  Each additional line for the same table row is first split, and then the
splitted table cells of which are treated as if the text of each cell is the
"continuation text".  This allows you to split long texts of a table cell text
into multiple lines and still expect them to be put together as a single cell. 

Currently, this paragraph is recognized as expressing a TABL fenced block.

For TABB, TABL, TABF, and LONG blocks a table cell can also be split into multiple 
input lines, by placing a single backslash (`\`) immediately after the cell.
When that happens, subsequent lines are to be considered continuation lines of the
previous line. Thus, the next table is to be considered equivalent as far
as the content of the table goes.

    ``` tabl
      Names          Value          Example            

      ELEMENT_NODE    1             The <body>\         
                                    element            

      TEXT_NODE       3             Text that is not\ 
                                    part of an\        
                                    element            

      COMMENT_NODE    8             <!-- an HTML\      
                                    comment ->         
                                                       
    ```

However, for TABB, TABL, TABF, and LONG there is an added benefit to allow for
texts within a table cell to be split into multiple lines. It is expressed by
placing two backslashes (`\\`) immediate after the text of a cell. The text for
the table cell is thus to be split using (`\newline`) command when it is in
(`p{}`) format. For TABB where the (`l`) format is used, two or more separate
rows are inserted to simulate the affect.

    ``` tabl
      Names          Value          Example            

      ELEMENT_NODE    1             The <body>\\        
                                    element            

      TEXT_NODE       3             Text that is not\\
                                    part of an\\       
                                    element            

      COMMENT_NODE    8             <!-- an HTML\\     
                                    comment ->         
                                                       
    ```

For TABL, TABF, and LONG blocks, the initial column width for each column is
automatically determined so that each column gets the equal width.  However,
you can manually adjust the width of the columns using the '.adjust' fence
option.

    .adjust 3 4 5

The numbers for this options are interpreted as relative widths of each column, 
thus, the first column will get a fraction of 3/12 width of the page, and the second
column get 4/12 width of the page, and the third column get 5/12 width of the page.
The page width is assumed to be (`\linewidth`) for LATEX.

    .adjust 3 4 5
    ``` tabl
      Names          Value          Example            

      ELEMENT_NODE    1             The <body>\\        
                                    element            

      TEXT_NODE       3             Text that is not\\
                                    part of an\\       
                                    element            

      COMMENT_NODE    8             <!-- an HTML\\     
                                    comment ->         
                                                       
    ```

For paragraph that uses the vertical-bar and hyphen-minus format for expressing
the content of the table, the initial value for each column width is set according
to the number of hyphen-minus for each column in the separate line. You can also 
override this by providing a '.adjust' option before the paragraph.

    .adjust 2 3 4
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




