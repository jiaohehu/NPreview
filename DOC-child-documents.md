Child documents

The child document is supported by Nitrile. To do it, place the name 
of the file in a separate block proceeded by a greater-than operator (>).

    > mychapter1.md
    > mychapter2.md
    > mychapter3.md
    

In this case, the content of the file is "imported" and inserted
at the current location. 

There are a couple of things that happens at the time of the import.
First, the first block of child document, which is always a HDGS/0
block is treated as the one hash-mark (#) heading block of the current
document.  A HDGS/1 block in a child document is treated as HDGS/2
block in the master document.  A HDGS/2 block in a child document is
treated as HDGS/3 block in the master document.  This arrangement
allows for each child element as considered a section (when it is
setup to generate a LATEX article, or a chapter (when it is setup to
generate a LATEX report/book.

Programmatically, when processed as a preview, the
nitrile-preview-view.js file has a method named toAll(), which is to
return a list of untranslated 'blocks'.  These blocks are HTML/LATEX
neutral. They serves as the "model" part in a model-view-controller
setting. The nitrile-preview-view.js's next responsibility is to
translate these blocks into HTML, by calling nitrile-preview-html.js's
translateHTML() method.

The toAll() method is designed to first process the master document,
which is always the current document being previewed, followed by taking
a look to see if there are any CITE blocks in there. If one is found,
then each line of that CITE block is considered denoting a file name 
of the child document, and will make attempt to open it and read its
content. The opening and reading of a child element is done by using
the 'fs' node module. Once all child documents are read, each child
document is then parsed and a list of "blocks" are created. These 
child "blocks" are then merged with the master document to create 
a final list of blocks.

During the merging, the "row1" and "row2" and "n" field of each block
is updated. In particular, the "row1" field of the block points to the
line number in the master document. The "row2" field is updated so
that it is also a number but it is a number that is one larger than
that of the "row1" field.  The "n" field of the block is set be the
line number which is the same as the "row1" field. This arrangement
allows "highlighting" of paragraph in the preview to work. This works
when the user moves the cursor in the master document, the exact line
number of the cursor is then sent over to the preview, and a search
in the DOM tree is conducted to find a DOM element whose "rows=" field
contains this number. The "rows=" field is always a two integer list
such as "rows='5 6'" or "row='10 15'" to express the list of lines in
the source document that has contributed to this block. Thus, if the
cursor is at line 5 of the editor then the preview DOM element having
the attribute "row='5 6'" set will be considered as the resulting
translation, and thus will be highlighted. If the line is at 6 then 
that block is not. Thus, for a range that is "rows='5 6'", the valid 
range of lines is only 5. For a range that is "rows='10 15'", the
valid number of lines are 10, 11, 12, 13, and 14.

If not using a preview, the node module is implemented in
nitrile-preview-node.js file. It also has a toAll() method that does
the same thing. 




