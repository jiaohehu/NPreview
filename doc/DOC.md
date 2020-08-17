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
