# Blocks

Blocks in NITRILE can be categorized into fenced blocks and non-fenced blocks.
Following are blocks that are not fenced blocks.

A non-fenced block is a paragraph with special arrangement of texts. A 
fenced block is one or more lines of text between a set of fences.
A fenced block is an extension of MD code block that is marked by
triple backticks. Following is an example of 'math' fenced block.

    ``` math

    ```

The only fenced recognized in NITRILE is the triple grave accent. The name of
the fenced block must appear after it, with or without spaces between. When the
name is absent, NITRILE assumes to be 'math'. The name is case insensitive.

Following is a list of fenced blocks NITRILE supports.

  - imgs 
  - line 
  - longtabu 
  - tabbing 
  - tabular 
  - tabulary 
  - tabularx 
  - dt 
  - quot 
  - center 
  - flushright 
  - flushleft 
  - math 
  - verb 
  - code 

  Follow is a list of names for non-fenced blocks.

  - TEXT 
  - SAMP 
  - DESC 
  - LIST 
  - HDGS 
  - PART 
  - PARA 
  - PRIM 
  - SECO 
  - PLST 
  - ITEM 
  - CITE 

Check the document [[#DOC-nonfenced-blocks#]] for a description of non-fenced
blocks. Check the document [[#DOC-fenced-blocks#]] for a description of all
fenced blocks.
