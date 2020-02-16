# LATEX Generation

## Configuration Parameters

Following are configuration options that are related to LATEX document
generation only.  It does not affects PREVIEW.

    latexEngine
    latexDocumentClass
    latexTwoColumnEnabled
    latexTwoSideEnabled
    latexA4PaperEnabled
    latexTableStyle
    latexAutoRubyEnabled
    latexDescriptionItemBullet
    latexStepMargin
    latexWrapSampleEnabled
    latexWrapSampleLength
    latexLeftMargin
    latexRightMargin
    latexTopMargin
    latexLeftMarginForTwoColumn
    latexRightMarginForTwoColumn
    latexTopMarginForTwoColumn

## Required LATEX Packages For LuaLaTeX

Following are required LATEX packages that must be included:

    \usepackage{microtype}
      A typesetting enhancement that improves the interspacing
      of words.

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
      Needed because Nitrile makes extensive use of the options
      of these environments provided by this package.

    \usepackage{mathtools}
    \usepackage{amsfonts}
    \usepackage{amssymb}
    \usepackage{unicode-math}
      Defines many math symbols.

    \usepackage{stmaryrd}
    \usepackage{wasysym}
    \usepackage{textcomp}
      Addition math symbols and text symbols such as \textrightarrow.
      Currently not utilized but will be in the future.

    \usepackage{changepage}
      Used to change the orientation of the page for example from
      portrait to landscape. Good for typesetting a wide table on a
      page by itself. The \adjustwidth command this package provides
      is also used extensively
      by Nitrile.

    \usepackage[unicode]{hyperref}
      Defines \href, \url, and others. Also allows for generating
      of PDF bookmarks.

    \usepackage{anyfontsize}
      Defines \selectfont{} used in typesetting of a verb block.

    \usepackage{tikz}
      For \begin{pgfpicture} and \begin{tikzpicture}

    \usepackage[normalem]{ulem}
      For \underline.

    \usepackage{listings}
      For \begin{lstlisting} used for typesetting code block.

    \usepackage{ltablex}
      Needed to make 'tabular' environment happy. If not include there
      are some unexplained compilation errors.ßßß

    \usepackage[export]{adjustbox}
      For \resizebox command that is used for typesetting verb block.
