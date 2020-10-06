const { NitrilePreviewParser } = require('../lib/nitrile-preview-parser');
const { NitrilePreviewPage } = require('../lib/nitrile-preview-page');
const utils = require('../lib/nitrile-preview-utils');

console.log('process.arg=',process.argv);
const fname = process.argv[2];
console.log('fname=',fname);

var work = async ()=>{
  var out = await utils.read_file_async(fname);
  var lines = out.split('\n');
  const parser = new NitrilePreviewParser();
  parser.read_md_lines(lines);
  const translator = new NitrilePreviewPage(parser);
  var html = translator.to_page_document();
  console.log(html);
};

if(fname){
  work();
}

