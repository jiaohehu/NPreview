TODO


[x] Change is so that only one @ for DESC block. This is to work with changes to adding a `*` bullet that will recognize items before - or :.

[x] need to change the htmlparser so that toPREVIEW does not generate image but toXHTML/toHTML does.

[x] allowing for specifying a customized label id

[ ] allow for including math formula and equations

[x] work on getting title and author from %!BOOK block

[-] only display the named label (not done because having the unnamed labels shown also has its advantages; also the main heading's label is auto-generated and should always be shown.)

[x] change it so that for book generating the main heading
isn't need of a ref, and only the base the is needed.

[ ] need to implement select a best possible image from a
list of source images, currently the first image is selected.

[-] change it so that the ending fences must also be the last
line of a paragraph. (not done because the syntax highlighting for markdown is not done this way and it could be confusing)

[x] change it so that triple-grave-accent fence would be a CODE block and triple-tilde is a VERB block.

[-] for article, the title and author should be optional and only set when they are present. (not done because title is empty it is set as `\title{}` and author when empty is set to `\author{}` and then `\maketitle` will be perfectly fine with it.)

[ ] add a way to specify PART

[x] add .listing directive.

[-] add a package menu item to allow it to generate LATEX document without having to go through the preview context menu. (not to be done because the View class provides essential functions that must be shown in order for a lot of functions to work such as saveAs())

[ ] figure out how to set the flags globally

[ ] figure out how to insert customized LATEX code.

[ ] add the boxed text back by assuming a 80-character wide terminal and each character is to be drawn individually at certain location, following by LATEX \resizebox{\textwidth}{!} command to scale it back to \textwidth.

[ ] settings: step, verbatim, desc, indent, 

[ ] add a configuration to do 'save' instead of 'saveAs' so that it exports to the last file without asking for confirmatoin.

[ ] add a configuration option to generate the latex file without the flushleft for normal paragraphs. 
