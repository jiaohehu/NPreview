const { NitrilePreviewParser } = require('../lib/nitrile-preview-parser');
const { NitrilePreviewReport } = require('../lib/nitrile-preview-report');
const utils = require('../lib/nitrile-preview-utils');

console.log('process.arg=',process.argv);
const fname = process.argv[2];
console.log('fname=',fname);

var work = async ()=>{
  var out = await utils.read_file_async(fname);
  var lines = out.split('\n');
  const parser = new NitrilePreviewParser();
  parser.read_md_lines(lines);
  const translator = new NitrilePreviewReport(parser);
  var tex = translator.to_report_document();
  console.log(tex);
};

if(fname){
  work();
}

