The TABR block

This block is to typeset a floating or non-floating table. 
When the table is "float", it will be arranged in such a way
that it might be placed in a different page, depending
on the available space on the current page, and also
depending on the algorithms design of the layout engine. 
A "float" table must have a caption and will be
numbered.

The format for a TABR block can be shown by the following
example.

  @ ${#tab:mytable} My address book.  
  ```table 
  Name     |              | Phone Number
  Johon    | 212 Dan st.  | 222-222-2222
  James    | 23 Sun Rd.   | 333-333-3333
  Justin   |              |        
  ---
  [$b] Address
  [$b3] 345 Lindon Str.      
  [$c3] 444-444-4444         
  ```

In general, for a floating table, the first line of the paragraph
must start with an at-sign, followed by one or more space,
followed by a label designation, and the a caption. If there are
additional captions they will appear in the next few lines. The
table body is to start after the fence, which is a
triple-backtick, followed by the word "table".  The content of
the table terminates after another fence is encountered.

Each line is understood to express an entire row of a table.
Thus, if a table is to have three rows there should be three
lines after the fence. Each data cell is to be separated by a
vertical-bar character in that row.

NITRILE also allows for a different way of specifying the table.
Rather than place the text between vertical-bars, it can be
specified using a notation similar to a spreadsheet app, with $a
to express the first column, $b, for the second column, $c for
the third column, etc. In the previous example, `$b` was used to
express the content of the header of the second column, `$b3` for
the content of the secod column and third data row, and `$c3` for
the content of the third column and third data row.

The supplying of data cell content (or header cell content) must
be done after a "separator" which consists of only three or more
hyphen-minus character, and before the appearance of the ending
fence.

This alternative way of supplying the content of data cells, can
also be utilized to supply table cell content that contains
vertical-bar characters, that otherwise is impossible.  The data
cell designation refers to a table cell that is outside the range
of the current table, the table will be expanded to accomodate
the cell. However, there is currently a hardcoded limitation of a
maximum 26 columns and 200 rows for a table.

For this reason, it is possible to build up the entire table using
only the alternative designation. In this case, specify a "separator"
immediately after the starting fence, and then start supplying
the table cell contents using the alternative syntax. Following
is the example of a table that is the same as the one above.

  @ ${#tab:mytable} My address book.  
    ```table 
    ---
    [$a] Name    
    [$b] Address
    [$c] Phone number

    [$a1] Johon    
    [$b1] 212 Dan st.  
    [$c1] 222-222-2222

    [$a2] James    
    [$b2] 23 Sun Rd.   
    [$c2] 333-333-3333

    [$a3] Justin
    [$b3] 345 Lindon Str.      
    [$c3] 444-444-4444         
    ```


