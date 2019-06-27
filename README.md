# nitrile-preview package

A short description of your package.

![A screenshot of your package](https://f.cloud.github.com/assets/69169/2290250/c35d867a-a017-11e3-86be-cd7c5bf3ff9b.gif)


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

A default block that is also the very first block of the document is to be treated as the "main heading block". There can only be at most one main heading block for the entire document and the main heading block is always the first block of the document.

The main heading block is to be treated differently depending on the class of the LATEX document we are generating. When generating a LATEX ARTICLE the main heading block, when detected, is to have its content become the title of the article document. For BOOK and REPORT a main heading block of a sub-document is to become a chapter, a section, a subsection, or a subsubsection depending on the placement of this sub-document within the %!BOOK or %!REPORT block.

## Verbatim blocks

Aside from the main heading block, sectioning blocks, and default blocks, Nitrile also defines other types of blocks. For example, following is a "verbatim block".

```
~~~
#include <stdio>
main(int argc, char **argv) {
  printf("hello world!\n");
}
~~~
```

A verbatim block is identified between a pair of triple-tilda or triple-grave-accent lines:

~~~
```
#include <stdio>
main(int argc, char **argv) {
  printf("hello world!\n");
}
```
~~~

In either of these case, triple-tilda and/or triple-grave-accent lines are considered "fences", in which case they are used to "fence in" a block that might contain blank lines. The fences themselves are not part of the contents and will not be appear in the translated LATEX document.

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

## Cross references

In Latex a label is a short name that refer to a specific heading such as a
chapter, section, subsection, etc. It also refers to a float such as a figure, table, or listing.

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

The notation of `[^/tutorial:ex1]` will become `\ref{tutorial:ex1}` in the translated LATEX document. As a shortcut, if you are referring to a section of the same document then you can omit the base part to just write it as `[^/:ex1]`.

Note that the entire notation must be a left/right brackets with a caret immediately following the left bracket which is then immediately followed by a slash and then the entire label. There should not be any blank spaces within the brackets.

Use `[^/tutorial]` to refer to the main heading that is "Tutorial" in 'tutorial.md' document. There is no provision to specify a customized id for it.
