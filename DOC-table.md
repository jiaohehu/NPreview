# Typesetting tables  

Nitrile recognize following fenced blocks as expressing tabular
information.

-    'tabular'
-    'longtable'

The purpose for a 'tabular' block the goal is to typeset a short, tight table
that is centered, and for which the table should not have been broken up into
multiple pages.  In addition, each data cell is to appear as a single line. Thus
the table will be able to expand and shrink each column to fit the longest line
of that column.

This effect can be achieved using several LATEX packages: tabular, xtabular,
tabulary, tabularx. etc. Currently the tabulary package is chosen because it
offers the capability to automatically balance the width of column in the event
of an extremely tight space, such as when the table is placed at a column in a
two-column layout document, in which case the tabulary environment is able to
shrink the overall width of the table while tabular environment won't.  Tabulary
is an extension of `tabular*` environment that its column widths are
automatically adjusted by the package so that you do not have to specify it
directly. Both tabular and tabulary only supports single line table cell.

The purpose for a 'longtable' block is to typeset a fullwidth table and that its
rows can split across page boundaries.   In addition, each data cell is a
paragraph rather than a single line.

There are several LATEX packages: supertabular, xtabular, ltablex, longtable,
longtabu, and xltabular packages. Currently, the xltabular package was chosen
for three reasons. First it always typeset the table in full page width, and
second it is able to split the content into multiple pages. The third reason is
that it allows for the width of each column to be expressed as a "relative
width". For example, if a table has three columns and the columns are expressed
as 1, 2 and 2, then the first column will take up 20% of the table width, while
the second and third column taking up 40% and 40% of the table width.

Besides xltabular, the longtabu environment is also a viable candidate. However,
the ltablex environment is not a good choice because it will not always typeset
the table in full page width, especially when there isn't enough text to fill
the entire width of the column. The supertabular, longtable and xtabular
packages are capable of splitting rows across page boundaries, but they are not
good candidates because none of them offers the capability to express relative
column width.

The `xltabular` package has provision to allow the same header and/or footer to
be repeated in all separate tables that are to appear in each page. It utilizes
the `\endhead` and `\endfoot` construct that allow you to configure the
appearance of the repeating header and footer.

# A LATEX tabulary example

Following is an example of a LATEX `tabulary` environment. Note that a
`\begin{center}` environment is needed because `tabulary`  environment does not
come with vertical space before and after it.

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

# A LATEX xltabular example

The `xltabular` package is based on `tabularx` package. It has a perculiar
way of specifying the column width.  Following is an example of a
`xltabular` environment. This environment allocates extra vertical
space before and after it.

    \begin{xltabular}{\linewidth}{>{\hsize=1\hsize\raggedright\arraybackslash}X>{\hsize=1\hsize\raggedright\arraybackslash}X}
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
    \end{xltabular}

Following is an example of a `xltabular` environment that configures a
repeating header and footer.

    \begin{xltabular}{\linewidth}{>{\hsize=1\hsize\raggedright\arraybackslash}X>{\hsize=1\hsize\raggedright\arraybackslash}X}
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
    \end{xltabular}


# Inside a tabular or longtable block

The `tabular` and `longtable` fenced blocks share the same content format.
Currently, there are a total of five different ways to express the content of
the table. The first format, which is also the simplest, each line expresses a
table row. Table cells are found to be within that line that are separated
by two or more spaces. In the following table there are a total of four table rows and within each row there are a total of three table cells.

    ```  tabular
    Name           Value   Example
    ELEMENT_NODE   1       The <body> element
    TEXT_NODE      3       Text that is not part of an element
    COMMENT_NODE   8       <!-- an HTML comment -->
    ```

For `tabular` and/or `longtable`, the first table row is always treated
as the table header.

The second format requires each data cell to appear in its own line. A clusters
of lines without empty lines in them forms a single table row. An empty line
starts a new table row. Thus, following tabular block would have expressed the
same table content as the previous one.

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

This format is detected and assumed when the very first line of the
fenced block expresses only a single column, and there is at least one
empty line detected inside the entire fenced block.

The third format also requires an empty line to start a new table row. However,
each line is to express all the table cells of that row. However, a cluster of
lines without empty lines in them are to supply additional content for the table
cells of the same table row. In the following example the content of the second
row of the second column is found to be split between two consecutive lines.
Likewise, the content of the second column of the third row is found to be
split across a total of four consecutive lines.



    ``` tabular
    Type of angle                      Examples                              

    Vertical angles                    ``\angle 1`` and ``\angle 3``\     
                                       ``\angle 2`` and ``\angle 4``        


    Linear pair of angles              ``\angle 1`` and ``\angle 2``\
                                       ``\angle 2`` and ``\angle 3``\
                                       ``\angle 3`` and ``\angle 4``\
                                       ``\angle 4`` and ``\angle 1``
    ```

In order for the content of a particular data cell to be split and then
merged back, an ending backslash must be placed at the end of the cell.
In addition, if a double-backslash is to be found that ends a cell,
the additional content of the cell is assumed to want to start in a
new line. This is equivalent to inserting <br/> element into the middle of
a text content while the entire text content is part of a <td> element.

    ``` tabular
    Type of angle                      Examples                              

    Vertical angles                    ``\angle 1`` and ``\angle 3``\\     
                                       ``\angle 2`` and ``\angle 4``        


    Linear pair of angles              ``\angle 1`` and ``\angle 2``\\
                                       ``\angle 2`` and ``\angle 3``\\
                                       ``\angle 3`` and ``\angle 4``\\
                                       ``\angle 4`` and ``\angle 1``
    ```


The forth format is to use a combination of hyphen-minus and vertical-bar
characters to "draw" the boundaries of a table.


    ``` tabular
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

The fifty format is similar two the forth one except that the beginning
and ending of the vertical-bar character must not be placed.

    ``` tabular
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

# Block options

Following block options can be used with  `tabular` and/or `longtable`
blocks:

  - `.vlines`
  - `.hlines`
  - `.vpadding`

The .vlines option express the appearances of "vertical lines"
of the table. In HTML terms, it is for the left/right border of a table cell.

    .vlines 0 1 2 3 4

It uses a list of integers, each of which expresses the location of the vertical
line. In particular, the integer 0 is the left for the first column. The integer
1 is the left border for the second column, and so on.  For a five-column
table, the integer 5 expresses the right border for the fifth column.

The .hlines option expresses how horizontal lines are to be drawn for the table.
It expectes a list of letters that are either t, m, b, or r. In particular, the
letter t denotes the top horizontal line that is above the table header. The
letter m denotes the horizontal line between the header row and the first data
row. The letter b denotes the horizontal line below the last data row. The
letter r denotes a horizontal line between two data rows.

Thus, following setting would have asked to draw three horizontal lines
that are before and after the header row, and the one at the very bottom.

    .hlines t m b

The following example will draw only the horizontal line that is between the
header row and first data row.

    .hlines m

The following example will draw draw horizontal lines between all table rows
as well as the first line above the table and the last line below the table.

The .vpadding expects an integer such as 1, 2, or 3, to express the padding
between the border of the table cell and the text. This is equivalent to CSS
"padding-top" and "padding-bottom". For example, if .vpadding is set to 1,
for LATEX it is to insert a `\noalign{\vspace{1pt}}` in front of a cell
and after a cell.

    .vlines 0 1 2 3
    .hlines t m b r
    .vpadding 1
    ```tabular
    Name       Phone Number    Description
    John       222-222-2222    Back to the future
    John       222-222-2222    Back to the future
    ```

    \begin{center}
    \begin{tabulary}{\linewidth}{|L|L|L|}
    \hline
    \noalign{\vspace{1pt}}
    \textbf{Name} & \textbf{Phone Number} & \textbf{Description}\\
    \noalign{\vspace{1pt}}
    \hline
    \noalign{\vspace{1pt}}
    John & 222-{}222-{}2222 & Back to the future \\
    \noalign{\vspace{1pt}}
    \hline
    \noalign{\vspace{1pt}}
    John & 222-{}222-{}2222 & Back to the future \\
    \noalign{\vspace{1pt}}
    \hline
    \end{tabulary}
    \end{center}

If .vpadding is set to a number 2, then the `\vspace{2pt}` command will
be used instead. For HTML generation, if .vpadding is set to 1, then  
"padding-top" and "padding-bottom" will be both set to "1px".
If it is set to 2, then "padding-top" and "padding-bottom" will be set to
"2px". For HTML generation, "padding-left" and "padding-right" of each
cell is always set to "6px".
