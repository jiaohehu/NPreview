# The Configuration flags

The configuration flags a set of lines that looks like the following:

    % !TEX nitrile title = My Book Title
    % !TEX nitrile author = John Doe
    % !TEX nitrile book = true

Each line must start at the first column, with a percent sign,
followed by a space, then the string of "!TEX", then a space,
then the word "nitrile", then a space, then a word, followed by an equal
sign, and then the text.

Each of these configuration flag is going to serve a specific purpose. Depending
on the actual flag, each flag might be interpreted as a string, a number,
or a list. 

+ latexSampMargin 

Specifies the left margin in centimeters for the sample block.

+ latexSampWrap

When set to a number that is not zero, it specifies the maximum width of the
input line at which point it will be broken into two separate lines. A
backslash character will be inserted at the end of the first line and a small
arrow will be inserted at the beginning of the new line.


