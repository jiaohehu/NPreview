The TABU block

This block is designed to present a block of plain text that is 
organzied by lines and separated by commas (or spaces) within
each line. 

  = Year,Number,Comment
    2018,123.1,99999
    2019,124.1,99999
    2020,125.1,99999
    2021,126.1,99999
    2022,127.1,99999

What sets this apart from TABB is that the contents of this block
are always assumed to be plaintext. While TABB will attempt
to "stretch" the table to cover the entire length of the page,
and make each column the same width, TABU will try to arrange
the columns close to each for as much as possible. 
In addition, the entire block is indended by the 'step' parameter, 
similar to that of a SAMP block.

For translation, on LATEX it is done by the "tabbing"
environment, such that each "tab" is set by the length
of the longest string within that column, with an additional 
8pt (hardcoded) horizontal space between each column.
Following is the likely output of a LATEX translation.

  \begin{flushleft}
  \begin{adjustwidth}{5mm}{0mm}
  \begin{tabbing}
  {\small{}Year}\hspace{8pt}\={\small{}Number}\hspace{8pt}\={\small{}Comment}\kill
  {\small{}Year}\>{\small{}Number}\>{\small{}Comment}\\
  {\small{}2018}\>{\small{}123.1}\>{\small{}99999}\\
  {\small{}2019}\>{\small{}124.1}\>{\small{}99999}\\
  {\small{}2020}\>{\small{}125.1}\>{\small{}99999}\\
  {\small{}2021}\>{\small{}126.1}\>{\small{}99999}\\
  {\small{}2022}\>{\small{}127.1}\>{\small{}99999}
  \end{tabbing}
  \end{adjustwidth}
  \end{flushleft}

Note that the left indentation of 5mm is a setting of LATEX.step.
For CONTEX it is done by the \starttabulate. The \bTABLE
environment had been attempted but abandoned later because it
seems to have a problem with always wanting to start at a new
column with the entire document is in a two column layout mode
---a rather strange behavior.  The 5mm here is the result of
CONTEX.step setting.  Folowing is the output of a CONTEX
translation.

  \setupTABLE[frame=off]
  \setupTABLE[c][1][width=5mm]
  \bTABLE[loffset=0pt,roffset=8pt,toffset=0pt,boffset=0pt,split=yes]
  \bTR \bTD \eTD \bTD {\tfsm{}Year} \eTD \bTD {\tfsm{}Number} \eTD \bTD {\tfsm{}Comment} \eTD \eTR
  \bTR \bTD \eTD \bTD {\tfsm{}2018} \eTD \bTD {\tfsm{}123.1} \eTD \bTD {\tfsm{}99999} \eTD \eTR
  \bTR \bTD \eTD \bTD {\tfsm{}2019} \eTD \bTD {\tfsm{}124.1} \eTD \bTD {\tfsm{}99999} \eTD \eTR
  \bTR \bTD \eTD \bTD {\tfsm{}2020} \eTD \bTD {\tfsm{}125.1} \eTD \bTD {\tfsm{}99999} \eTD \eTR
  \bTR \bTD \eTD \bTD {\tfsm{}2021} \eTD \bTD {\tfsm{}126.1} \eTD \bTD {\tfsm{}99999} \eTD \eTR
  \bTR \bTD \eTD \bTD {\tfsm{}2021} \eTD \bTD {\tfsm{}126.1} \eTD \bTD {\tfsm{}99999} \eTD \eTR
  \eTABLE

For HTML it is a TABLE-element.

