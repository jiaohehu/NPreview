const { NitrilePreviewHtml } = require('../lib/nitrile-preview-html');
const { NitrilePreviewEpub } = require('../lib/nitrile-preview-epub');
const utils = require('../lib/nitrile-preview-utils');
const path = require('path');

console.log(process.argv);
const fname = process.argv[2];
const dirname = path.dirname(fname);
const parser = new NitrilePreviewHtml();
const epub = new NitrilePreviewEpub();

var work = async () => {
     
     console.log(fname);
     var out = await utils.readFileAsync(fname);
     var lines = out.split('\n');
     parser.isepub = 1;
     parser.fname = fname;
     parser.readFromLines(lines);
     parser.idenBlocks();
     parser.translateBlocks();
     var blocks = parser.blocks;
     var htmls = blocks.map(x => x.html);
     console.log(htmls.join('\n'));
     await epub.generateAsync(parser,dirname);
};

work();
