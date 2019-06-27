# nitrile-preview package

A short description of your package.

![A screenshot of your package](https://f.cloud.github.com/assets/69169/2290250/c35d867a-a017-11e3-86be-cd7c5bf3ff9b.gif)


## Document structure

A Nitrile document uses the extension of .md, same as the markdown document.

Within the document, paragraphs are separated by spaces. The first paragraph is usually treated as a main heading.

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

All lines with no blank lines will be considered part of a paragraph. A paragraph is checked for certain markup patterns and will be determined to be a different "block type" depending on the pattern detected. For example, a leading number-sign at the first line of a paragraph expresses a "sectioning heading block":

~~~
# Example 1
~~~

When generating a LATEX ARTICLE document, these blocks are to become `\section{}` blocks. Similarly, a double-number-sign block will become a `\subsection{}` and a triple-number-sign block will become a `subsubsection{}`.

~~~
# section

## subsection

### subsubsection
~~~

A normal paragraph without any specific block pattern detected is a "default block". A default block is become a normal paragraph that typically appears between a pair of `\begin{flushleft}` and `\end{flushleft}`.

~~~
\begin{flushleft}
In this example we will cover some basics of
HTML
and CSS...
\end{flushleft}
~~~

A default block that is the very first block of the document is to be treated as the "main heading block". There can only be at most one main heading block for the entire document. The main heading block will be treated differently depending on the class of the LATEX document we are generating. For generating a LATEX ARTICLE the main heading block, if present, is to become the title of the document. For BOOK and REPORT a main heading of a sub-document is to become a chapter, a section, a subsection, or a subsubsection depending on the placement of this sub-document within the %!BOOK or %!REPORT block.

## Verbatim blocks

Aside from a main heading block, sectioning heading blocks, or default blocks that we have seen, Nitrile also defines other types of blocks. For example, following is a "verbatim block".

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

In either of these case, triple-tilda and/or triple-grave-accent lines are considered "fences", in which case they are used to "fence in" a block that might contain blank lines. The verbatim block and other blocks that require the use of fences are called "fenced blocks".

For LATEX translation it will be styled using `\begin{Verbatim}` and `\end{Verbatim}` environment. This environment requires the use of the fancyvrb package.

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
