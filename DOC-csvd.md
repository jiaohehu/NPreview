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
    2023,128.1,99999
    2024,129.1,99999
    2025,130.1,99999
    2026,131.1,99999
    2027,132.1,99999
    2028,133.1,99999
    2029,134.1,99999
    2030,135.1,99999
    2031,136.1,99999
    2032,137.1,99999
    2033,138.1,99999
    2034,139.1,99999
    2035,140.1,99999
    2036,141.1,99999

What sets this apart from TABB is that the content of the data
is assumed to be plaintext, rather than richtext which is
what's assumed by TABB. In addition, white space are preserved
and not collapsed, which is similar to VERB block, and the
font size is going to be affected by the choices of 'niprog'.

In addition, TABB is designed for presenting materials that 
complements the explanation, in which case the nature
of the material is short and should be better laid out in rows
and columns for a better visualization experience. 

On the countrary, the CSVD block is used to showcase an 
example of the data file, with a focus on illustrating the structural 
dimension of the data file, rather than the content of the data.

For translation, on LATEX it is done by the "xltabular" with
the "l" option, thus making it left-aligned and able to be
split across page boundaries. 
On CONTEX it is done by the \starttabulate
command, which is also designed to go across page boundaries.
On HTML it is a TABLE-element.

Since "xltabular" environement is not designed to work with
"two column", it will complain if "twocolumns" option is set
for the "documentclass".


