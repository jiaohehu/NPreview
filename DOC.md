Nitrile Preview


# A TABB block

This block is used to construct a LATEX Table. The table is to be styled using
the "tabularx" environment, which is provided by package "tabulary" and must be
included.  This environment allows you to specify the left-one-line column (l),
right-one-line column (r), center-one-line column (c), and
fixed-width-paragraph column (p{1in}), and left-justified-paragraph column (L).

As a defualt, a table such as the following will be translated into LATEX as follows.

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

The first row is always treated as a heading, and will be translated as
bold-text that is always center justified. the \multicolumn command here 
completes this task for us. 

The rest of rows are treated as table body, and the text will be processed
for any appearances of inline markups. The table header will be treated
as plain text.

The "tabulary" package is chosen because it allows for specification of
fixed-width columns as well as a "balanced" column that tabulary environment
itself will try to determine based on the content of the text. 

We will isnert a \textwidth as the width of the table, but the "tabulary"
environment seems to want to shrink the table width if all columns of the table
are short enough.

The "tabulary" environment also supports fixed-width columns such as p{1in}.
You can specify the columns using the forms such as l, r, c, p{1in}, and L, by
pass it as the value of the "columns" option of this block. The following
example shows how we have designated the second and third columns as having the
column being set to the type of "L" and the first column to "l":

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

By default, if "columns" option is absent, all columns is assumed the type of
"L".

However, tabulary does not break over page boundaries. So if you have a long
table that would need to be broken over several pages, you would need the
".longtable" directive.

When a ".longtable" directive is given, the table is styled using "tabularx"
environment. This package introduces a new column type that is "X" and can be
used to adjust relative size of the columns that are marked as "X" among
themselves with the goal of having the entire table width the same width of
\textwidth or some other values. 



