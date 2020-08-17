# NITRILE markups

Nitrile Preview package generates LATEX document from one or more Markdown (MD)
documents.

The goal of this package is simply, that is to allow you to quickly whip up a
LATEX file a MD document. By default, a MD document will be converted to a
LATEX Article document. However, there is a provision that allows you to create
a LATEX Book document by combining multiple source MD documents.

# Block-level Makeups

Headings using hash

    # Heading

List items using plus (``+``), hyphen (``-``), and asterisk (``*``)

    + Apple
    - Apple
    * Apple

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
