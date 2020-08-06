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
  $b=Address
  $b3=345 Lindon Str.      
  $c3=444-444-4444         
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
vertical-bar character in that row. The first row is always
the header row.

NITRILE also allows for an alternative syntax for supplying the
content of a table cell.  Rather than inserting text between
vertical-bars, a table cell content can follow a cell
designation such as `$a1`, followed by an equal sign and then the
content of the data cell.  The data cell designation such as
`$a1` follows the similar naming conversion of a spreadsheet app,
where letter after the dollar-sign express the column and the
number after that express the data cell. There cannot be any
space between the cell designation and the equal sign.
The header cells are denoted as `$a`, `$b`, `$c`,
etc.  and the first data row is `$a1`, `$b1`, `$c1`, etc.  

The supplying of cell contents (header or data) must begin after
a "table separator" which signals the end of the the "normal
syntax" and the start of the "alternative syntax." The table
separator is a line that consist of only three or more
hyphen-minus characters. It must also appear before the second
triple-backtick fence.

If a data cell designation refers to a cell that is outside the
range of the table, the table will be expanded to accomodate the
cell.  However, there is currently a hardcoded limitation of a
maximum 26 columns and 200 rows for a table.

This alternative syntax can also be utilized to supply table cell
content that contains vertical-bar characters, that otherwise is
impossible.  

It is also possible to build up the entire table using only the
alternative syntax. In this case, place the "table separator"
immediately after the starting fence, and then start supplying
the table cell contents using the alternative syntax. Following
is the example of a table that is the same as the one above.

@ ${#tab:mytable} My address book.  
  ```table 
  ---
  $a=Name    
  $b=Address
  $c=Phone number

  $a1=Johon    
  $b1=212 Dan st.  
  $c1=222-222-2222

  $a2=James    
  $b2=23 Sun Rd.   
  $c2=333-333-3333

  $a3=Justin
  $b3=345 Lindon Str.      
  $c3=444-444-4444         
  ```

For header contents, the text will be scanned for the appearance of 
a double-backslash. If found, it is treated as the "line break" 
of the header text. Following is an example where the header
row text will each be split into two lines.

@ ```table
  First\\number | Second\\number
  -------------|-----------------
   1           | 2
   2           | 4
   3           | 6
   4           | 8
   5           | 10
   5.5         | 11
   6           | 12
  ```

If the starting fence appear at the first line, then the table is assumed
to be a non-floating table.  

For LATEX translation, "tabulary" is used. This environment is pretty 
versatile as it treats each cell as a "paragraph", but is smart enough
to automatically adjust the width of each column so that it appears
natural in terms of its width in ration to neighboring columns. 
It automatically calculates and chooses the best width for each
column and thus making the entire table look "balanced". 

For CONTEX the bTABLE is used. It is similar to "tabulary" in its
versatility in figuring out the optimum width of each column,
and will also optionally wrap the content of each cell if the width
gets too small.



