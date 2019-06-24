
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

lines2 = [
  '% !BOOK',
  ': ch1.md',
  ': ch2.md',
]

/*
latex.toLUALATEX(lines2,'.')
    .then((out) => {
        console.log(out);
    });
*/

var parser = new SphinxPreviewParser();
var s = parser.joinLine('james','yu');
var s = parser.joinLine('平居的提升水电费水电费','和阿大放送');
var s = parser.joinLine('町合わせ','和阿大放送俞');
var s = '町合わせ james yu 和阿大放送俞';
var news = parser.fontifyLATEX(s);
console.log(s);
console.log(news);

