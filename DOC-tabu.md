The CSVD block

This block is designed to show plain text type is organized
in CSV (comma separated data).

To designate this block, place the equal-sign as the first
character of this block.

  = Year,Number,Comment
    2018,123.1,99999
    2019,124.1,99999
    2020,125.1,99999
    2021,126.1,99999
    2022,127.1,99999

What sets this apart from TABB is that the content of this block
is always assumed to be plaintext, and will be arranged close to
each other, with each column just wide widest element within each
column. rather than richtext which is In addition, the entire
block is indended by the 'step' parameter, just like it is
with a SAMP block.

For translation, on LATEX it is done by the "tabbing" with
each tab set with the longest string in that column, plus
an additional 8pt (hardcoded) of horizontal space. 
Note that the longest string is only determined by looking at the
'length' field of the string. This longest string is then
used to determined the tab stop position for the next column
after this one.

Following is the output of a LATEX translation.

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
It is the idea that for CSVD block is should be indented by
this value, just like the SAMP block.

For CONTEX it is done by the \starttabulate.  The \bTABLE had
been attempted but was abandoned because it seems to have a
problem with always wanting to start at a new column for the
first row when two column layout is enabled, even though there
are still plenty of spaces available at the bottom of the current
column---a strange anomaly but nevertheless very annoying.
However, the \bTABLE has a better support for drawing table
frames, and for \starttabulate it is impossible to have vertical
frames without having it being broken when it crosses over
from one row to another.

The
5mm here is the result of CONTEX.step setting.  Folowing is the
output of a CONTEX translation.

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

