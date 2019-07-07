
const latex = require ('./nitrile-preview-latex.js');
const { NitrilePreviewParser } = require ('./nitrile-preview-parser.js');
const fontmap = require ('./nitrile-preview-fontmap');

lines = [
  'Hello',
  '',
  'james * $ %',
  '_james_ _yu_',
  '__james__ __yu__',
  '',
  '~~~',
  '$include <stdio>',
  '~~~',
]


if(0){
var booklines = [
  '% !BOOK',
  ': main.md',
  ': test3.md',
]
latex.toLUALATEX(booklines,'.')
    .then((out) => {
        console.log(out);
    });
}

if(0){
var parser = new NitrilePreviewParser();
var s = parser.joinLine('james','yu');
var s = parser.joinLine('平居的提升水电费水电费','和阿大放送');
var s = parser.joinLine('町合わせ','和阿大放送俞');
var s = '町合わせ james yu 和阿大放送俞';
var news = parser.fontifyLATEX(s);
console.log(s);
console.log(news);
}

if(0){
var booklines = [
  '% !BOOK',
  ': test.md',
  ':: test2.md',
  ':: test3.md',
  ': test.md',
]
latex.toLUALATEX(booklines,'.')
    .then((out) => {
        console.log(out);
    });
}

if(0) {
var parser = new NitrilePreviewParser();
var pp = parser.splitLineThreeSpaces('       james         yu       {}     ');
var pp = pp.map(x => x.trim());
var pp = pp.map((x) => x=='{}'?'':x);
console.log(pp);
}

if(0) {
var line =
`Informal negative        簡単ではない\\
                         簡単じゃない
Informal past            簡単だった
Informal negative past   簡単ではなかった\\
                         簡単じゃなかった
Formal                   簡単です
Formal negative          簡単ではありません\\
                         簡単じゃありません
Formal past              簡単でした`;

var para = line.split('\n');
console.log(para);

var parser = new NitrilePreviewParser();
var o = parser.parseTABB(para);
console.log(o);
}

if(0) {
var line =
Test

===
`Informal negative        簡単ではない\\\\
                         簡単じゃない
Informal past            簡単だった
Informal negative past   簡単ではなかった\\\\
                         簡単じゃなかった
Formal                   簡単です
Formal negative          簡単ではありません\\\\
                         簡単じゃありません
Formal past              簡単でした
===`

var para = line.split('\n');
console.log(para);

var parser = new NitrilePreviewParser();
var o = parser.parseTABB(para);
console.log(o);
}

if(0) {
var line =
`Test

===
Informal negative        簡単ではない\\\\
                         簡単じゃない
Informal past            簡単だった
Informal negative past   簡単ではなかった\\\\
                         簡単じゃなかった
Formal                   簡単です
Formal negative          簡単ではありません\\\\
                         簡単じゃありません
Formal past              簡単でした
===`

var para = line.split('\n');
latex.toLUALATEX(para,'.')
  .then(out => console.log(out));
}

if(0) {
var line =
`Test

///
: This is a tree --- \
  a beautiful tree.
image [width:5cm;height:4cm] (tree.png tree.pdf) Pretty Tree
///`

var para = line.split('\n');
latex.toLUALATEX(para,'.')
  .then(out => console.log(out));
}
