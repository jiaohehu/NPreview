# EPUB Generation

## EPUB splitting chapters

One of the difficult part of generating EPUB document is to
find a way to split a long document into multiple XHTML files.
It is typically to place each chapter in its own XHTML file.
Thus, one of the most important task is to find the boundaries
of the chapters.

We cannot simply replying on
the source MD document itself to tell us where the chapter boundary
is because each document could be a chapter, but it could also be
a section within a chapter.

Thus, after the result of the translation, and we have a
long XHTML file such as the following.

    <h1>PART I - Basi...
    <h2>Chap 1. Intro...
    ...
    ...
    <h2>1.1 Welcome to...
    ...
    ...

We would have built ourself another internal outline table
that would have looked like the following.

    ['PART',   'nitri....1',''        ,'   ','PART I..',0  ,'']
    ['CHAPTER','nitri...12','my:intro','1  ','Intro...',1  ,'']
    ['SECTION','nitri...24',''        ,'1.1','Welco...',225,'']
    ['CHAPTER','nitri...34',''        ,'2  ','regexp  ',300,'']

This table consists of an array of elements. Each element is also an arraw of
7-elements.

  1. The first elemet is a string such as 'PART', 'CHAPTER', 'SECTION',
     etc., that tells us whether it is a part, a section or a chapter.

  2. The second element is the 'ID=' attribute of the HTML element.

  3. The third element is the user-supplied label, such as 'chap1:intro'.

  4. The forth element is the section number that is assigned to that section,
     or chapter: '1' for first chapter, '1.1' for first section within the first
     chapter.

  5. The fifth element is the textual title for the part, chapter, or section.

  6. The six element is an integer serving as the index that expresses the first
      line of that section, chapter, or part.

  7. The seventh element is left empty at first, by 'translateHtml' function.
     It is reserved to be updated with the name of individual XHTML files that
     that is split according to the chapter.

Following is the likely output after being modified by EPUB generator.

    ['PART',   'nitri....1',''        ,'   ','PART I..',0,  'content0.xhtml']
    ['CHAPTER','nitri...12','my:intro','1  ','Intro...',1,  'content1.xhtml']
    ['SECTION','nitri...24',''        ,'1.1','Welco...',225,'content2.xhtml']
    ['CHAPTER','nitri...34',''        ,'2  ','Regexp..',300.'content3.xhtml']

After this table has been built, if we decided to split the files according
to chapters, we will simply skip to the entry where it says 'CHAPTER', and
the write down the line number, and then move to the next 'CHAPTER', and
write down its line number. The range of the first chapter will be the first
line number to the second line number minus one.

## Known problems

  - The iBook does not render EPUB well when it is styled with
    position:absolute.
    Thus, for equation numbering and line numbering for listing blocks,
    it has been deliberately changed to not relying on this kind
    of technique to typeset line number. Instead the <table> is used
    and the leftmost table cell is used for inserting the numbering text.
    For listing and/or verb block, the <ol> is to be used
    so that it automatically number each line using the default 
    way of nubmering by the <ol> list.






