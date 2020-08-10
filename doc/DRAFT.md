
## Document structure

A Nitrile document uses the extension of .md, same as that of a markdown document because they share some formatting syntax.

To comprise a document, paragraphs are detected. A paragraph is defined as a group lines with no empty lines between them.

~~~
Tutorial

# Example 1

In this example we will cover some basics of
HTML
and CSS...

# Example 2

In this example we will cover more topics regarding
HTML and CSS...
~~~

In the previous example a Nitrile document consists of five paragraphs. Each paragraph is also called a "block" among other blocks that surrounds it.

The text of each block is always checked and matched with some known patterns and will be determined to be of a different kind of blocks if it has found to have matched to one of the patterns.

For example, a single-number-sign at the first line of a paragraph expresses a "sectioning block":

~~~
# Example 1
~~~

When generating a LATEX ARTICLE document, a sectioning block could a become a block that is marked with `\section{}` command, essentially turning it into a sectioning header.

Similarly, a double-number-sign block will become a `\subsection{}` and a triple-number-sign block will become a `subsubsection{}`.

~~~
# section

## subsection

### subsubsection
~~~

In the previous example the three blocks are known as HDG1, HDG2, and HDG3. The pattern here is that the number-signs appear at the beginning of the first line of the paragraph. This is a known pattern in Nitrile document that we can use to designate a paragraph as the name of a sectioning header.

A paragraph that has not matched to a known pattern is known as a "default block", with no specific name. A default block is become a normal paragraph that typically appears between a pair of `\begin{flushleft}` and `\end{flushleft}` in a generated LATEX document:

~~~
\begin{flushleft}
In this example we will cover some basics of
HTML
and CSS...
\end{flushleft}
~~~

A default block that is also the very first block of the document is to be treated as the "header block". There can only be at most one header block for the entire document and the header block is always the first block of the document.

The header block is to be treated differently depending on the class of the LATEX document we are generating. When generating a LATEX ARTICLE the header block, when detected, is to have its content become the title of the article document. For BOOK and REPORT a header block of a sub-document is to become a chapter, a section, a subsection, or a subsubsection depending on the placement of this sub-document within the %!BOOK or %!REPORT block.

## Verbatim blocks

Aside from the header block, sectioning blocks, and default blocks, Nitrile also defines other types of blocks. For example, following is a "verbatim block".

```
~~~
#include <stdio>
main(int argc, char **argv) {
  printf("hello world!\n");
}
~~~
```

In either of these case, triple-tilda lines are considered "fences", in which case they are used to "fence in" a block that might contain blank lines. The fences themselves are not part of the contents and will not be appear in the translated LATEX document.

The verbatim block and other blocks that require the use of fences are called "fenced blocks".

For a verbatim block the LATEX translation is to place the source text line-by-line in the LATEX document and surround them with `\begin{Verbatim}` and `\end{Verbatim}` environment. This environment requires the use of the fancyvrb package.

```
\usepackage{fancyvrb}
```

The translated LATEX document might look like the following for the previous example.

```
\begin{Verbatim}
#include <stdio>
main(int argc, char **argv) {
  printf("hello world!\n");
}
\end{Verbatim}
```

A verbatim block is also known as a VERB block.

## Code blocks

A "code block" is identified between a pair of triple-tilde fences:

~~~
```
var greeting = 'hello world';
console.log(greeting);
```
~~~

Unlike a verbatim block, a code block does not rely on `\begin{Verbatim}` environment to typeset a paragraph of lines of texts, but instead, it uses the `\mbox` command to ensure that each line of the paragraph is in its own line, followed by adding a double-slashes at the end. It also uses the `\ttfamily` command to ensure a typewriter font, and ensures that space characters in a line are each replaced with a tilde character which expresses a non-breakable space in LATEX.

The generated LATEX translation looks like the following:

~~~
\begin{flushleft}
\mbox{\ttfamily{}var~greeting~=~'hello~world';}\\
\mbox{\ttfamily{}console.log(greeting);}
\end{flushleft}
~~~

The look of a code block is similar to that of a verbatim block in most cases, but it has an added advantage that it does not have the limitation of a verbatim block such that the line `\end{Verbatim}` cannot be part of the content text. This type of block is also know as CODE block.

## Verse blocks

A "verse block" is the one that is always fenced by a pair of triple-hyphen fences.

```
---
Whose woods these are I think I know.   
His house is in the village though;   
He will not see me stopping here   
To watch his woods fill up with snow.
---
```

A verse block is to be style by `\begin{verse}` and `\end{verse}`.

```
\begin{verse}
Whose woods these are I think I know.   
His house is in the village though;   
He will not see me stopping here   
To watch his woods fill up with snow.
\begin{verse}
```

A verse block is also know as a VRSE block.

## A tabular block

A tabular block is used to construct a tabular. On LATEX it will be translated using the `\begin{xtabular}` and `\end{xtabular}` environment. The block is fenced by a pair of triple-equal-sign fences.

```
===
mpg     cyl    disp   hp     drat
21      6      160    110    3.9
21      6      160    110    3.9
22.8    4      108    93     3.85
21.4    6      258    110    3.08
18.7    8      360    175    3.15
18.1    6      225    105    2.76
===
```

Each line is to express the entire row of tabular. Each cell is separated by three or more spaces. The generated LATEX document might looks like:

```
\begin{xtabular}{|l|l|l|l|l|}
\hline
mpg & cyl & disp & hp & drat \\
\hline
21 & 6 & 160 & 110 & 3.9 \\
\hline
21 & 6 & 160 & 110 & 3.9 \\
\hline
22.8 & 4 & 108 & 93 & 3.85 \\
\hline
21.4 & 6 & 258 & 110 & 3.08 \\
\hline
18.7 & 8 & 360 & 175 & 3.15 \\
\hline
18.1 & 6 & 225 & 105 & 2.76 \\
\hline
\end{xtabular}
```

A tabular block is also known as a TABB block.

## Quote blocks

A "quote block" is used to designate one or more paragraphs as "blockquote". It is a fenced block fenced by triple-quotation-marks.

```
"""
It's not how much you have that makes people look up to you, it’s who you are. - Elvis Presley
"""
```

It will be styled by `\begin{displayquote}` and `\end{displayquote}` environment, which requires the inclusion of "csquotes" package.

```
\usepackage{csquotes}
```

The previous example will likely be translated into a LATEX document such as following:

```
\begin{displayquote}
It's not how much you have that makes people look up to you, it’s who you are. - Elvis Presley
\end{displayquote}
```

A quote block is also known as a QUOT block.

## A definition list block

A "definition list" block is used to house a list of terms and corresponding definitions. Definition lists are typically formatted with the term on the left with the definition following on the right or on the next line.

```
<<<
Apple
  Great fruit
  And this also good fruit
Pear
  Great fruit
<<<
```

The likely translation of the previous block will be the following:

```
\begin{flushleft}
\begin{description}[nosep,font=\ttfamily]
\item[Apple] \mbox{}\\
Great fruit And this also good fruit
\item[Pear] \mbox{}\\
Great fruit
\end{description}
\end{flushleft}
```

The use of the `\begin{description}` and `\end{description}` environment with the options of 'nosep' and 'font' requires the inclusion of the 'paralist' package.

```
\usepackage{paralist}
```

A definition list block is also know as a TERM block.

## A picture block

A picture block is to house one or more pictures, typically consists of the specification of one or more external image files.

```
///
image [width:5cm] (tree.png)
image [width:5cm] (fish.png)
///
```

This will be translated into a LATEX document as the following:

```
\begin{flushleft}
\includegraphics[width=5cm]{tree.png}
\includegraphics[width=5cm]{fish.png}
\end{flushleft}
```

This block is to be started with a pair of fences that is triple-slash. Each line of this block is scanned and if the line starts with a keyword "image", then the rest of the line is to be scanned for the presence of styles as well as the source files of the image. The styles are to be placed inside a pair of square brackets in much the same form as that of a CSS style attribute value. The source image files are to be placed inside a pair of parentheses. If more than one files are specified then one of them is selected based on their perceived quality. For example, a PDF file is preferred over a PNG file, etc.

A picture block is also known as a PICT block.

If you insert spaces between two 'image' lines, then these spaces will be carried over and inserted between the `\includegraphics` lines. In this case LATEX will treated as if you would like to insert a manual line break between the two images, and will arrange for the two images to be on top of another, even though it is still possible for them to be laid side-by-side. Thus, for the source Nitrile document:


## A packed list block

A "packed list block" is a block that packs lists that can be nested.

```
- Apple
  - Green
  - Red
- Pear
  - Round
  - Long
```

This will likely be translated into the following LATEX document.

```
\begin{flushleft}
\begin{compactitem}
\item Apple
\begin{compactitem}
\item Green
\item Red
\begin{compactitem}
\item Round
\item Lon
\end{compactitem}
\end{compactitem}
\end{flushleft}
```

A packed list block is detected by the first line that starts with a hyphen, an asterisk, or a number followed by a period such as "1.". A hyphen or an asterisk expresses the start of a unordered list, a number expresses the start of an ordered list.

Nested lists can be specified. A new nested list is detected if the line starts with a hyphen, an asterisk, or a number-and-period and it is intended deeper than the indent level of the current list. If a number-and-period is detected then that number is used as the numerical identifier of that list item. Following is an example involving using number-and-period list items.

```
- Apple
  1. Green
  2. Red
- Pear
  3. Round
  4. Lon
```

```
\begin{flushleft}
\begin{compactitem}
\item Apple
\begin{compactenum}
\item[1.] Green
\item[2.] Red
\end{compactenum}
\item Pear
\begin{compactenum}
\item[3.] Round
\item[4.] Lon
\end{compactenum}
\end{compactitem}
\end{flushleft}
```

Note that the 'compactitem' and 'compactenum' environments are provided by the 'enumitem' package which must be included.

```
\usepackage{enumitem}
```

In addition, for an unordered list item that is marked by a asterisk, the content of the list item is scanned and the leading text up until the first appearance of a colon or a hyphen is considered a data term, and will be styled using typewriter font. Thus,

~~~
* Apple : This is a fruit.
* Pear : This is a fruit.
~~~

For this list, the word Apple and Pear will be styled using typewriter font, while the following will not.

~~~
- Apple : This is a fruit.
- Pear : This is a fruit.
~~~

However, for asterisk bullet list items, if the pattern just mentioned isn't found then nothing is going to happen, and the entire text is treated just like the a hyphen bullet list item.

A packed list block is also know as a PLST block.

## A description block

A "description block" is the one that starts with one or more at-signs at the beginning of the first line of a paragraph. It is to be followed with a space and then more texts. The texts of the rest of the first line is the term to be described. The second line of the paragraph and the line afterwards are treated as the description for this term.

```
+ Apple
  A great fruit.
```

Each description block is designed to provide description text for one or more terms, where consecutive description blocks can be arranged one after another, and white spaces will be allocated between each block.

If two or more terms are to be placed one following another they are to be recognized, for as long as they both start at the left-most of the column with each line having the exact same number of leading at-signs.

~~~
+ Apple
+ Pear
+ Banana
  These are all great fruits.
~~~

The LATEX document translation for a DESC block is done with a `\begin{description}` and `\end{description}` environment that allow for multiple `\item` commands and a single description text. This environment requires the presence of the "paralist" package. The translation for the previous example is shown here.

```
\begin{description}[leftmargin=0.5cm,font=\normalfont\ttfamily\bfseries]
\item[Apple]
\item[Pear]
\item[Banana]
\mbox{}\\
These are all great fruits.
\end{description}
```

Here, the description text will be having a left margin of 0.5cm which is the distance between the left edge of the first character of the term and the first character of the description text.

The margin is calculated by counting the number of blank spaces of the first line of the description text and then multiple that number with a step distance of 0.25cm to compute the total distance of the left margin.  In the previous example where two spaces are detected,  the left margin is computed to be at 0.5cm.

# A primary block

A "primary block" is used to generate a LATEX `\paragraph` paragraph.

```
[ Apple ] This is a wonderful fruit that is full of
flavor and nutrition.
```

This will be translated to LATEX as:

```
\paragraph{Apple}
This is a wonderful fruit that is full
of flavor and nutrition.
```

The leading text must be placed inside a pair of brackets,
and there must be at least one space after the left bracket and a space before the right bracket. There must also be more text following the right bracket where they are separated by at least one space.

The primary block is also know as PRIM block.

# A secondary block

A "secondary block" is used to generate a LATEX `\subparagraph` paragraph.

```
[[ Apple ]] This is a wonderful fruit that is full of
flavor and nutrition.
```

This will be translated to LATEX as:

```
\subparagraph{Apple}
This is a wonderful fruit that is full
of flavor and nutrition.
```

## Inline text styling and phrase markup

Texts can have its own inline markups that allows for styling some portion of a text differently than its surrounding text. Following text stylings are supported.

- Italic text, using single-underscore: `_italic_`
- Bold text, using double-underscore: `__bold__`
- Typewriter text, using single backquote, or grave accent. `` `my code` ``.

Phrases markups are those that creates new entities that are not considered plain texts. Following are phrase markups supported by Nitrile:

- RUBY : Japanese style phonetic annotation of a Han character;
- URI : styling of a long URI that typically will need to be split into multiple lines down at any position;
- Cross references : reference to a sectional heading in the current document or another sub-document;
- Unicode character literal : inserting of a Unicode character simply by listing its numerical code point value;

Inline phrase and style processing is not process for the following areas:

- Document title
- Sectioning blocks
- Description block terms
- Definition block terms
- Primary block terms
- Secondary block terms

## Text styling

Typewriter texts are styled using `\texttt{}` command. The italic text is styled using `\emph{}` command, and the bold text is styled using `\textbf{}` command.

The opening underscores and grave accents that are to start styling will have to start after a blank space, or at the beginning of a line. They will not be recognized if they are surrounded by non-blank characters. The ending underscore and grave accents do not this restriction, but only to have to match the opening ones in the number of characters exactly in order to be considered one.

Following is how you would be able to include a grave accent in your inline text.

~~~
The grave accent ``` ` ``` is used to quote a piece of
compute sample code.
~~~

## RUBY phrase markup

A RUBY markup such as ``` [私](^わたし) ``` would have generated the RUBY markup for LATEX as:

```
@ruby{私}{わたし}
```

### URI phrase markup

A URI markup is to designate a long URI. For URI markup the syntax is follows:

```
The [Yahoo!](www.yahoo.com) site shows this info.
```

or 

```
The [](www.yahoo.com) site shows this info.
```

The syntax of this link is similar to markdown link syntax except that the text that hides the link can be empty, in which case the link itself is shown. 

However, when Nitrile generates the LATEX translation it does not attempt to hide the link. Instead it will show it after the text in the bracket and then place the link inside a pair parentheses immediately following the previous text. In the second situation the entire link is shown without parentheses. Thus, for the first translation the LATEX would have looked like:

~~~
The Yahoo!(\url{www.yahoo.com}) site shows this info.
~~~

And the second example would have generated the following LATEX:

~~~
The \url{www.yahoo.com} site shows this info.
~~~


## Unicode phrase markup

A Unicode character literal markup is to physically insert a Unicode character into the document by specify its numeric code point in hexadecimal form. For example, the markup of `[&](U+4f60)` would have insert a CJK character "你" into the generated LATEX document.

## Cross reference phrase markup

A cross reference markup allows you to refer to the numeric number of a chapter, section, subsection, and subsubsection. For example, a cross reference markup such as `[[#tutorial:15#]]` is to generate a LATEX `@ref{}` command such as the following:

~~~
Please see section [[#tutorial:15#]].
~~~

The translated LATEX document would look like:

~~~
Please see section @ref{tutorial:15}
~~~

See the following section for working with cross references in general.

## Working with cross references

In Latex a label is a short name that refer to a specific heading such as a chapter, section, subsection, etc. It also refers to a float such as a figure, table, or listing.

In Nitrile all headings and floats are assigned a label. So far the only float that is supported is 'figure'.

The default form of the labels are like 'tutorial:1', 'tutorial:2', etc., where the name 'tutorial' is considered the "base" which is basically a text extracted from name of the source Nitrile document, followed by a single colon, and followed by increasing whole numbers. In the following example, the source document is named 'tutorial.md' and following is its contents:

~~~
Tutorial

# Example 1

...

# Example 2

...
~~~

If this source document is to become an LATEX article, then it will look like this.

~~~
\documentclass{article}
...
\usepackage{...}
...
\title{Tutorial}
\begin{document}
\maketitle
\section{Example 1}\label{tutorial:2}
...
\section{Example 2}\label{tutorial:10}
...
~~~

Only alphanumeric and hyphen characters are to be used to construct a "base" such as the word "tutorial". So in case your file name contains other characters then some of them will be disregarded.

The number following the base is called "local", which is a label that uniquely identify a block within the same document. By default the whole numbers are used which increase everything a new block is encountered. The number might not appear to be consecutive for headings because these numbers increase whenever a new block is increase including non-heading blocks.

However, for a LATEX book document generation the label for the very first heading of a sub-document is always only the "base" portion. For example, when 'tutorial.md' is used as a sub-document within a %!BOOK declaration such as following:

~~~
%!BOOK
: tutorial.md
~~~

The first paragraph that says "Tutorial" is to become a chapter and its label is `\label{tutorial}`.

~~~
\chapter{Tutorial}\label{tutorial}
...
~~~

This will continue to be true if 'tutorial.md' is to become a section. In the following example the document 'tutorial.md' is to become a section inside a chapter that is the document of 'elementary.md':

~~~
%!BOOK
: elementary.md
:: tutorial.md
~~~

In this case a `\section{}` is to be created for the first paragraph of the "tutorial.md" file and its label is `\label{tutorial}` as well.

~~~
\chapter{Elementary}\label{elementary}
...
\section{Tutorial}\label{tutorial}
...
\subsection{Example 1}\label{tutorial:2}
...
\subsection{Example 2}\label{tutorial:10}
...
~~~

This convention is to ensure that the label is always unique within the same document and across multiple documents when combine. You can also override the auto-generated numerical number with a customized id, by placing a notation such as `[:ex1]` immediately at the next line following a heading line such as:

~~~
# Example 1
[:ex1]

...
~~~

Since only the first line is used for heading the second line is scanned to detect any appearances of a id. In this case a customized id is detected and the label is to be reconstructed using the customized id and new label becomes `\label{tutorial:ex1}`.

~~~
\section{Example 1}\label{tutorial:ex1}
...
\section{Example 2}\label{tutorial:10}
...
~~~

When referring to a section you will following the notation such as `[^/tutorial:ex1]` to refer to section of "Example 1".  

~~~
# Example 1
[:ex1]

...

# Example 2

Please see example 1 at section [^/tutorial:ex1].
~~~

The notation of `[^/tutorial:ex1]` will become `@ref{tutorial:ex1}` in the translated LATEX document. As a shortcut, if you are referring to a section of the same document then you can omit the base part to just write it as `[^/:ex1]`.

Note that the entire notation must be a left/right brackets with a caret immediately following the left bracket which is then immediately followed by a slash and then the entire label. There should not be any blank spaces within the brackets.

Use `[^/tutorial]` to refer to the header that is "Tutorial" in 'tutorial.md' document. There is no provision to specify a customized id for it.

The preview shows the label text that is attached to the chapter, section, subsection, subsection and a figure caption.

## The figure directives

The directives are some paragraphs that provide special instruction for the block that immediately follows it. For a paragraph to be recognized as a directive the first line must be without any leading spaces, and must start with a period, followed by only words.

For a figure directive that is ".figure", when placed in front of a PICT block, it instructs that the following PICT block should turn into a figure.

```
.figure
A figure of tree and fish.

///
image [width:5cm] (tree.png)
image [width:5cm] (fish.png)
///
```

A figure block is named FIGE. You could also attach a customized label to a figure, in which case the LATEX `\label` command is to be generated and placed underneath the `\begin{figure}` command. The label, if to be placed, must be placed at the line immediately below the '.figure' line, and must be by itself as the only element of that line.

```
.figure
[:tree-and-fish]
A figure of tree and fish.
```

Like PICT, if spaces are inserted between 'image' lines then they will appear in the generated LATEX document as well, resulting in manual break between images. In the following example the two sub-figures will be manually split and placed one on top of another.

```
///
image [width:5cm] (tree.png)

image [width:5cm] (fish.png)
///
```

## The listing directive

For a ".listing" directive that is placed in front of a CODE block, it is to generate a `begin{lstlisting}` environment that is to treat the lines of a CODE block as source source code, and will go ahead try to place these lines between the `begin{lstlisting}` and `end{lstlisting}`. In addition, it adds the 'caption=' and 'label=' options that is to set the caption of the listing as well as the label for the `begin{lstlisting}` environment.

~~~
.listing
Example JavaScript Code

```
console.log('hello world!');
```
~~~

## Adding additional left margin of a block

Following blocks will be indented based the indent of the first line of the source document.

- Verbatim blocks (VERB)
- Code blocks (CODE)
- Verse blocks (VRSE)
- Tabular blocks (TABB)
- Quotation blocks (QUOT)
- Definition list blocks (TERM)
- Picture blocks (PICT)
- Packed list blocks (PLST)
- default paragraph blocks

The rule is that for each leading space character that is detected of the first line of the paragraph, the left margin is increased by 0.25cm. Thus, for example, if the first line of a default paragraph starts at column 3 then then the entire paragraph has a left margin of 0.5cm.

For fenced blocks that are VERB, CODE, VRSE, TABB, QUOT, TERM, PICT, the left margin is determined by the number of leading space characters of the first fence line.

A PLST block is treated similarly as that of a default paragraph such that the number of leading space characters of the first line is used to determine the left margin of the entire block.

The left margin of a paragraph such as 0.5cm is enforced by placing the entire paragraph under the `\begin{adjustwidth}{0.5cm}{}` and `end{adjustwidth}` environment which requires the LATEX package of "changepage":

```
\usepackage{changepage}
```

Thus, to add a left margin of 0.5cm to a default paragraph a LATEX translation might look like the following:

```
~~~
\begin{flushleft}
\begin{adjustwidth}{0.5cm}{}
In this example we will cover some basics of
HTML
and CSS...
\end{adjustwidth}
\end{flushleft}
~~~
```

The `\begin{adjustwidth}` environment works well with `\begin{flushleft}`. However, for adding a left margin to a `begin{Verbatim}` environment the 'xleftmargin=' option of the "Verbatim" environment is to be used instead:

```
\begin{Verbatim}[xleftmargin=0.5cm]
#include <stdio>
main(int argc, char **argv) {
  printf("hello world!\n");
}
\end{Verbatim}
```

## The %!BOOK block

The %!BOOK block refers to a special block that is to typeset a multi-chapter LATEX document. The document class is set to "book".

You would start a %!BOOK block by placing "%!BOOK" at the first line of your Nitrile document with no leading spaces:

```
%!BOOK
title=My Book
creator=John Smith; Jane Johnson
: chapter1.md
: chapter2.md
: chapter3.md
```

If "%!BOOK" is detected as the first line of the document, the entire document is treated as a single %!BOOK block.

After the first line, you can configure the book by placing one or more configuration entries. For example the "title=" entry would specify the title of the book and the "creator=" entry would express the names of the author, separated by semicolons.

If a line starts with a colon, and followed by one or more spaces, then whatever comes after that is being treated as the name of a file that is one of the sub-documents to comprise the content of the BOOK. In particular, the header block of that sub-document is to become the chapter and each of its sectioning blocks is to become a section, a subsection, a subsubsection.

If a double-colon is detected instead of a single-colon, then whatever follows is the name of a sub-document whose header block is to become a section to a previous chapter. And as a result, its HDG1 will become a subsection, and its HDG2 will become a subsubsection.

```
%!BOOK
title=My Book
creator=John Smith; Jane Johnson
: chapter1.md
:: section11.md
:: section12.md
: chapter2.md
:: section21.md
::: section211.md
: chapter3.md
```

## The context menus

Following is the contents of the context menus of the Nitrile Preview:

- Jump to Editor
- Open Linked File
- Copy Selected Text
- Copy Source HTML
- Export as a HTML Document...
- Export as a LuaLaTeX Article...
- Export as a LuaLaTeX Chapter...
- Export as a LuaLaTeX Book...

"Jump to Editor" entry is to jump to the original text editor that has supplied the preview text, and will also highlight the range of lines corresponds to the current pointer position.

"Open Linked File" entry is only applicable when showing a %!BOOK block, in which case the preview would have made each sub-document a hyperlink. This entry allows you to open the hyperlinked sub-document in a new editor window or show it if it has already been opened.

"Copy Selected Text" entry is to copy selected text (if any) to the system clipboard so that it can be pasted into other window, or to other applications.

"Copy Source HTML" entry is to copy the HTML source that comprises the preview. Note that no CSS or HTML header is copied.

"Export as a HTML Document..." entry prompts for saving of the HTML source to a new text file. HTML header and CSS styles used by the preview window will be included as part of the text file.

"Export as a LuaLaTeX Article" entry prompts for translating the previewed Nitrile document to a new LuaLaTeX article document and save it under a new file name.

"Export as a LuaLaTeX Chapter" entry is similar to "Export as a LuaLaTeX Article" except for that the current previewed Nitrile document is translated as a LATEX chapter and the saved file does not added LATEX header. This is useful for including the saved file with `\include{}` or `\input{}`.

"Export as a LuaLaTeX Book" entry is to work with a %!BOOK block to create a single large LATEX document that encompasses the contents of all sub-documents included in the block.

## The four-space indented verbatim block

If you would prefer to have a paragraph that is indented by four or more spaces to be treated as if it were a verbatim block then you need to enable the "verbatim" flag in your document.

~~~
Tutorial

%! verbatim

# Introduction

...
~~~

Any line that starts with `%!` is treated as a designation of a flag that serves to instruct Nitrile to process the rest of the document a little differently then usually. Thinking of it as a configuration or setting parameter. So far the only defined flag is "verbatim".

## TODO

- Only certain ranges of CJK, Hanagina, Katakana, and Korean characters in Unicode range is known to have mapped to fonts. Other Unicode characters are not mapped. Need to enlarge the current font map coverage to cover more Unicode character ranges including the character U+25BA (►), which is currently not be able to show up in a LATEX document because the default font does not have a glyph for it.

- Need to be able to construct multi-part document that uses LATEX \part command.

- Add configuration options for settings such as "update on save only", "step margin", "use indent for default paragraphs", and others.

## Known problems

- A Nitrile Preview window will be saved but during refreshing it does not pick up the CSS style. However, after toggle to invisible and back to visible again the CSS style will be picked up --- need to figure out why.



