# Auto rubifying of Japanese Text

Nitrile comes with a limited set of Japanese Kanji Character vocabulary
and its phonetic pronunciation in Hiragana. It will allow for auto rubifying
of Kanji characters in the SAMP block only. Since this process is expensive,
it needs to be enabled. To enable it, set the 'rubify' config flag to
'true'. The command is known as ~~{complimentary angles}~~.  

    % !TEX nitrile latexAutoRubyEnabled = true

Auto rubifying is done by placing the phonetic component as the ruby text for
some Japanese kanji characters.  Nitrile has some limit set of vocabularies each
with a matching phonetic component. The entire vocabulary set is implemented as
a JavaScript array that is initialized at part of the initialization. Each entry
of this array is an array of two elements, with the first element being the
vocabulary, and the second being its phonetic counter part. Following is what
one of the entry look like:

    [ "簡単","かんたん" ]

The 'nitrile-preview-rubymap.json' file contains a list of Japanese verbs and
Yi-adjectives for which the vocabularies will be built upon. Depending on the
specific type of verbs, such as "vsuru", "v1", each entry will generate a one or
more vocabularies, depending on how the verb or Yi-adjective is conjugated.

The 'Parser::buildRubyMap()' is called once to initialize the database and
its return value is assigned to 'Parser::rubymap' member.

During translation, if 'config.latex.autoRubyEnabled' flag is set to true, each line of the
SAMP block is scanned for possible appearance of one of the candidate
vocabularies stored in 'Parser::rubymap'. If a candidate vocabulary is found,
Nitrile will call the virtual function 'this.extractRubyItems()' for returning a
string suitable for the translation of the target translation. The Parser class
does not provide implementation for this method. The derived class for LATEX or
HTML does.

For example, an input string that is:

    This is 簡単.

Will be translated to HTML such as:

    This is <ruby><rb>簡単</rb><rt>かんたん</rt></ruby>.

For LATEX the translated string is the following:

    @ruby{簡単}{かんたん}

One of the important goal of the extractRubyItems() method is to figure out the boundaries of the kanji and non-kanji characters. For example, for the Following
entry:

    "近く","ちかく"

The vocabulary consists of a kanji and a Hiragana. The kanji 近 will be assigned
the ruby text of ちか and the Hiragana く is left untouched. So for HTML generation
the returned string from Html::extraRubyItems() should be:

    <ruby><rb>近</rb><rt>ちか</rt><rb>く</rb><rt></rt></ruby>

And the string returned by Latex::extraRubyItems() should be:

    @ruby{近}{ちか}@ruby{く}{}

This logic has been implemented and duplicated in Latex::extraRubyItems() and
Html::extraRubyItems().
