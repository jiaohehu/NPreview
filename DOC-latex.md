# LATEX translation


# Required LATEX Packages For LuaLaTeX

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
      For \resizebox command that is used for typesetting VERB block.

    \usepackage{float}
      For defining customized floats.

    \usepackage{xfrac}
      For math \sfrac commands which provides side-by-side fraction.

# Setting the relative font size

Font sizes can be set for the following contents:

  %!LATEX.fscode = small
  %!LATEX.fstabular = small
  %!LATEX.fslisting = footnotesize
  %!LATEX.fssubcaption = footnotesize

The first one is used the SAMP block when its style is not
set to 1 or 2. The second one is used for tabular entries.
This will influence the text of TABB, TABR, and LONG blocks.
The third one is used for text in a VERB blocks, including the
line number. The last one is for captions and subcaptions.
Subcaptions are the text underneath each image in a PICT
block.

The values to be placed after the option is one of the following
values that expresses the font size relative to the current
document font. Note that these entries corresponding closely
with the font size switches of LATEX, but without the leading
backslash.

     size            factor
     ----------------------------
     tiny            0.5
     scriptsize      0.7
     footnotesize    0.8
     small           0.9
     normalsize      1.0
     large           1.2
     Large           1.4
     LARGE           1.7
     huge            2.0
     Huge            2.3
  
# Creating a LATEX document

When running 'nil' and the document is not a master document,
then no chapter is to be created, and only sections are.
In particular, each HDGS/1 block will become a "section"
of the CONTEX document, and the HDGS/2 block is to become
a subsection. If there is a HDGS/0 block it will also be 
part of the generated TEX document, but it will not be 
a section. It is simply a paragraph with a bigger font (\tfd).

If the ALL.title is set, then a title page will also be generated,
with the title set to this, and ALL.author will be included
if it is also specified. If ALL.title is not set, then no title
page will be created.

For a master document that includes other child documents, each child
document is to become a chapter (if "h1" is used). If ALL.title
is set, then a title page will be created. The "h1", "h2" designation
is to express the "indent" level, for which "h1" will treate each HDGS/0
block of each child document as a chapter, HDGS/1 as section, 
HDGS/2 as subsection, and so on. The "h2" designation is to treat
the HDGS/0 of each child document as a section, HDGS/1 as a subsection,
HDGS/2 as a subsubsection, and so on. 

# Libertine Fonts

There are pre-existing packages of the following nature
that can be included with each TEX document to change
the document font to Linux Libertine, including also
changing the font of Math expression.
The last one is the one instructing LATEX to use T1
encoded fonts, even though there are other types of 
encodings out there, including TrueType, and OpenType.

  \usepackage{libertine}
  \usepackage{libertinust1math}
  \usepackage[T1]{fontenc}

These packages are not enabled by default. However, NITRILE has
provision that allows additional commands to be inserted at the
end of preamble by providing the following configuration
parameters inside the document.

  %!LATEX.extra+=\usepackage{libertine}
  %!LATEX.extra+=\usepackage{libertinust1math}
  %!LATEX.extra+=\usepackage[T1]{fontenc}

Note the use of `+=` operator rather than the normal `='
operator. It is designed to build expand the previous string into
a larger one by appending new text at the end of it---and 
to insert a "newline" character before each additional text.

# To wide table table/figure

  \begin{figure*}[ht]
  ...
  \end{figure*}

  \begin{table*}[ht]
  ...
  \end{table*}

You can change the horizontal space between columns through:

  \setlength{\columnsep}{2cm}

The following code adds a separation line between columns:

  \setlength{\columnseprule}{0.5pt}

# Custom float

LATEX provides custom float allowing one to define for 
their own use. One good thing about it is that it 
has a star-version such as \begin{Program*} 
that would allow this float to be wide taking up spaces
of both columns when one-column mode is enabled. 

Another thing to point out is that the float number is always
monotonously increasing as a single integer regardless whether
chapter is present or not. To enable it to be chapter aware
the [section] option will need to be specified:

  \floatstyle{ruled}
  \newfloat{Program}{tbp}{lop}[section]

Note that if a star-version of the "caption" command such as
\caption* is used the counter is not increased.  In addition, if
\caption command is not present, there is no caption shown, and
the counter is not increased.

Following is a custom float for Figure:

  \documentclass[twocolumn]{report}
  \usepackage{float}
  \usepackage{graphicx}
  \floatstyle{plaintop}
  \newfloat{Figure}{tbp}{lof}
  \begin{document}
  \chapter*{Chapter 1 - My}
  If tables and figures are not adequate for your needs, then you always have the
  option to create your own! A good example of such an instance would be a
  document that gives lots of source code examples of a programming language. One
  might therefore wish to create a program float. The float package is your
  friend for this task. All commands to set up the new float must be placed in
  the preamble, and not within the document.
  \begin{Figure*}
  \centering
  \caption{The Hello World! program in Java.}
  \medskip
  \includegraphics{tests/image-gimp.jpg}
  \end{Figure*}
  If tables and figures are not adequate for your needs, then you always have the
  option to create your own! A good example of such an instance would be a
  document that gives lots of source code examples of a programming language. One
  might therefore wish to create a program float. The float package is your
  friend for this task. All commands to set up the new float must be placed in
  the preamble, and not within the document.
  \end{document}

Following is a custom float for Program:

  \documentclass[twocolumn]{report}
  \usepackage{float}
  \floatstyle{ruled}
  \newfloat{Program}{tbp}{lop}
  \begin{document}
  \chapter*{Chapter 1 - My}
  If tables and figures are not adequate for your needs, then you always have the
  option to create your own! A good example of such an instance would be a
  document that gives lots of source code examples of a programming language. One
  might therefore wish to create a program float. The float package is your
  friend for this task. All commands to set up the new float must be placed in
  the preamble, and not within the document.
  \begin{Program*}
  \caption{The Hello World! program in Java.}
  \begin{verbatim}
  class HelloWorldApp {
    public static void main(String[] args) {
      //Display the string
      System.out.println("Hello World!");
    }
  }
  \end{verbatim}
  \end{Program*}
  If tables and figures are not adequate for your needs, then you always have the
  option to create your own! A good example of such an instance would be a
  document that gives lots of source code examples of a programming language. One
  might therefore wish to create a program float. The float package is your
  friend for this task. All commands to set up the new float must be placed in
  the preamble, and not within the document.
  \end{document}

# Floats

The PICT, TABR, FRMD, and DIAG will *always* generate a "float" regardless
if a label or caption is present. If both caption and label is lacking
a \caption command is simply not there inside the "float" block---the visual
effect is that user will see no caption text at all, and no numbering.

However, if a label is detected or a caption is provided then 
the \caption will appear. Actually to be more accurate it is the star-version
of the \caption, which will show up as \caption*. This is because NITRILE
generates the number of all floats itself---the only exception being
the equation.

Thus, the \caption* will be used to typeset the caption. The logic is follow:
if the label is there, then a new number is obtained, and is shown, making
look like a "Fig.1", "Table.1", "Prog.1", etc. If no label is present, but
a caption text, then no new numbering is obtained---the caption line is simply
just the caption text without the numbering text that is "Fig.1", "Table.1",
"Prog.1", etc.

One can force the generation of a number by using an "empty label"
in the form of `$(#)`.

NITRILE defines customized floats in the names of: Figure, Table, and Program.
The last one is for source code list, which works with VERB block. The first
one works for PICT, DIAG, and FRMD. The second float works with TABR block.

# Issues and additional remarks

- For Linux liberbine package which changes body font, the documentation
  states to use font encoding using the following option. However, it
  has been observed that on LuaLATEX if following package is used then
  the bold-face went away.

  \usepackage[T1]{fontenc}

- The "xltabular" environment does not work with "twocolumn" mode. 
  Thus, the LONG and CSVD blocks cannot be present if "twocolumn" 
  is going to be an option for the document because both of these
  blocks reply on "xltabular" environment. However, TABR 
  uses float and thus is save with "twocolumn". TABB 
  uses "tabbing" and is thus also safe with "twocolumn". 

# The "tabbing" environment

Following is an example of a "tabbing" environment in LATEX
that can set the "tab-stop" to positions relative to the whole
page width.

  \begin{tabbing}
  \hspace{0.234527\linewidth}\=\hspace{0.265473\linewidth}\=\hspace{0.234527\linewidth}\=\hspace{0.265473\linewidth}\kill
  {\small{}hello} \> {\small{}world} \> {\small{}hello} \> {\small{}world} \\
  {\small{}hello} \> {\small{}world} \> {\small{}hello} \> {\small{}world} \\
  {\small{}hello} \> {\small{}world} \> {\small{}hello} \> {\small{}world} \\
  {\small{}hello} \> {\small{}world} \> {\small{}hello} \> {\small{}world} \\
  {\small{}hello} \> {\small{}world} \> {\small{}hello} \> {\small{}world} \\
  {\small{}hello} \> {\small{}world} \> {\small{}hello} \> {\small{}world} \\
  \end{tabbing}


