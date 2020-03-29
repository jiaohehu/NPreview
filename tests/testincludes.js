const { NitrilePreviewLatex } = require('../lib/nitrile-preview-latex');
const { NitrilePreviewHtml } = require('../lib/nitrile-preview-html');
const utils = require('../lib/nitrile-preview-utils');
const path = require('path');

console.log(process.argv);
const fname = process.argv[2];
console.log(fname);

var dolatex = async () => {
  const parser = new NitrilePreviewLatex();
  let out = await utils.readFileAsync(fname);
  var [main, config] = parser.toFlow(out.split('\n'), fname);
  var subs = parser.toSubs(main);
  for( var sub of subs ) {
    var fsubfname = path.join(path.dirname(fname),sub.subfname);
    sub.out = await utils.readFileAsync(fsubfname);
    const [flow] = parser.toFlow(sub.out.split('\n'),sub.subfname);
    sub.flow = flow;
  }
  main = parser.insertSubs(main,subs);
  parser.idenBlocks(main, config);
  parser.translateBlocks(main,config);
  var texlines = main.map(x => x.latex);
  console.log(texlines);
  return texlines;
};

var dohtml = async () => {
  const parser = new NitrilePreviewHtml();
  let out = await utils.readFileAsync(fname);
  var [main, config] = parser.toFlow(out.split('\n'), fname);
  var subs = parser.toSubs(main);
  for (var sub of subs) {
    var fsubfname = path.join(path.dirname(fname), sub.subfname);
    sub.out = await utils.readFileAsync(fsubfname);
    const [flow] = parser.toFlow(sub.out.split('\n'), sub.subfname);
    sub.flow = flow;
  }
  main = parser.insertSubs(main, subs);
  parser.idenBlocks(main, config);
  parser.translateBlocks(main, config);
  var htmllines = main.map(x => x.html);
  console.log(htmllines);
  return htmllines;
};
          
dohtml().then( lines => {

});
