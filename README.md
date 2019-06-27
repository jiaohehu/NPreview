# nitrile-preview package

A short description of your package.

![A screenshot of your package](https://f.cloud.github.com/assets/69169/2290250/c35d867a-a017-11e3-86be-cd7c5bf3ff9b.gif)





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
