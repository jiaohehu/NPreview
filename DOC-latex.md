# LATEX Generation

## Configuration Parameters

Following are configuration options that are related to LATEX document
generation only.  It does not affects PREVIEW.

``` tabbing

    latexTitle                       The title 
    latexAuthor                      The author
    latexEngine                      LATEX engine, either pdflatex or lualatex
    latexIsArticle                   Whether it is a article (no chapters)
    latexDocumentClass               Custom document class
    latexTwoColumnEnabled            Whether twocolumn option should benabled
    latexTwoSideEnabled              Whethter twoside option should be enabled
    latexA4PaperEnabled              Whether A4 paper should be enabled
    latexTableStyle                  Table style for 'tabular','tabulary','tabularx'
    latexAutoRubyEnabled             Auto ruby enabled for SAMP block
    latexDescriptionItemBullet       Customized bullet for DESC
    latexStepMargin                  Left margin for all indented text and list items
    latexSampleSize                  Font size for SAMP block
    latexSampleMargin                Left margin for SAMP block
    latexSampleWrap                  Set to non-zero for wrapping lines of SAMP block
    latexLeftMargin                  Left margin for the entire document
    latexRightMargin                 Right margin for the entire document
    latexTopMargin                   Top margin for the entire document
    latexLeftMarginForTwoColumn      Left margin for the entire document when in twocolumn mode
    latexRightMarginForTwoColumn     Right margin for the entire document when in twocolumn mode
    latexTopMarginForTwoColumn       Top margin for the entire document when in twocolumn mode

```


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
    \usepackage{stmaryrd}
    \usepackage{wasysym}
    \usepackage{textcomp}
      AMS math and addition math symbols and text symbols such as
      \textrightarrow.  Currently not utilized but will be in the future.

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

    \usepackage{luamplib}
      For \begin{mplibcode}

    \usepackage[normalem]{ulem}
      For \underline.

    \usepackage{listings}
      For \begin{lstlisting} used for typesetting code block.

    \usepackage{ltablex}
      Needed to make 'tabular' environment happy. If not include there
      are some unexplained compilation errors.ßßß

    \usepackage{tabularx}
      For \begin{tabularx} 

    \usepackage{tabulary}
      For \begin{tabulary} 

    \usepackage{tabu}
      For \begin{longtabu} 

    \usepackage{booktabs}
      For \toprule, \midrule, and \bottomrule

    \usepackage{xcolor}
      Needed to use color such as \xcolor{...}

    \usepackage[export]{adjustbox}
      For \resizebox command that is used for typesetting verb block.

# Select a different font size

  \documentclass{article}
  \usepackage{anyfontsize}
  \begin{document}
  {\fontsize{1cm}{1cm}\selectfont First test : I need to 
    put some text here.}
  \bigskip
  {\fontsize{1cm}{2cm}\selectfont Second test : I need to 
    put some text here --- does it work?}
  \end{document}

  It requires the package "anyfontsize", and it also works
  if this command is used with the "label" command of MP.