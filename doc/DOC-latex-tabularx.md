# The LATEX tabularx package

The LATEX tabularx package is preferred to allow for the typesetting
if the entire table width is to be respected at a fixed width, 
regardless whether the inter-column border line is present or not.

It is a problem with the current environment of tabular such that
if borders are specified between columns the overall table width
is increase even though each column has calculated with using `p{}`
specifier to amount to exactly 100 percent of `\linewidth`.

Following is an example of using a tabularx environment to typeset
a table of three column. Note that the column that is marked as X
are to be auto-adjusted to its optimum width in order for the entire
column to match the total width specified.

The `\hsize=0.5\hsize` is to be placed inside the curly bracket to allow for
adjusting the relative column widths among the columns.  In the following
situation the first two columns are to be specified so that they appear
one-forth of the third column. However, it has been observed that these are not
hard-set columns that will appear in the document. Sometimes LATEX will adjust
the column widths especially in a two-column layout in order to achieve the
best appearance.

The `\raggedright` means left-justified, `\centering` means center-justified,
and `\raggedleft` means right-justified. The `tabularx` package must be
included.

    %%%
    \usepackage{tabularx}
    %%%
    \begin{tabularx}{\linewidth}{
     | >{\hsize=0.5\hsize\raggedright\arraybackslash}X 
      | >{\hsize=0.5\hsize\centering\arraybackslash}X 
      | >{\hsize=2.0\hsize\raggedleft\arraybackslash}X | }
    \hline
    \textbf{Type} & \textbf{Filter} & \textbf{Predicted Value}\\
    \hline
    0 & None & Zero (so that the raw byte value passes through unaltered) \\
    \hline
    1 &  Sub & Byte A (to the left) \\
    \hline
    2 &  Up  & Byte B (above) \\
    \hline
    3 &  Average  & Mean of bytes A and B, rounded down \\
    \hline
    4 &  Paeth  & A, B, or C, whichever is closest to p = A + B - C \\
    \hline
    \end{tabularx}
    %%%

## The <ltablex> package

The ltablex package, is a extension of longtable to tabularx. Hence the caption
shouldn't be separated from the table body, and the table doesn't float.
Moreover, komascript has a footref  command that works withhyperef`. So it
suffices to add a label when the footnote appears first.

    \documentclass[a4paper]{scrartcl}
    \usepackage[utf8]{inputenc}
    \usepackage{fourier, heuristica}
    \usepackage[colorlinks=true]{hyperref}
    \usepackage{array, ltablex, multirow} % tabularx: auf Textbreite vergrößern

    \usepackage{makecell}
    \setcellgapes{5pt}
    \makegapedcells
    \renewcommand\theadfont{\bfseries}
    \renewcommand\cellalign{rc}

    \begin{document}

    \section{BLA}

    Text text text text text text text text text text text text text text
    text text textt text text text text text text text text text text text
    text text text text text\footnote{A footnote in main text.}.

    \begin{tabularx}{\textwidth}{|X|X|}
    \caption{A Table}\label{tab:1}\\
    \hline
    \thead{\large one} & \thead{\large two}
    \endfirsthead
    \hline
    three & \makecell{four\,\footnote{Seven.\label{fn:3}}} \\
    \hline
    five & \makecell{six\,\footnote{Eight.}} \\
    \hline
    nine & \makecell{ten\,\footref{fn:3}} \\
    \hline
    \end{tabularx}
    %\end{center}

    Text text text text text text text text text text text text text text
    text text textt text text text text text text text text text text text
    text text text text text\footnote{Another footnote in main text.}.

    \end{document} 




## Known problems with tabularx table

  - It is known to generate the following error message when 
    two column setting is on.

    ```
    ! Package longtable Error: longtable not in 1-column mode.
    See the longtable package documentation for explanation.
    Type  H <return>  for immediate help.
     ...
    l.23883 \end{tabularx}
    ```
 
    It is still possible to finish compiling the document 
    by using: `--interaction=nonstopmode`. However the output PDF
    might look a little strange in some section of the document.
    Ie., if a tabularx table is to be broken into two parts 
    and the first part is at the bottom of the first column
    of a page, the second part of the table is supposed to appear
    at the beginning of second column of the same page. 
    However, it has been observed that it actually started 
    at the first column of the next page.

  - A tabularx table does not need to placed inside a flushleft
    environment to add additional margin space top and bottom.
    It produces its own the top and bottom margins.



## Following are copy and paste from the internet
    
  - tabularx, awesome for column formatting but not for multi-page
    tables

  - ltablex, awesome for combining tabularx with longtable but not
    well matching with double-column documents (at least I haven't
    managed to get around the changes ltablex does to the tabularx
    package)

  - xtab (enhancement of supertabular), awesome features but without
    supporting tabularx-style column formatting (at least I haven't
    managed)

  - tabulary, which nicely automates column formatting but is not the
    right thing to do multi-page tables

