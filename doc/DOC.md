# Nitrile Preview

Nitrile Preview package generates LATEX document from one or more Markdown (MD)
documents.

The goal of this package is simply, that is to allow you to quickly whip up a
LATEX file from a MD document. By default, a MD document will be converted to a
LATEX Article document. However, there is a provision that allows you to create
a LATEX Book document by combining multiple source MD documents.

# Makeups

Not all MD markups are recognized. Following are the one that are recognized.

- Headings using hash (#)
- List items using plus (+), hyphen (-), and asterisk (`*`).
- Triple-grave-accent fenced block for code block
- Triple-grave-accent fenced block for verbatim block
- Inline markup using double-underscore for bold, and single-underscore for
  italic, singe-grave-accent for inline code, and double-grave-accent for
  inline LATEX math.
- Link markup such as `[Google](www.google.com)`.

Following inline markups that are not supported:

- The image markup: `![Tree](tree.png)`

Follow paragraph styles are not recognized:

- The paragraph marked by the greater-than sign (>)
