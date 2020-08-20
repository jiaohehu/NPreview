# NITRILE markups

Nitrile Preview package generates LATEX document from one or more Markdown (MD)
documents.

The goal of this package is simply, that is to allow you to quickly whip up a
LATEX file a MD document. By default, a MD document will be converted to a
LATEX Article document. However, there is a provision that allows you to create
a LATEX Book document by combining multiple source MD documents.

# Block-level Makeups

Headings are marked by one or more hashes. 

    # Heading
    ## Heading
    ### heading
    #### heading

Each heading block is to be assigned an 
internal number that equates the number of hash
marks at the beginning of the line, that is
called HDGN. 

As a special 
condition, if a paragraph starts at the first line
of the document, then it is assigned a HDGN 0. 
This heading can be understood as the "title" of this 
document. In the case of establishing a "master" document
where it imports sub-documents as chapters, section,
the "title" of this document to be used for the title
of the chapter, section, subsection, subsubsection, and
so on. 

List items must appear starting
a plus (``+``), hyphen (``-``), or asterisk (``*``)
at the beginning of the line.

    + Apple
    - Pear
    * Banana

If the item text is to be split into multiple lines,
the continuation line must be indented.

    + Apple is
      great.
    + Pear is 
      great
    + Banan is
      great

For an item started by a plus-sign then it is interpreted as a 
desription list item.

    + Apple
      A great fruit.
  
    + Pear 
      Another great fruit.


For an item started by a asterisk then it is interpreted as an
itemized item. In addition, the beginning of the list item text
is scanned and looked for a certain pattern that is to be interpreted
as emphasized text that will be shown as bold. 

As a default, only the first word is scanned and collectd
as the emphasized text.

    * Apple  a great fruit
    * Pear   another great fruit

If two or more words are needed then a set of braces is to be added.
Note that there must be at least one space after the opening brace
and before the closing brace.

    * { Hello world }  is a common used expression
    * { See you later }  is another common expression.

If astrophies or quotation marks are detected at the beginning then
they are scanned so that all texts in between the matching quotes are
collected as a single unit. 

    * '\t'  the tab character
    * '\ '  the space character

    * "\t"  the tab character
    * "\ "  the space character

For list items starting with a hyphen-minus it is interpreted as 
a regular list item for a unordered list---no special processing
is attached to it. Note that all texts associated with list items
are treated as rich text, such that markups are to be recognized.
The only exception is the emphasized text started by asterisk-lead
items, which is treated as plain text.

    - First list item
    - Second list item with long lines
      and continuation lines here
      and there...
    - Third list item

Note that for all list items, the first list item must start from column
one without any spacing before it. The second and more list items within
the same paragraph must also start from the first column, such as the one 
previous example shows. The continuation line that is part of a previous
list item must not start from the first column. In general, lines within 
a paragraph that is considered a list item are scanned line-by-line and 
if a line is found to start from the first column and does not fit the
description of a start of a list item, then this line of text will be
considered to have started a new paragraph.

The reason for this is to avoid the situation of mistakenly interprete 
part of a normal text of a list item as the start of a new list item. 

Thus, if a list block has started, all additional lines that 
are not originating from the first column will be considered as part of the
last list item. In addition, if a blank line is encountered, the current
list item is thought to have terminated. Additional paragraph that is
assumed to have started not from the first column is then scanned to 
see if it is a nested item. If it is then the entire paragraph is considered
part of this item. If it not, then the entire paragraph is considered
a paragraph item.

    1. console.log()

       A function that sends output to the console.

       ```
       console.log('hello world');
       ```

In the previous example, the list, assuming having started from first 
column, is to be followed by an indented paragraph, which is to be considered
a paragraph item following the first list item. The next paragraph, 
which is marked by a pair of triple-backquote, at the start and last line,
is to be considered a normal paragraph item but expressing a list of literal
lines. This block is named "verbatim paragraph".

Besides the verbatim paragraph, there are two additional types of paragraphs:
"verse paragraph", "story paragraph", and "tabular paragraph".

    1. Poetry

      ---
      He gives his harness bells a shake
      To ask if there's some mistake.
      The only other sound's the sweep
      Of easy wind and downy flake.
      ---

      ===
      Gone with the wind, and the future
      of mankind and other interesting
      stories.
      ===

      ~~~
      Jane     Austin
      Jack     Justin
      Tom      Sander
      ~~~

The "verse paragraph" is marked by a pair of triple-hyphen-minus
at the beginning and end of the paragraph. The "story paragraph" 
is marked by a pair of triple-equal-sign at the beginning
and end of the paragraph. The "tabular paragraph" is marked by
a pair of triple-tilde at the beginning and end of the paragraph.

For a "verse paragraph", each line is to start in its own line, 
and multiple spaces are collapsed, and spaces at the beginning of 
each line is removed. In addition, a backslash can be placed at 
each line to indicate that it is to continue at the next line.

    ---
    He gives his harness\
      bells a shake
    ...
    ---

In the previous example, the first and second line is to be combined
into a single line. For a "story paragraph", the entire paragraph is 
to be combined into a single paragraph.  For a "tabular paragraph", the
paragraph is considered a tabular, with each line a row and words within
a line to be tables cells, each of which is separated by at least three
spaces.

For these specialized paragraphs, the texts are considered plain text.

The normal "quote block" is supported by placing a greater-than
sign at the first column of the first line of the paragraph.

    > "The greatest glory in living lies not in never 
      falling, but in rising every time we fall." 
      -Nelson Mandela

As always, the rest of the paragraph must not start at the beginning
of the line, and must be indented. 

There is also a "paragraph block" where two more more columns 
of text can be placed side-by-side.

    < 1 + 2 = 3
      1 + 3 = 4
      1 + 4 = 5
      1 + 5 = 6

    < 2 + 2 = 4
      2 + 3 = 5
      2 + 4 = 6

    < 3 + 2 = 5
      3 + 3 = 6
      3 + 4 = 7

The less-than sign will have to appear in the first column, and the 
rest of the paragraph will have to be indented. Consecutive paragraphs
will be recognized and merged to become columns that will 
appear side-by-side on a single block. This, the previous example
will enable a block where three columns of text will appear, where 
there are four lines in the first column and three lines in other 
two columns.

For inline math, it is to be placed using backslashed-parentheses. For 
example, 

    The math of \(\sqrt{2}\) is 1.414

This formatting is very much similar to those seen on a LATEX document.
In addition, the display math syntax is also recognized by the use
of backslashed-brackets. 

    The math of \[\sqrt{2}\] is 1.414.

The display math can be mixed with rest of the text. The translated LATEX
and CONTEXT document will have no trouble showing display styled math
expression as they
both have intrinsic support
for this type of math markup. For HTML translation a
Span element is to be created to hold the math
expression and that is styled as

    "display:block;text-align:center" 
    
to allow this block to appear on its own paragraph. However
the display math style lacks the ability to include additional
formatting information such as splitting a long equation
into multiple segments and/or align each sub-segment with
the rest by their equal signs. In this case, another
block is designed to handle just that.

    $ a + b &= c + d \\
            &= e + f \\
            &= g

A block that starts with a dollar-sign will be recognized
as a MATH block that holds a math expresion very much like
a LATEX begin/end "equation*" block, with begin/end split inside.

    \begin{equation*}
    \begin{split}
    a + b &= c + d\\
          &= e + f\\
          &= g
    \end{split}
    \end{equation*}

However, if multiple MATH blocks occurs one after another, they
are combined so that when being translated into LATEX, they are
placed into a single "gather*" block.

    $ a + b &= c + d \\
            &= e + f \\
            &= g

    $ a + b &= c + d \\
            &= e + f \\
            &= g

The result of the LATEX translation.

    \begin{gather*}
    \begin{split}
    a + b & = c + d\\ 
    & = e + f\\ 
    & = g 
    \end{split}\\
    \begin{split}
    a + b & = c + d\\ 
    & = e + f\\ 
    & = g 
    \end{split}
    \end{gather*}

Another option is to use the QUAT block, which 
is a block that starts with a at-sign followed by a 
space and the word "Equation". 

    @ Equation
    
      a + b &= c + d \\
            &= e + f \\
            &= g

      a + b &= c + d \\
            &= e + f \\
            &= g

Note that all math expressions must be indented. However,
the syntax follows that of the previous MATH block, and that
multiply expression must be separated by at least one line.
The previous QUAT block is exactly equivalent to previous
two MATH blocks. However, the QUAT allows an equation to be
labeled and thus allow equation numbers to appear. To do that,
place a Ref phrase at the beginning of one of the equations,
such as the following.

    @ Equation
    
      &ref{eq:a}
      a + b &= c + d \\
            &= e + f \\
            &= g

      a + b &= c + d \\
            &= e + f \\
            &= g

This will be translated to LATEX as:

    \begin{gather}
    \begin{split}
    a + b & = c + d\\ 
    & = e + f\\ 
    & = g 
    \end{split}\label{eq:a}\\
    \begin{split}
    a + b & = c + d\\ 
    & = e + f\\ 
    & = g 
    \end{split}
    \end{gather}

Due to the limitation of the LATEX implementation, all equations
in a "gather" block will be numbered, besides the one that's
been attached the Label command. 

The @-block is functionally similar to that of a fenced block 
using triple-backquote, where it is designed to present a 
group of computer software codes, but nevertheless has the potential
to include other types of information as well. 
However, the @-block in NITRILE
is designed to also allow for a caption and a label to be included. 
In the following example a LATEX Figure will be created
with two images and a caption.

    @ Image &ref{fig:a}
      A tree and a frog

      &img{tree.png} A tree.
      &img{frog.png} A frog.

In the previous example a PICT block is to be created
where it will be translated to LATEX as a Figure environment,
with caption text "A tree and a frog", and a label of "fig:a".
As with the convention, the at-sign must appear at the first
column, followed by one or more spaces, and the word "Image",
case-insensitive. 

After the word "Image", the pattern of a Ref phrase is to be 
scanned---if found, it is assumed to describe a label
for the Figure block. The rest of the paragraph, 
will be treated as the
caption text for this Figure environment.

Besides the word "Equation" and "Image", there are
other type of @-blocks that can be specified. If 
the word "Framed" is to be specified, then an picture will
be created that would typeset the rest of the content
as fixed-width text, and with a border. 

    @ Framed

      p {
        margin:10mm;
        background-color:white;
      }

If a Ref label is included, then it will be treated as a Figure,
the same as the "Image" block, with optional caption.

If the word "Table" is to appear, then it will typeset a
LATEX tabular.

    @ Table

      Name   | Address
      -------|---------
      John   | 123 San St.
      Jane   | 123 Lindon St.

If a label is included, it will turn into a LATEX Table.
The official name for this block is TABR. Besides the
traditional way of expressing the content of the tabular,
where the content is arranged in a single line, and table
data separated by a vertical bar, it is possible in NITRILE
to express table contents using lines arranged vertically.
To do that, place triple-equal sign after the table.

    @ Table

      Name   | Address
      -------|---------
      John   | 123 San St.
      Jane   | 123 Lindon St.

      ===
      James
      123 Sand St.

      Justin
      123 Sunset St.
      ===

      Joe    | 123 Apple St.
      Jack   | 123 Evening St.

A triple-equal sign acts as the "mode switcher" that switches 
between a "row mode" and a "column mode". The "row mode" is the
traditional mode where each table data appear in a single line
separated by a vertical bar, where in "column mode" each line is 
to express a table data, and an empty line starts a new 
row.

Note that it is possible for a long table data text
to be split into multiple lines. If this is the case,
ensure that the continuation line does not start at the first
column. In the following example the table data "123 Sand St. and more"
has been split into two lines.

    @ Table

      Name   | Address
      -------|---------
      John   | 123 San St.
      Jane   | 123 Lindon St.

      ===
      James
      123 Sand St. and 
        more 

      Justin
      123 Sunset St.
      ===

It is important to ensure that for all contents after the first
@-paragraph, all lines starts at the same position. This ensures
that when in a "column mode", the lines that "falls short" is
to be recognized and treated as the continuation line for the
previous line.

There is also a "Longtable" block. It expects the same 
text as the "Table" block. However, it intends to create a
"xltabular" in LATEX, that will typeset a table that wil
appear across page boundaries. 

    @ Longtable

      Name   | Address
      -------|---------
      John   | 123 San St.
      Jane   | 123 Lindon St.

      ===
      James
      123 Sand St. and 
        more 

      Justin
      123 Sunset St.
      ===

The support for in terms of translating into LATEX is made
possible by the "xltabular" environment, which allows for
a caption and label to appear with the table, 
and that the table will be numbered following the same sequence
as that of the 
normal Table environment, which is a float that cannot hold
a table larger than the height of a page. However, the support
for it in terms of translating into CONTEXT is also made
possible because CONTEXT has a "placetable" command that 
accepts the "split" as one of its options which can be specified
such that it will place a "long" table that will split across
multiple pages.

There are two additional @-blocks 
that are named "CSV" and "DATA". The "CSV" 
block allows for presenting plain text "raw" data as
a long table, where each line represent a single row in
a table, and table cells are separated by commans. The "Data" 
block does the same thing except that table cells are separated
by one or more spaces.  

    @ CSV 

      123,134,1334
      345,123,1233
      123,567,8989

    @ Data

      123 134 1334
      345 123 1233
      123 567 8989

If the word is "Listing", then the rest of the content is treated
as code listing. For LATEX this will be translated into 
a begin/end lstlisting environment.

    @ Listing

      console.log()
      console.log()

If a Ref phrase is found then there is going to be
a caption and the listing will be numbered by the 
capability of the "lstlisting" command.

Another interesting block is the "Diagram" block, where
a group of line is used to describe a "vector diagram" 
that is translated into a Tikz picture envionment on LATEX.

    @ Diagram

      viewport 25 10
      unit 5
      draw (1,1)--(3,4)
      
In the prevous example, a begin/end "tikzpicture" environment
will be created when it is a LATEX translation, and optionally,
be converted into a Figure environment if a Ref label is 
also specified. For a CONTEXT translation a MetaFun drawing
block will be created, and possibliy turning into a 
"float" if the Ref phrase is specified.

There is also an interesting block called "Note", that does not
generate any translation by itself, but nevertheless 
serves a purpose to hold the content somewhere so that it can
be retrieved later by others when necessary.

Currently, the only place that takes advantage of this
is a Diagram command named "pic", which will retrieve the lines 
associated with a particular note and then treate them
as Diagram commands. 

    @ Note &ref{note1}

      draw (1,1)--(3,4)
      draw (2,2)--(5,6)
      
    @ Diagram
     
      viewport 25 10
      unit 5
      pic note1

In the previous example the Diagram is 
to have two "draw" commands literally 
"inserted" into the place where the "pic" command
runs.

In NITRILE, if an paragraph is to have its lines indented
by four spaces then it is considered a "sample block".
It will be translated the same as that of
a verbatim block---the
same "verbatim block" that is fenced by three or more 
backquotes. However, it is not intended. To set it
so that it is indented, set the "general.sample" to 1.

    general.sample=1

The amount of indentation is controlled by the "latex.step"
for LATEX translation and
"context.step" for CONTEXT translation. By default
it is '5mm'. 

    latex.step=5mm
    context.step=5mm

For HTML generation the Blockquote element is used to control
the indentation. Thus, use the CSS to style the Blockquote
element if a change of indentation is to be desired.

The other four fenced blocks: "verbatim block", "verse block",
"story block", and "tabular block" are indented only if
the paragraph itself is indented in the source. The QUOT
block is always indented.

Unlike normal Markdown, the appearances of triple-backquote
in a line by itself does not cause a new block to be started.
A triple-backquote with a normal paragraph is treated like
a double-backquote.






# Inline markups

  
Triple-grave-accent fenced block for verbatim code block:

    ```
    console.log('Hello world');
    ```

Double-grave-accent fenced block for inline block


    The code is ``console.log()``


Single-grave-accent fenced block for literal text


    The literal text is `\n`


Backslashed-parentheses for inline math


    The math is: \(\sqrt{2}\)


Backslashed-brackets for display math


    The math is: \[\sqrt{2}\]


The font style markups are follows:

    This word is &em{italic}.

    This word is &b{bold}.

    This word is &b{&em{both}}.

The inline image markup:

    The tree image: &img{tree.png}

The inline ruby markup

    The Japanese word: &ruby{日本・にほん}

The link markup

    The website is: &uri{www.yahoo.com}

The reference markup

    Please see &ref{fig:a}

Following inline markups that are not supported:

- The image markup: ``![Tree](tree.png)``
- The link markup: ``[Yahoo](www.yahoo.com)``
- Checkbox: ``* [x]``
- Emphasized text by underscores or asterisks: ``__bold__``, ``**bold**``, ``_italic_``, ``*italic*``.
