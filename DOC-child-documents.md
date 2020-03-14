Child documents

The child document is supported by Nitrile. To do it, place the name 
of the file in a separate block proceeded by a greater-than operator (>).

    > mychapter1.md
    > mychapter2.md
    > mychapter3.md
    

In this case, the content of the file is "imported" and inserted
at the current location. 

There are a couple of things that happens at the time of the import.
First, the first block of child document is treated as the one
hash-mark (#) heading block of the current document.  Any block in the
child document that is one hash-marks (#) is treated as a two
hash-marks block. Any block in the child document that is two
hash-mark (##) is treated as three hash-mark block. This arrangement
allows for each child element as considered a section (when 
it is setup to generate a LATEX article, or a chapter (when it is
setup to generate a LATEX report/book.


