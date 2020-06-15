The SHOR block

This block is designed to layout tabular data similar to LONG
but without the header and frame, thus all rows are considered
table bodies. 

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
of a SHOR row, and each additional & at the start
of a line of that paragraph signals the addition of a 
new data cell of that row. 

Multiple paragraphs that are detected to start with a & are 
to be "stiched" together to form a single SHOR block,
for which the number of rows equals the number of paragraphs,
and the number of columns equals the largest number
of data cells among all paragraphs.
In the previous example there are a total of 5 data rows
and 2 data columns

The contents of the SHOR block is to be influenced by the
font size choices of "nitabb", similar to LONG.

