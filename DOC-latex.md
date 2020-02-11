# LATEX Generation

## Configuration Parameters

Following are configuration options that are related to LATEX document
generation only.  It does not affects PREVIEW.

    latexlatexfamily
    latexdocumentclass
    latextwocolumn
    latexa4paper
    latextwoside
    latextablestyle
    latexstepmagin
    latexsampwrap
    latexsampmargin
    latexleftmargin
    latexrightmargin
    latextopmargin
    latexleftmarginTC
    latexrightmarginTC
    latextopmarginTC

## Required LATEX Packages

Following are required LATEX packages that must be included:

    \usepackage{luatexja-fontspec}
    \usepackage{luatexja-ruby}
      For allowing CJK characters to show up in LuaLaTeX.

    \usepackage{geometry}
      For setting left margins, right margins, and top margins
      of the generated PDF page.

    \usepackage{graphicx}
      For \includegraphics command.

    \usepackage{subcaption}
      For \begin{subfigure} environment.

    \usepackage{caption}
      For \caption*{...}

    \usepackage{enumitem}
      Improvements version of the classic \begin{itemize},
      \begin{enumerate}, and \begin{description} environments.

    \usepackage{mathtools}
    \usepackage{amsfonts}
    \usepackage{amssymb}
    \usepackage{unicode-math}
      Defines many math symbols.

    \usepackage{changepage}
      Deprecated.

    \usepackage{stmaryrd}
    \usepackage{wasysym}
    \usepackage{textcomp}
      Defines many symbols used in text mode such as \textrightarrow.

    \usepackage{xfrac}
      Defines \sfrac macro that used in math. (Deprecated)

    \usepackage[unicode]{hyperref}
      Defines \href, \url, and others. Also allows for generating
      of PDF bookmarks.

    \usepackage{anyfontsize}
      Defines \selectfont{}

    \usepackage{fancyvrb}
      Deprecated

    \usepackage{tikz}
      For \begin{pgfpicture} and \begin{tikzpicture}

    \usepackage[normalem]{ulem}
      For \underline.

    \usepackage{listings}
      For \begin{lstlisting}

    \usepackage{quoting}
      Deprecated.

    \usepackage{csquotes}
      Deprecated.

    \usepackage{booktabs}
      For \toprule, \midrule, and \bottomrule.

    \usepackage{xtab}
    \usepackage{ltablex}
      For \begin{xtabular} environment. It turns out that if
      *ltablex* package is not included there are some weired
      compilation errors from lualatex. Including this package
      seems to make it goes away.

    \usepackage{xifthen}
      For \ifthenelse command.
