# Fenced blocks

## The imgs fenced block

## The line fenced block

## The longtabu fenced block

## The tabbing fenced block

## The tabular fenced block

## The tabulary fenced block

## The tabularx fenced block

## The dt fenced block

## The quot fenced block

## The center fenced block

## The flushright fenced block

## The flushleft fenced block

## The math fenced block

The 'math' fenced block is typeset a block of display math in LATEX.

    ``` math
    a^2 + b^2 = c^2
    ```

If more than one math expression is to be listed, each one should be
separated by at least one empty line.

    ``` math
    a^2 + b^2 = c^2

    \frac{1}{a^2} + \frac{1}{b^2} = \frac{1}{c^2}
    ```

## The verb fenced block

The 'verb' fenced block is to typset a block of verbatim text. The generated
LATEX translation is a \begin{picture} environment that a picture is made with
all the text lines in there. The picture is made in such a way to assume that
the minimum width of the text is 80 columns. If the longest text line is longer
than 80 then the column is expanded to covert that line. The picture is placed
inside a \resizebox{} so that it's width is made the same as the width of the
page. It is then placed inside a \fbox{} so that it will have a border.

## The code fenced block

The 'code' fenced block allows for listing of software codes.

    ``` code
    num1 = 15
    num2 = 12
    sum = num1 + num2
    print("Sum of {0} and {1} is {2}" .format(num1, num2, sum))
    ```

The resulting LATEX translation is a \begin{lstlisting} environment where
fixed font is used for typesetting the software code.

