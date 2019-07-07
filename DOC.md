Nitrile Preview


# A TABB block

This block is to style a LATEX Table. The result is either a "tabulary" or a
"tabularx" environment. The first is provided by package "tabulary" and the
second "ltablex". 

As a defualt, a table such as the following will be translated into LATEX as
follows.

~~~
===
Node Type      Value   Example       
ELEMENT_NODE   1       The <body> element
TEXT_NODE      3       Text that is not part of an element
COMMENT_NODE   8       <!-- an HTML comment -->
===
~~~

~~~
\begin{tabulary}{\textwidth}{|L|L|L|}
\hline
\multicolumn{1}{|c|}{\textbf{Node Type}} & 
\multicolumn{1}{c|}{\textbf{Value}} & 
\multicolumn{1}{c|}{\textbf{Example}} \\
\hline
ELEMENT\_NODE & 1 & The {$<$}body{$>$} element \\
\hline
TEXT\_NODE & 3 & Text that is not part of an element \\
\hline
COMMENT\_NODE & 8 & {$<$}!-- an HTML comment --{$>$} \\
\hline
\end{tabulary}
~~~

Each line is recognized as a row to a table. Cells are recognized by splittting
the line into multiple segments separated by two or more spaces. 

If there are no double-space detected in the first line, then it is assumed
that the entire line is for the first cell of the first row, and the next 
line is for the second cell of the first row, and so on. A second row is
started when a blank line is encountered. Thus, the previous table can be rewritten
as follows.

===
Node Type      
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
===

The "tabulary" package is used by default. By default all columns are assumed
the type of "L", as is recognized in "tabulary" as a "balanced" column, whose
width is automatically determiend by "tabulary" based on the content of the column
and also those of other "L" columns.

You can change the column type by using the option of "columns" and then list 
the type of the columns separated by spaces.

~~~
===[columns:l L L]
Node Type      Value   Example       
ELEMENT_NODE   1       The <body> element
TEXT_NODE      3       Text that is not part of an element
COMMENT_NODE   8       <!-- an HTML comment -->
===
~~~

~~~
\begin{tabulary}{\textwidth}{|l|L|L|}
\hline
\multicolumn{1}{|c|}{\textbf{Node Type}} & 
\multicolumn{1}{c|}{\textbf{Value}} & 
\multicolumn{1}{c|}{\textbf{Example}} \\
\hline
ELEMENT\_NODE & 1 & The {$<$}body{$>$} element \\
\hline
TEXT\_NODE & 3 & Text that is not part of an element \\
\hline
COMMENT\_NODE & 8 & {$<$}!-- an HTML comment --{$>$} \\
\hline
\end{tabulary}
~~~

One thing to remember is that "tabulary" does not split a table over two pages.
Thus, for a table with many rows a different LATEX table would be needed. 
In this case you can specify a "longtable" option such as the following.

~~~
===[longtable;columns:l L L]
Node Type      Value   Example       
ELEMENT_NODE   1       The <body> element
TEXT_NODE      3       Text that is not part of an element
COMMENT_NODE   8       <!-- an HTML comment -->
===
~~~

In this case any column that is "L" is automatically converted to a "X" column 
as is recognized by "tabularx". 

~~~
\begin{tabularx}{\textwidth}{|l|X|X|}
\hline
\multicolumn{1}{|c|}{\textbf{Node Type}} & 
\multicolumn{1}{c|}{\textbf{Value}} & 
\multicolumn{1}{c|}{\textbf{Example}} \\
\hline
ELEMENT\_NODE & 1 & The {$<$}body{$>$} element \\
\hline
TEXT\_NODE & 3 & Text that is not part of an element \\
\hline
COMMENT\_NODE & 8 & {$<$}!-- an HTML comment --{$>$} \\
\hline
\end{tabularx}
~~~

A "X" column in "tabularx" is almost the same as that of a "L" column in
"tabulary", except that "tabularx" does not try to "balance" the width of "X"
columns the same way as "tabulary" does; so by default all "X" columns are the
same width. However, "tabularx" does have a provision that allows you to ajust
the relative widths of all "X" columns so that one column is wider than the
other. To do that, you can use the "adjust" option such as follows.

~~~
===[longtable;columns:l L L;adjust:0.4 0.6]
Node Type      Value   Example       
ELEMENT_NODE   1       The <body> element
TEXT_NODE      3       Text that is not part of an element
COMMENT_NODE   8       <!-- an HTML comment -->
===
~~~
 









