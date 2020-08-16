# Nitrile Preview

Nitrile Preview package generates LATEX document from one or more Markdown (MD)
documents.

The goal of this package is simply, that is to allow you to quickly whip up a
LATEX file a MD document. By default, a MD document will be converted to a
LATEX Article document. However, there is a provision that allows you to create
a LATEX Book document by combining multiple source MD documents.

# Block-level Makeups

Not all MD markups are recognized. Following are the one that are recognized.

Headings using hash


    # Heading


List items using plus (``+``), hyphen (``-``), and asterisk (``*``)


    + Apple
    - Apple
    * Apple



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
