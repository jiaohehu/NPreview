The TABB block

This block is designed to layout tabular data similar to LONG
but without the header and frame, thus all rows are considered
table bodies. In addition, each cell is to be rendered in
the same width, in proportion to each other, and the entire
block takes up the full width of the page. 

The syntax of this block to be recognized is similar to LONG,
the only difference is that `(&)` is being replaced by `&`.

  &  ``0 \: \leftrightarrow \: 9``
  &  ``1 \: \leftrightarrow \: 8``

  &  ``2 \: \leftrightarrow \: 7``
  &  ``3 \: \leftrightarrow \: 6``

  &  ``4 \: \leftrightarrow \: 5``
  &  ``5 \: \leftrightarrow \: 4``

  &  ``6 \: \leftrightarrow \: 3``
  &  ``7 \: \leftrightarrow \: 2``

  &  ``8 \: \leftrightarrow \: 1``
  &  ``9 \: \leftrightarrow \: 0``

Each & in the beginning of a paragraph signals the start
of a TABB row, and each additional & at the start
of a line of that paragraph signals the addition of a 
new data cell of that row. 

Multiple paragraphs that are detected to start with a & are 
to be "stiched" together to form a single TABB block,
for which the number of rows equals the number of paragraphs,
and the number of columns equals the total number of cells
in the first paragraph.
In the previous example there are a total of 5 data rows
and 2 data columns

The contents of the TABB block is to be influenced by the
font size choices of "nitabb", similar to LONG.

The LATEX translation replies on the "tabbing" environment, and
thus longer texts are to be "overlapping" each other. The CONTEX
translation replies on bTABLE, and thus contents might be
"wrapped" like a paragraph. HTML uses TABLE-element, depending
on the browser, the width of the columns might be adjusted
automatically by browser to accomodate for different column
width. In any way, the design of this block is intended
to showcase contents that are know to have equal width.




