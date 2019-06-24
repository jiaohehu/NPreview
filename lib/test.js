
const latex = require ('./sphinx-preview-latex.js');
const { SphinxPreviewParser } = require ('./sphinx-preview-parser.js');
const fontmap = require ('./sphinx-preview-fontmap');

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
var parser = new SphinxPreviewParser();
var s = parser.joinLine('james','yu');
var s = parser.joinLine('平居的提升水电费水电费','和阿大放送');
var s = parser.joinLine('町合わせ','和阿大放送俞');
var s = '町合わせ james yu 和阿大放送俞';
var news = parser.fontifyLATEX(s);
console.log(s);
console.log(news);
}

if(1){
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

