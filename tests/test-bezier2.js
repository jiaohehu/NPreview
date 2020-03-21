const { NitrilePreviewNode } = require('/Users/james/github/nitrile-preview/lib/nitrile-preview-node');
const { NitrilePreviewLatex } = require('/Users/james/github/nitrile-preview/lib/nitrile-preview-latex');
const utils = require('./nitrile-preview-utils');
const parser = new NitrilePreviewLatex();

const fname = 'test.md';
var out = await utils.readFileAsync(fname);
var [main, flags] = parser.toFlow(out.split('\n'), 0, fname);
var config = parser.toConfig(flags);
console.log(main);
console.log(config);
