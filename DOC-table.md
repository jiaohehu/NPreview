# Typesetting tables  

Nitrile recognize following fenced blocks as expressing tabular
information.

    tabular 
    tabulary 
    tabularx
    longtabu 

Tabular is a LATEX `tabular` environment  that cannot be broken into separate
pages.  Tabulary is an extension of `tabular*` environment that its column
widths are automatically adjusted by the package so that you do not have 
to specify it directly. Both tabular and tabulary only supports single
line table cell.

For the `tabularx` and `longtabu` blocks, each table column is a paragraph
style, and they would both be able to split across page boundaries.  Both
`tabularx` blocks will attempt to set the table width using relative width of
each column, obtained either by the `.adjust` option or some other means.
However, the LATEX `tabularx` environment will also shrink the overall table
width to a smaller value if the combine width of the columns are small.  On the
other hand, the `longtabu` environment will always extend the overall width of
the table to the desired one. Current this is always set to `\linewidth`.

For `tabular` block it is to treat all table rows as data rows, thus no rule
lines are added. This block also does not respond to latexTableStyle config
flag. The intend of this block is to typeset tabular data that is
self-explanatory. Note that since LATEX `tabular` environment does not come
with vertical margins a \begin{center} environment is inserted.

    \begin{center}
    \begin{tabular}{ll}
    \( 1 \) & \( 1 \) \\
    \noalign{\medskip}
    \( 2 \) & \( \displaystyle \frac{1}{2} \) \\
    \noalign{\medskip}
    \( 3 \) & \( \displaystyle \frac{1}{3} \) \\
    \noalign{\medskip}
    \( 10 \) & \( \displaystyle \frac{1}{10} \) \\
    \noalign{\medskip}
    \( 20 \) & \( \displaystyle \frac{1}{20} \) \\
    \end{tabular}
    \end{center}

Following is an example of a `tabulary` environment. Note that a \begin{center}
environment is also placed around it as this environment does not come with
vertical space before and after it.

    \begin{center}
    \begin{tabulary}{\linewidth}{LL}
    \toprule
    \textbf{Number} & \textbf{Reciprocal}\\
    \midrule
    \( 1 \) & \( 1 \) \\
    \noalign{\medskip}
    \( 2 \) & \( \displaystyle \frac{1}{2} \) \\
    \noalign{\medskip}
    \( 3 \) & \( \displaystyle \frac{1}{3} \) \\
    \noalign{\medskip}
    \( 10 \) & \( \displaystyle \frac{1}{10} \) \\
    \noalign{\medskip}
    \( 20 \) & \( \displaystyle \frac{1}{20} \) \\
    \bottomrule
    \end{tabulary}
    \end{center}

Following is an example of a `tabularx` environment. This environment allocates
extra vertical space before and after it.

    \begin{tabularx}{\linewidth}{>{\hsize=1\hsize\raggedright\arraybackslash}X>{\hsize=1\hsize\raggedright\arraybackslash}X}
    \toprule
    \textbf{Number} & \textbf{Reciprocal}\\
    \midrule
    \( 1 \) & \( 1 \) \\
    \noalign{\medskip}
    \( 2 \) & \( \displaystyle \frac{1}{2} \) \\
    \noalign{\medskip}
    \( 3 \) & \( \displaystyle \frac{1}{3} \) \\
    \noalign{\medskip}
    \( 10 \) & \( \displaystyle \frac{1}{10} \) \\
    \noalign{\medskip}
    \( 20 \) & \( \displaystyle \frac{1}{20} \) \\
    \bottomrule
    \end{tabularx}

Following is an example of a `longtabu` environment.

    \begin{longtabu} to \linewidth {X[0.5]X[0.5]}
    \toprule
    \textbf{Number} & \textbf{Reciprocal}\\
    \midrule
    \endhead
    \bottomrule
    \endfoot
    \( 1 \) & \( 1 \) \\
    \noalign{\medskip}
    \( 2 \) & \( \displaystyle \frac{1}{2} \) \\
    \noalign{\medskip}
    \( 3 \) & \( \displaystyle \frac{1}{3} \) \\
    \noalign{\medskip}
    \( 10 \) & \( \displaystyle \frac{1}{10} \) \\
    \noalign{\medskip}
    \( 20 \) & \( \displaystyle \frac{1}{20} \) \\
    \end{longtabu}

The <xltabular> package is the latest package that replaces <ltablex> package. It
claims to have restored to the original tabularx package while allows for a
table to be broken into multiple pages. It has been observed that if column X
is used, it will always set the table width to the one specified. Unlike
<ltablex> package, which shortens the width of the table if not enough content
is at the table.


Each line in a Markdown file expresses the entire content of a row, and data
cells within that row are detected by the presence of two or more consecutive
white spaces.  For example, in the following block it is detected that there
are four rows and for each row three columns.

    ```  tabular
    Name           Value   Example
    ELEMENT_NODE   1       The <body> element
    TEXT_NODE      3       Text that is not part of an element
    COMMENT_NODE   8       <!-- an HTML comment -->
    ```

The following arrangement is also recognized in a Markdown file such that data
cells in a table row is to be placed in its own line and all data cells of a
table row is to occupy as a cluster of lines separated by one or more blank
lines.

For example, in the following block the first three lines are recognized as
expressing the three data cells for the first table row, and next three lines
after the the blank line are considered to be expressing the three data cells
for the second table row, and so on.


    ``` tabular
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

Alternatively, following formations of a paragraph will be recognized as
well.

    ``` tabularx
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
    ```

When the first and last line is detected to be exactly the same, and they each
only contains nothing but vertical bars and hyphen-minus characters. In
addition, the first and last character of each line is also a vertical bar.

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

The column width for such a paragraph formation is to be deduced by noticing
the relative number of hyphen-minus characters for each column, and the use
these numbers as bases for adjusting the column. The effect is similar to
setting the '.adjust' option to a list of numbers each of which equals
to one of the hyphen-minus counts. 

However, you can still override the initial table width with the adding of a
'.adjust' option in front of it.

    .adjust 2 3 4
    ``` tabularx
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
    ```

Note that if it is detected that the first and last line does not start and end
with a vertical bar character, such as the following paragraph shows, it is
still recognized as a valid "tabular block".  However, if this is the case then
all other lines between the first and last lines must all follow the same
pattern, which is to not have a vertical bar at the beginning and ending of the
line. Thus, following tabular is going to be recognized.

    .adjust 2 3 4
    ``` tabularx
    --------------|--------------|------------------- 
    Names         | Value        | Example            
    --------------|--------------|------------------- 
    ELEMENT_NODE  |  1           | The <body>         
                  |              | element            
    --------------|--------------|------------------- 
    TEXT_NODE     |  3           | Text that is not   
                  |              | part of an         
                  |              | element            
    --------------|--------------|------------------- 
    COMMENT_NODE  |  8           | <!-- an HTML       
                  |              | comment ->         
                  |              |                    
    --------------|--------------|------------------- 
    ```

Each table cell can also be split into multiple input lines, by placing a
single backslash (`\`) immediately after the cell.  When that happens,
subsequent lines are to be considered continuation lines of the previous line.
Thus, the next table is to be considered equivalent as far as the content of
the table goes.

    ``` tabularx
    Names          Value          Example            

    ELEMENT_NODE    1             The <body>\         
                                  element            

    TEXT_NODE       3             Text that is not\ 
                                  part of an\        
                                  element            

    COMMENT_NODE    8             <!-- an HTML\      
                                  comment ->         
    ```

For `tabulary`, `tabularx`, and `longtabu` block, it is also possible to allow
for a table cell to be split into multiply lines, thanks to the availability of
LATEX macro `\newline`.  It is expressed by placing two backslashes (`\\`)
immediate after the text of a cell. 

    ``` tabulary
    Names          Value          Example            

    ELEMENT_NODE    1             The <body>\\        
                                  element            

    TEXT_NODE       3             Text that is not\\
                                  part of an\\       
                                  element            

    COMMENT_NODE    8             <!-- an HTML\\     
                                  comment ->         
    ```




