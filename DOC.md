Nitrile Preview

Nitrile Preview package generates LATEX document from one or more Markdown (MD) documents. 

The goal of this package is simply, that is to allow you to quickly whip up a LATEX file
from a MD document. By default, a MD document will be converted to a LATEX Article document.
However, there is a provision that allows you to create a LATEX Book document by combining
multiple source MD documents.

# Makeups 

Not all MD markups are recognized. Following are the one that are recognized.

- Headings using hash (#) 
- List items using plus (+), hyphen (-), and asterisk (*). 
- Triple-grave-accent fenced block for code block
- Triple-tilde block fenced block for verbatim block
- Inline markup using double-underscore for bold, and single-underscore for
  italic, double-grave-accent for inline code, and single-grave-accent for 
  inline code.
- Link markup such as `` [Google](www.google.com) ``. 

# Stylign a tabular

A tabular can be constructed by constructing a fenced block using === fences.
The result is either a "tabulary" or a "tabularx" environment. The first is
provided by package "tabulary" and the second "ltablex". 

~~~
===
Node Type      Value   Example       
ELEMENT_NODE   1       The <body> element
TEXT_NODE      3       Text that is not part of an element
COMMENT_NODE   8       <!-- an HTML comment -->
===
~~~

Followig is the translation of this block.

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
 
By default, Nitrile uses the \toprule, \midrule to draw horizontal lines
on top of the header row and underneath the header row. It also uses
\bottomrule to draw a horizontal line after the last row of the table.
The first row is always assumed as the header row. 


## Supported LATEX left/right fences

    "\\left\\lbrace"
    "\\left\\lbrack"
    "\\left\\llbracket"
    "\\left\\langle"
    "\\left("
    "\\left\\lVert"
    "\\left\\lvert"
    "\\left\\lceil"
    "\\left\\lfloor"

    "\\right\\lbrace"
    "\\right\\lbrack"
    "\\right\\llbracket"
    "\\right\\langle"
    "\\right)"
    "\\right\\lVert"
    "\\right\\lvert"
    "\\right\\lceil"
    "\\right\\lfloor"

## Supported LATEX commands          

    \text  
    \binom
    \frac
    \sqrt
    
# Supported LATEX font variants

    \mathbb{ABab12}  
    \mathscr{ABab12}  
    \mathcal{ABab12} 

NOTE: only the upper-case letter, lower-case letter, and digits are supported.
No spaces are allowed.

NOTE: for mathbb variant, which is for double-strike variant, 
the following letters in Unicode are having a "different" appearance
than the other ones:

    C  - field of complex numbers
    H  - field of quaternion numbers, which is a number system that extends the complex numbers.
    N  - field of all natural numbers, which must be a positive integers: 1, 2, 100, ...
    P  - field of all prime number
    Q  - field of rational numbers, excluding irrational number such as PI  
    R  - field of all real numbers, including integers and floating point numbers
    Z  - field of all integers, including negative integers and zeros. 
   
NOTE: Unicode only provide code points for mathbb-variant digits, which would have
been styled with double-struck appearance. Unicode does not provide code points for 
mathscr or mathcal style variants. Thus, if digits are detected for mathscr or mathcal
variants it simply falls back to using regular digits. 

# \sum, \lim and \int           

Supports are provided for using these commands for showing the summation, limits, and
integral equations. 

    \lim_{i \to \infty} \frac{1}{i} 

Or

    \sum_{i=0}^{100} i^2

Or

    \int_{0}^{100} x dx

So far only the inline-math mode is supported.

# Work still needs to be done

- Need to continue fine-tune individual symbols in nitrile-preview-math.json file 
so that each of the math symbols in the "mathSymbols" section have its optimal width
such that when displayed the symbol is neither cut-off or left with too much space
at the tail-end.

- Need to work on display-math such that the fraction, the lim, sum, and integral
will be styled and scaled differently than those of inline-math mode. 

- Need to add an "formula" block that will turn into either an equation or display
math. 




