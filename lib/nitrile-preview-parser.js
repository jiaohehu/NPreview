'use babel';

const path = require('path');
const fs = require('fs');
const fontmap = require('./nitrile-preview-fontmap');

class NitrilePreviewParser {


  constructor() {
    this.P_id      = 0;
    this.P_row1    = 1;
    this.P_row2    = 2;
    this.P_sig     = 3;
    this.P_n       = 4;
    this.P_data    = 5;
    this.P_para    = 6;
    this.P_fencecmd= 7;
    this.P_dept    = 8;
    this.P_fig     = 9;
    this.P_caption = 10;
    this.P_hidden  = 11;
    this.P_fname   = 12;
    this.P_plevel  = 13;
    this.block0 = [];  /// the block immediately before the active block during 'unmask'
    this.block = [];  /// the active block during 'unmask'
    this.contentBlockCount = 0; /// the accumulating count of content blocks for this dept 
    this.subfignums = ['a','b','c','d','e','f','g','h','i','j','k','l','m',
       'n','o','p','q','r','s','t','u','v','w','x','y','z'];
    this.re_fence = /^(\s*\`\`\`|\s*\~\~\~|\s*\<\<\<|\s*\/\/\/|\s*\-\-\-|\s*\=\=\=|\s*\"\"\"|\s*\$\$\$)\s*(|\w+|\[.*\])$/;
    this.re_bullet_text = /^(.*?)\s+(\:)\s+(.*)$/;
    this.re_unmask = /\s\_{2}(.*?)\_{2}|\s\_{1}(.*?)\_{1}|\s\`\`\s*(.*?)\s*\`\`|\`\s*(.*?)\s*\`|\[(.*?)\]\((.*?)\)/g;
    this.re_local = /^\:([\w\-]+)$/;
    this.re_full = /^([\w\-]+)\:([\w\-]+)$/;
    this.re_directive = /^\.(\w+)$/;
    this.re_four_spaces = /^\s{4}/;
    this.re_base = /^([\w\-]+)/;
    this.re_ref = /^([\w\-\:]+)/;
    this.re_plst = /^(\s*)(\+|\-|\*|\d+\.)\s+(.*)$/;
    this.re_hyphen_hyphen = /^(\-\-)\s+(.*)$/;
    this.re_asterisk_asterisk = /^(\*\*)\s+(.*)$/;
    this.re_plus_plus = /^(\+\+)\s+(.*)$/;
    this.re_hdgs = /^(\#{1,})\s+(.*)$/;
    this.re_flags = /^\:\s+(\w+)\s*\=\s*(.*)$/;
    this.re_files = /^(\>{1,})\s+(.*)$/;
    this.re_parts = /^(\=)\s+(.*)$/;
    this.re_verbatim = /^(\s*)/;
    this.re_displaymath = /^\$\$\s*(.*?)\s*\$\$$/;
    this.re_inlinemath = /^\$\s*(.*?)\s*\$$/;
  }

  toBlocks(lines,fname,plevel,o) {

    /// 
    /// Return a string that is the HTML. The second and rest
    /// arguments can be omitted and it will be assumed as
    /// its sensitive default values.

    /// The 'fname' argument is given the basename of the
    /// file which is typically the editor's path, or it
    /// can also be a chapter file if it comes from a !BOOK
    /// block.

    /// THe 'plevel' parameter is set to 0 typically but
    /// it can be set to 1 or larger if it is listed
    /// as "::" or ":::" or other nested levels other than
    /// chapter. For :: it is 1 and for ::: it is 2,
    /// and so on. when plevel is passed as 1 then HDGS/0 will
    /// become HDGS/1, essentially turning a chapter into
    /// a section, and section into subsection, and so on.

    /// The last argument is the old block list where new
    /// blocks will be appended to it. New blocks will be
    /// added to this list and the resulting list will be
    /// returned as the return value of this function.
    /// If it is null then a new block list is created
    /// and returned.
    ///

    var flags = {};
    var book = [];
    var dept = '';
    var fig = '';
    var hidden = false;
    var caption = '';
    var v = '';
    var n = 0;
    var i = 0;
    var nblocks = 0;
    var nlines = 0;
    var row = 0;
    var row2 = 0;
    var base = '';

    /// initialize the
    o = o || [];
    fname = fname || '';
    plevel = plevel || 0;

    /// update 'base'
    var base = this.toBase(fname); /// extra a base off it

    /// if the first first line is !BOOK then the entire document is
    /// a BOOK block
    if (lines.length && lines[0] === '% !BOOK') {

      /// assign to book to return back to caller
      book = lines;

      /// clear all lines so that the following while loop will not enter
      lines = [];
    }

    /// start processing all lines of the editor
    while (lines.length > 0) {

      var [ para, lines, the_fence ] = this.readPara(lines);

      /// increment block count
      ++nblocks;
      row = nlines;
      nlines += para.length;
      row2 = nlines;

      /// prepare the id
      var id = `${base}:${nblocks}`; /// default label, such as 'd3js:15'

      /// Remove the last empty line if any
      while (para.length && para[para.length-1].length == 0) {
        para.pop();
      }

      /// Remove the first empty line if any
      while (para.length && para[0].length == 0) {
        para.shift();
      }

      /// this is the directive such as .caption
      v = this.re_directive.exec(para[0]);
      if (v) {
        if (v[1] === 'caption') {
          caption = para.slice(1).join('\n');
        }
        continue
      }

      /// if flags.verbatim is set then checks to see if the first 
      /// line has enough leading spaces specified by this flag
      if (flags.verbatim) {
        var m = parseInt(flags.verbatim);
        if (!isNaN(m)) {
          var v = this.re_verbatim.exec(para[0]);
          if (v) {
            if (v[1].length >= m) {
              var [data, n] = this.trimPara(para); /// n is to be ignored
              var fencecmd = {};
              o.push([id,row,row2,'VERB',0,data,para,fencecmd,dept,fig,caption,hidden,fname,plevel]);
              continue;
            }
          }
        }
      }

      /// this is the CODE block, will check for 'listing' directive
      if (the_fence === '```') {
        var [data, n] = this.trimPara(para);
        var [data,fence,fencecmd] = this.trimFences(data);
        id = this.toSid(id,fencecmd.label);
        o.push([id,row,row2,'CODE',n,data,para,fencecmd,dept,fig,caption,hidden,fname,plevel]);
        continue;
      }

      /// this is the VERB block
      if (the_fence === '~~~') {
        var [data, n] = this.trimPara(para);
        var [data,fence,fencecmd] = this.trimFences(data);
        id = this.toSid(id,fencecmd.label);
        o.push([id,row,row2,'VERB',n,data,para,fencecmd,dept,fig,caption,hidden,fname,plevel]);
        continue;
      }

      // this is the VRSE block
      if (the_fence === '---') {
        var [data, n] = this.trimPara(para);
        var [data,fence,fencecmd] = this.trimFences(data);
        var data = this.concatPara(data);
        id = this.toSid(id,fencecmd.label);
        o.push([id,row,row2,'VRSE',n,data,para,fencecmd,dept,fig,caption,hidden,fname,plevel]);
        continue
      }

      /// this is the PICT block
      if (the_fence === '///') {
        var [data, n] = this.trimPara(para);
        var [data,fence,fencecmd] = this.trimFences(data);
        var data = this.concatPara(data);
        var data = this.parsePICT(data);
        id = this.toSid(id,fencecmd.label);
        o.push([id,row,row2,'PICT',n,data,para,fencecmd,dept,fig,caption,hidden,fname,plevel]);
        continue;
      }

      // this is the TABB block
      if (the_fence === '===') {
        var [data, n] = this.trimPara(para);
        var [data,fence,fencecmd] = this.trimFences(data);
        var data = this.parseTABB(data);
        id = this.toSid(id,fencecmd.label);
        o.push([id,row,row2,'TABB',n,data,para,fencecmd,dept,fig,caption,hidden,fname,plevel]);
        continue;
      }

      // this is the TERM block
      if (the_fence === '<<<') {
        var [data, n] = this.trimPara(para);
        var [data,fence,fencecmd] = this.trimFences(data);
        var data = this.parseTERM(data);
        id = this.toSid(id,fencecmd.label);
        o.push([id,row,row2,'TERM',n,data,para,fencecmd,dept,fig,caption,hidden,fname,plevel]);
        continue;
      }

      // this is the QUOT block
      if (the_fence === '\"\"\"') {
        var [data, n] = this.trimPara(para);
        var [data,fence,fencecmd] = this.trimFences(data);
        var data = this.joinPara(data);
        id = this.toSid(id,fencecmd.label);
        o.push([id,row,row2,'QUOT',n,data,para,fencecmd,dept,fig,caption,hidden,fname,plevel]);
        continue;
      }

      // this is the EQTN block
      if (the_fence === '\$\$\$') {
        var [data, n] = this.trimPara(para);
        var [data,fence,fencecmd] = this.trimFences(data);
        var data = this.parseEQTN(data);
        id = this.toSid(id,fencecmd.label);
        o.push([id,row,row2,'EQTN',n,data,para,fencecmd,dept,fig,caption,hidden,fname,plevel]);
        continue;
      }

      /// this is the hyphen-hyphen (--) description block
      if (this.re_hyphen_hyphen.test(para[0])) {
        var data = this.parseDESC('italic',para,this.re_hyphen_hyphen);
        var fencecmd = {};
        o.push([id,row,row2,'DESC',n,data,para,fencecmd,dept,fig,caption,hidden,fname,plevel]);
        continue;
      }

      /// this is the asterisk-asterisk (**) description block
      if (this.re_asterisk_asterisk.test(para[0])) {
        var data = this.parseDESC('strong',para,this.re_asterisk_asterisk);
        var fencecmd = {};
        o.push([id,row,row2,'DESC',n,data,para,fencecmd,dept,fig,caption,hidden,fname,plevel]);
        continue;
      }

      /// this is the plus-plus (++) description block
      if (this.re_plus_plus.test(para[0])) {
        var data = this.parseDESC('mono',para,this.re_plus_plus);
        var fencecmd = {};
        o.push([id,row,row2,'DESC',n,data,para,fencecmd,dept,fig,caption,hidden,fname,plevel]);
        continue;
      }

      /// this is the PRIM block: [ Apple ] This is ...
      var re = /^\[\s+(.*?)\s+\]\s+(\S.*)$/;
      var v = re.exec(para[0]);
      if (v) {
        var lead = v[1];
        var text = v[2];
        for (i=1; i < para.length; ++i) {
          /// candidate for line join
          text = this.joinLine(text,para[i]);
        }
        var data = [lead,text];
        var fencecmd = {};
        o.push([id,row,row2,'PRIM',0,data,para,fencecmd,dept,fig,caption,hidden,fname,plevel]);
        continue;
      }

      /// this is the SECO block: [[ Apple ]] This is ...
      var re1 = /^\s+\[\s+(.*?)\s+\]\s+(\S.*)$/;
      var re2 = /^\[\[\s+(.*?)\s+\]\]\s+(\S.*)$/;
      var v1 = re1.exec(para[0]);
      var v2 = re2.exec(para[0]);
      var v = v1 ? v1 : v2;
      if (v) {
        var lead = v[1];
        var text = v[2];
        for (i=1; i < para.length; ++i) {
          /// candidate for line join
          text = this.joinLine(text,para[i]);
        }
        var data = [lead,text];
        var fencecmd = {};
        o.push([id,row,row2,'SECO',0,data,para,fencecmd,dept,fig,caption,hidden,fname,plevel]);
        continue;
      }

      /// This is a PLST block: -/*/+ Apple
      //var re = /^(\s*)(\+|\-|\*|\d+.)\s+\S/;
      v = this.re_plst.exec(para[0]);
      if (v) {
        var [data, n] = this.trimPara(para);
        var data = this.parsePLST(data);
        var fencecmd = {};
        o.push([id,row,row2,'PLST',n,data,para,fencecmd,dept,fig,caption,hidden,fname,plevel]);
        continue
      }

      /// this is the HDGS block: # Intro...
      if ((v = this.re_hdgs.exec(para[0])) !== null) {
        var cat = v[1];
        var text = v[2];
        var data = [cat.length,text];
        var sid = id;
        if (para[1]) {
          var v1 = this.re_local.exec(para[1]);
          if (v1) {
            var local = v1[1];
            sid = this.toSid(id,local); // custom label, such as 'd3js:intro'
          }
        }
        var fencecmd = {};
        o.push([sid,row,row2,'HDGS',0,data,para,fencecmd,dept,fig,caption,hidden,fname,plevel]);
        continue;
      }

      /// first block that is of a regular paragraph
      /// is treated as a HDGS/0 block and is subject
      /// to the processing of flags
      if (nblocks == 1) {
        var text = para[0];
        flags = this.parseFLAGS(para.slice(1));
        flags.title = flags.title ? flags.title : text;
        var data = [0,text];
        id = base; /// id is always the base itself
        var fencecmd = {};
        o.push([id,row,row2,'HDGS',0,data,para,fencecmd,dept,fig,caption,hidden,fname,plevel]);
        continue;
      }

      // This is a regular paragraph block
      if (true) {
        var [data, n] = this.trimPara(para);
        var data = this.joinPara(data);
        var fencecmd = {};
        o.push([id,row,row2,'',n,data,para,fencecmd,dept,fig,caption,hidden,fname,plevel]);
        continue;
      }

    }

    return [o,flags,book];
  }

  async toBookBlocks(lines,dirname) {

    ///
    /// Generate a new list of blocks consists of all the
    /// sub-documents mentioned in the !BOOK block
    ///

    var myFlags = {};
    var myBlocks = [];
    var myFlags = this.parseFLAGS(lines);
    var myFiles = this.parseFILES(lines);
    var myOpeners = myFiles.map( myfile => {
        var [sublevel,subfname,subpart] = myfile;
        if (sublevel < 0) {
          var fsubfname = '';
          var subprom = null;
          return [sublevel,subfname,fsubfname,subprom,subpart];
        }
        var fsubfname = path.join(dirname,subfname);
        var subprom = this.readFileAsync(fsubfname);
        return [sublevel,subfname,fsubfname,subprom,subpart];
    });
    for (var myOpener of myOpeners) {
      let [sublevel,subfname,fsubfname,subprom,subpart] = myOpener;
      if (sublevel < 0) {
        var subparser = new NitrilePreviewParser();
        myBlocks.push(subparser.newPART(subpart));
        continue;
      }
      try {
        var subdata = await subprom;
      } catch(e) {
        var subdata = `Error: no such file, open '${fsubfname}'`;
      }
      var subparser = new NitrilePreviewParser();
      myBlocks.push(subparser.newFILE(subfname,sublevel));
      [myBlocks] = subparser.toBlocks(subdata.split('\n'),subfname,sublevel,myBlocks);
      myBlocks.push(subparser.newFEND(subfname,sublevel));
    }
    return [myBlocks,myFlags];
  }

  readPara (lines) {

    ///
    /// Read a paragraph and return the paragraph, the unread lines.
    /// and the fence if there is any.

    /// For a paragraph with fence, the returned paragraph is from the
    /// first fence down the last fence. For a paragraph without fence,
    /// the first line of the paragraph is the first line and the last
    /// line of the paragraph is the blank immediately after the last
    /// non-empty line of the paragraph.
    ///

    var para = [];
    var is_fence = false;
    var the_fence = '';
    var the_fence_opt = '';
    var num_solid = 0;
    for (var i=0; i < lines.length; ++i) {
      var line = lines[i];
      line = line.trimRight();
      if (is_fence) {
        if (line === the_fence) {
          para.push(line);
          i += 1;
          break
        }
        para.push(line);
        continue
      }

      // following is for non-fenced para

      // if encounter a blank line and we have
      // already encountered at least one non-blank
      // lines then we get out
      if (line.length == 0) {
        if (num_solid) {
          break
        }
      }

      // add to this paragraph
      para.push(line);

      /// keep track of the number of non-empty lines
      if (line.length) {
        num_solid += 1;
      }

      // if this is the first solid line then we check
      // to see if this is a fence
      if (num_solid == 1) {
        var v = this.re_fence.exec(line);
        if (v) {
          is_fence = true;
          the_fence = v[1];
        }
      }
    }
    return [
      para,
      lines.slice(i),
      the_fence.trim()
    ];
  }

  unmask (text) {
    ///
    /// unmask all inline markups within a text
    ///

    var cnt;
    var v;
    var str = ' ' + text;
    var start_i = 0;
    var newtext = '';
    while ((v = this.re_unmask.exec(str)) !== null) {
      var i = v.index;
      cnt = str.slice(start_i,i);
      cnt = this.escape(cnt);
      newtext = newtext.concat(cnt);
      if (v[1]) {
        var cnt = v[1];
        newtext += ' ';
        newtext += this.style('strong',cnt);

      } else if (v[2]) {
        var cnt = v[2];
        newtext += ' ';
        newtext += this.style('em',cnt);

      } else if (v[3]) {
        var cnt = v[3];
        newtext += ' ';
        newtext += this.style('mono',cnt);

      } else if (v[4]) {
        var cnt = v[4];

        if (this.re_displaymath.test(cnt)) {
          var w1 = this.re_displaymath.exec(cnt);
          newtext += this.style('displaymath',w1[1]);
        } else if (this.re_inlinemath.test(cnt)) {
          var w1 = this.re_inlinemath.exec(cnt);
          newtext += this.style('inlinemath',w1[1]);
        } else {
          newtext += this.style('mono',cnt);
        }

      } else if (v[6]) { /// v[5] could be an empty string, as in [](www.yahoo.com)
        /// uri: [](www.yahoo.com)
        /// uri: [Google](www.google.com)
        /// ref: [#](d3js:intro)
        var alt = v[5];
        var cnt = v[6];
        var orig_cnt = cnt;
        var type = '';
        alt = alt || '';
        alt = alt.trim();
        cnt = cnt.trim();
        if (alt === '#') {
          type = 'ref';
        } else if (alt === '&') {
          type = 'unicode';
        } else if (cnt.startsWith('^')) {
          type = 'ruby';
        } else {
          type = 'uri';
        }
        if (type === 'uri') {
          newtext += this.style('uri',[alt,cnt]);

        } else if (type === 'unicode') {
          /// [&](U+4f60)
          if (cnt.startsWith('U+')) {
            cnt = '0x' + cnt.slice(2); /// turn Ux4F60 -> 0x4F60
          }
          try {
            cnt = String.fromCodePoint(cnt);
            newtext += this.style('unicode',cnt);
          } catch(e) {
            newtext += this.escape(orig_cnt);
          }

        } else if (type === 'ruby') {
          var rb = alt;
          var rt = cnt.slice(1); /// remove the first character
          newtext += this.style('ruby',[rb,rt]);

        } else if (type === 'ref') {
          if (this.re_local.test(cnt)) { /// such as ':intro'
            var base = this.toBase(this.block[0]);
            cnt = base + cnt; /// now it is d3js:intro
            newtext += this.style('ref',cnt);
          } else { /// such as d3js:intro
            var cnt = this.toRef(cnt);
            newtext += this.style('ref',cnt);
          }
        }
      }
      start_i = this.re_unmask.lastIndex;
    }
    cnt = str.slice(start_i);
    cnt = this.escape(cnt);
    newtext = newtext.concat(cnt);
    newtext = newtext.slice(1);
    return newtext;
  }

  trimPara (para) {

    ///
    /// Trim the paragraph on the left side and return the number of
    /// spaces trimmed
    ///

    if (para.length == 0) {
      return [para, 0];
    }
    var re = /^\s+/;
    var v = re.exec(para[0]);
    if (v == null) {
      return [para, 0];
    }
    var n = v[0].length;
    var out = [];
    var i;
    for (i in para) {
      out.push(para[i].slice(n));
    }
    return [out, n];
  }

  trimFences (para) {

    ///
    /// Trim the paragraph to remove fences on the top and/or bottom

    /// ``` javascript
    /// printf("hello world\n");
    /// ```

    /// or

    /// ``` [javascript]
    /// printf("hello world\n");
    /// ```
    ///

    var the_fence = '';
    var the_fencecmd = '';
    var v = this.re_fence.exec(para[0]);
    if (v) {
      var the_fence = v[1];
      var the_fencecmd = this.styleToObject(v[2]);
      if (para[para.length-1] === the_fence) {
        para = para.slice(1,para.length-1);
      } else {
        para = para.slice(1);
      }
    }
    return [para,the_fence,the_fencecmd];
  }

  concatPara (para) {
    ///
    /// Concatenate all lines within that paragraph that ends with backslashes
    ///

    var out = [];
    var iscont = false;
    var s0 = '';
    for (var line of para) {
      if (iscont) {
        var s = out[out.length-1];
        s = s.slice(0,s.length-1);
        s = this.joinLine(s,line);
        out[out.length-1] = s;
      } else {
        out.push(line);
      }
      iscont = line.endsWith('\\');
    }
    return out;
  }

  splitLineThreeSpaces (line) {
    ///
    /// Break a line into multiple segments based on three-spaces
    ///

    var o = [];
    var i = 0;
    var k = -1;
    var n = 0;
    var j0 = 0;
    var j = 0;
    for (j=0; j < line.length; ++j) {
      var c = line[j];
      if (/\s/.test(c)) {
        i = j;
      } else {
        k = j;
      }
      if (k >= 0 && (i-k == 3)) {
        o.push(line.slice(j0,j+1));
        j0 = j+1;
      }
    }
    if (j0 < j) {
      o.push(line.slice(j0,j));
    }
    return o;
  }

  splitLineTwoSpaces (line) {
    ///
    /// Break a line into multiple segments based on three-spaces
    ///

    var o = [];
    var i = 0;
    var k = -1;
    var n = 0;
    var j0 = 0;
    var j = 0;
    for (j=0; j < line.length; ++j) {
      var c = line[j];
      if (/\s/.test(c)) {
        i = j;
      } else {
        k = j;
      }
      if (k >= 0 && (i-k == 2)) {
        o.push(line.slice(j0,j+1));
        j0 = j+1;
      }
    }
    if (j0 < j) {
      o.push(line.slice(j0,j));
    }
    return o;
  }

  parsePICT (para) {
    ///
    /// Parse the PICT
    ///  image [width:100%;height:4cm] (tree.png tree.pdf)
    ///  image [width:4cm] (frog.png frog.pdf)
    ///

    var o = [];
    var re_image = /^\s*image\s*\[(.*?)\]\s*\((.*?)\)\s*(.*)$/;
    for (var line of para) {
      var v = re_image.exec(line);
      if (v) {
        var opts = this.fromStyle(v[1]);
        var srcs = v[2].split(' ').filter(x => x.length);
        var sub = v[3].trim();
        o.push(['image',opts,srcs,sub]);
        continue;
      } else {
        o.push(['',{},[],'']);
      }
    }
    return o;
  }

  parseTABB (para) {
    /// Parse the TABB block
    ///  ===
    ///  Informal negative        簡単ではない\
    ///                           簡単じゃない
    ///  Informal past            簡単だった
    ///  Informal negative past   簡単ではなかった\
    ///                           簡単じゃなかった
    ///  Formal                   簡単です
    ///  Formal negative          簡単ではありません\
    ///                           簡単じゃありません
    ///  Formal past              簡単でした
    ///  ===
    /// or
    /// ===
    /// Event
    /// Description
    ///
    /// keydown
    /// Fires once when a key is pressed
    ///
    /// keyup
    /// Fires once when a key is released
    ///
    /// keypress
    /// Fires continuously while a key is pressed
    /// ===
    /// or
    /// ===
    /// : Event
    /// : Description
    ///
    /// : keydown
    /// : Fires once when a key
    ///   is pressed
    ///
    /// : keyup
    /// : Fires once when a key is
    ///   released
    ///
    /// : keypress
    /// : Fires continuously while a
    ///   key is pressed
    /// ===

    /// test the paragraph to see which form it is in
    /// either '', 'lines', or 'colons'
    var form = '';
    if (para.length) {
      var pp = this.splitLineTwoSpaces(para[0]);
      if (pp.length === 1) {
        form = 'lines';
      }
    }

    if (form === 'lines') {
      /// form is 'lines'
      var iscont = false;
      var o = [];
      o.push([]);
      for (var line of para) {
        var s = line;
        if (line.trim() === '{}') {
          s = '';
        }
        if (iscont) {
          var i0 = o[o.length-1].length;
          var line0 = o[o.length-1][i0-1];
          if (line0.endsWith('\\\\')) {
            line0 = line0.slice(0,line0.length-2);
            line0 += '\n';
            line0 += s;
            o[o.length-1][i0-1] = line0;
          } else if (line0.endsWith('\\')) {
            line0 = line0.slice(0,line0.length-1);
            line0 = this.joinLine(line0,s);
            o[o.length-1][i0-1] = line0;
          }
          if (!line) {
            o.push([]);
          }
        } else {
          if (!line) {
            if (o[o.length-1].length) {
              o.push([]);
            }
          } else {
            o[o.length-1].push(s);
          }
        }
        /// check for iscont
        iscont = line.endsWith('\\');
      }
      return o;
    } else {
      /// form is ''
      var o = [];
      var iscont = false;
      for (var row of para) {
        var pp = this.splitLineTwoSpaces(row);
        var pp = pp.map(x => x.trim());
        var pp = pp.map(x => x=='{}'?'':x);
        if (iscont) {
          var pp0 = o[o.length-1];
          var i = 0;  // 'i' is for last row
          var j = 0;  // 'j' is for new row
          for (; i < pp0.length; ++i) {
            var s = pp0[i];
            if (s.endsWith('\\\\')) {
              s = s.slice(0,s.length-2);
              s += '\n';
              s += pp[j] || '';
              pp0[i] = s;
              j++;
            } else if (s.endsWith('\\')) {
              s = s.slice(0,s.length-1);
              s = this.joinLine(s, (pp[j] || ''));
              pp0[i] = s;
              j++;
            }
          }
          o[o.length-1] = pp0;
        } else {
          if (row) {
            /// ignore empty lines
            o.push(pp);
          }
        }
        iscont = pp.some(x => x.endsWith('\\'));
      }
      return o;
    }

  }

  parseDESC (cat, para, re) {
    ///
    /// Parse the DESC
    ///

    var text = '';
    var keys = [];
    var n = 0;
    for (var i=0; i < para.length; ++i) {
      if (text) {
        text = this.joinLine(text,para[i]);
        continue
      }
      var v = re.exec(para[i]);
      if (v) {
        keys.push(v[2]);
        continue;
      }
      var s = para[i];
      var s1 = para[i].trimLeft();
      n = s.length - s1.length;
      text = s1;
    }
    return [ cat, keys, text, n ];
  }

  parsePLST (para) {
    ///
    /// Parse the paragraph that is PLST
    ///

    var items = [];
    //
    var levels = [];
    var lead = '';
    var bull = '';
    var bullet = '';
    var action = '';
    //
    //var re = /^(\s*)(\+|\-|\*|\d+\.)\s+(.*)$/;
    //
    for (var line of para) {
      var v = this.re_plst.exec(line);
      if (v) {
        var lead = v[1];
        var bullet = v[2];
        var text = v[3];
        // check for indentation
        if (levels.length == 0) {
          action = 'push';
        } else {
          var lead0 = levels[levels.length-1][0];
          if (lead0.length < lead.length) {
            action = 'push';
          } else if (lead0.length > lead.length) {
            action = 'pop';
          } else {
            action = 'item';
          }
        }
      } else {
        action = 'text';
      }

      //
      if (action === 'push') {
        if (bullet === '+') {
          items.push(['UL',bullet,text]);
          levels.push([lead,'UL']);
          bull = 'UL';
        } else if (bullet === '-') {
          items.push(['UL',bullet,text]);
          levels.push([lead,'UL']);
          bull = 'UL';
        } else if (bullet === '*') {
          items.push(['UL',bullet,text]);
          levels.push([lead,'UL']);
          bull = 'UL';
        } else {
          items.push(['OL',bullet,text]);
          levels.push([lead,'OL']);
          bull = 'OL';
        }
      } else if (action === 'pop') {
        if (bull === 'OL') {
          items.push(['/OL',bullet,text]);
        } else {
          items.push(['/UL',bullet,text]);
        }
        [lead,bull] = levels.pop();
      } else if (action === 'item') {
        if (bull === 'OL') {
          items.push(['LI',bullet,text]);
        } else {
          items.push(['LI',bullet,text]);
        }
      } else {
        // 'text', concat the new text to the old of the last text
        if (items.length > 0) {
          var item = items.pop();
          var text0 = item[2];
          text0 = this.joinLine(text0,line);
          item[2] = text0;
          items.push(item);
        }
      }
    }
    //
    while (levels.length > 0) {
      [lead,bull] = levels.pop();
      items.push([`/${bull}`]);
    }
    //
    return items;
  }

  parseTERM (para) {
    var out = [];
    var re = /^(\S.*?)\s{2,}(.*)$/;
    var re_dt = /^\S/;
    for (var s of para) {
      var v = re.exec(s);
      if (v) {
        var dt = v[1];
        var dd = v[2];
        out.push(dt);
        out.push(dd);
      } else if (re_dt.test(s)) {
        var dt = s;
        var dd = '';
        out.push(dt);
        out.push(dd);
      } else {
        if (out.length) {
          var last = out.pop();
          s = this.joinLine(last,s);
          out.push(s);
        }
      }
    }
    return out;
  }

  parseEQTN (para) {
    var out = [];
    var s0 = '';
    for (var s of para) {
      if (s === '') {
        if (s0) {
          out.push(s0);
          s0 = '';
        }
      } else {
        s0 += ' ';
        s0 += s;
      } 
    }
    if (s0) {
      out.push(s0);
    }
    return out;
  }

  parseBOOK (para) {
    var out = [];
    for (var s of para) {
      var re = /^\s*(\:|\#{1,})\s+(.*)$/;
      var v = re.exec(s);
      var path = undefined;
      var text = undefined;
      var sec = '';
      var num = 0;
      if (v) {
        if (/^\"(.*)\"$/.test(v[2])) {
          text = v[2];
          text = text.slice(1,text.length-1);
        } else {
          path = v[2];
        }
        if (v[1] === ':') {
          sec = 'chapter';
        } else {
          sec = 'section';
          num = v[1].length;
        }
        /// a chapter
        out.push([sec,num,path,text]);
      }
    }
    return out;
  }

  old_replaceSubstrings (src, map) {
    ///
    /// perform replacements given a list of substrings and target strings.
    ///

    var j = 0;
    var k = 0;
    var out = '';
    src = src || '';
    while (j < src.length) {
      for (k=0; k < map.length; k+=2) {
        var str1 = map[k];
        var str2 = map[k+1];
        if (src.startsWith(str1,j)) {
          break
        }
      }
      if (k < map.length) {
        /// found!
        out += str2;
        j += str1.length;
      } else {
        out += src[j];
        j++;
      }
    }
    return out;
  }

  replaceSubstrings (src, map) {

    ///
    /// perform replacements given a list of substrings and target
    /// strings. Following example is a source string and the 
    /// str1 located is "greeting"
    ///
    /// "Hello world greeting and goodbye"
    ///        j     i0
    ///              k0
    ///                      j
    ///                          i0
    ///                          k0

    var j = 0;
    var k = 0;
    var i = 0;
    var i0 = 0;
    var k0 = 0;
    var out = '';
    src = src || '';
    while (j < src.length) {
      i0 = src.length;
      k0 = map.length;
      for (k=0; k < map.length; k+=2) {
        var str1 = map[k];
        var str2 = map[k+1];
        var i = src.indexOf(str1,j);
        if (i < 0) {
          continue
        }
        /// save the i that is the least
        if (i < i0) {
          i0 = i;
          k0 = k;
        }
      }
      if (k0 < map.length) {
        /// found!
        var str1 = map[k0];
        var str2 = map[k0+1];
        out += src.slice(j,i0);
        out += str2;
        j = i0 + str1.length;
      } else {
        /// we are done, none of the substrings exists!
        out += src.slice(j);
        j = src.length;
      }
    }
    return out;
  }

  isHan (cc) {
    ///
    /// Given a character code and returns true if it is considered a CJK unified character
    ///

    if (cc >= 0x4E00 && cc <= 0x9FFF) {
      return true;
    } else {
      return false;
    }
  }

  joinLine (s0, s1) {
    ///
    /// join two lines
    ///

    s1 = s1.trimLeft();
    if (!s0) {
      return s1;
    } else if (!s1) {
      return s0;
    } else if (this.isHan(s0.charCodeAt(s0[s0.length-1])) && this.isHan(s1.charCodeAt(0))) {
      return s0.concat(s1);
    } else {
      return s0 + ' ' + s1;
    }
  }

  joinPara (para) {
    ///
    /// join two lines
    ///

    var line = '';
    for (var s of para) {
      line = this.joinLine(line,s);
    }
    return line;
  }

  fontifyLATEX (text) {
    ///
    /// fontify in the style of Latex
    ///


    const fontnames = ['jp','tw','cn','kr'];
    var newtext = '';
    var c0 = ''
    var s0 = '';
    var fns0 = 0;

    for (var j=0; j < text.length; ++j) {

      var c = text[j];
      var cc = text.charCodeAt(j);

      if (cc >= 128 && cc <= 0xFFFF) {
        var fns = fontmap[cc];
      } else {
        var fns = 0
      }

      /// check to see if this char has the same font as the last one
      var fns0 = fns0 & fns; /// bitwise-AND
      if (fns0) {
        /// get the first font: assign 'k' according to the followin rules:
        ////  0b0001 => 0, 0b0010 => 1; 0b0011 => 0; 0b0100 => 2
        var k = 0;
        for (k=0; k < fontnames.length; ++k) {
          if (fns0 & (1 << k)) {
            break;
          }
        }
        var fn = fontnames[k];
        if (fn) {
          /// building up s0 by combining with previous 'c0' and 's0'
          var c0 = c0 + c;
          var s0 = `\\${fn}{${c0}}`;
          continue
        }
      }

      /// by the time we get here the 'c' is either a CJK that does
      //// not agree with previous character in terms of the same font;
      //// or 'c' is not a CJK at all.
      newtext += s0;
      fns0 = 0;
      c0 = '';
      s0 = '';

      /// it is CJK if 'fns' is not zero
      if (fns) {
        /// get the first font: assign 'k' according to the followin rules:
        ////  0b0001 => 0, 0b0010 => 1; 0b0011 => 0; 0b0100 => 2
        var k = 0;
        for (k=0; k < fontnames.length; ++k) {
          if (fns & (1 << k)) {
            break;
          }
        }
        /// pick a font name
        var fn = fontnames[k];
        /// save the current font map infor for this char
        var fns0 = fns;
        var c0 = c;
        var s0 = `\\${fn}{${c0}}`;
        continue;
      }

      /// we get here if the 'c' is not a CJK
      newtext += c;
    }

    newtext += s0;
    return newtext;
  }

  expandString (text, n, c) {
    text = ''+text; /// cast into a string
    var cc = ''+c; /// cast into a string
    if (cc.length > 0) {
      var diff = n - text.length;
      for (var j=0; j < diff; ++j) {
        text += cc;
      }
    }
    return text;
  }

  matrixMaxJ (matrix) {
    ///
    /// Return the MaxJ of the matrix
    ///

    var maxj = 0;
    for (var row of matrix) {
      var maxj = row.length > maxj ? row.length : maxj;
    }
    return maxj;
  }

  expandList (row,maxj,data) {
    ///
    /// Expand an array so that it has at least this number of
    /// elements.
    ///
 
    data = data || '';
    while (row.length < maxj) {
      row.push(data);
    }
    return row;
  }

  toSubfigNum (j) {
    ///
    /// Given an integer, return the subfig number: 0 -> a, 1 -> b
    ///

    return this.subfignums[j];
  }

  toEllipsedText (text,m) {
    ///
    /// Return part of the text trimmed at 5 characters, and if it is longer than 5 characters it will be appended ...
    ///

    if (text.length > m) {
      return text.slice(0,m) + '...';
    }
    return text;
  }

  newPART (subpart) {

    /// create a new 'PART' block

    var fencecmd = {};
    var dept = '';
    var hidden = false;
    var caption = '';
    var fig = '';
    var id = ``;
    var fname = '';
    var plevel = 0;
    return [id,-1,-1,'PART',0,subpart,[],fencecmd,dept,fig,caption,hidden,fname,plevel];

  }

  newFILE (fname,plevel) {

    /// create a new 'FILE' block

    var fencecmd = {};
    var dept = '';
    var hidden = false;
    var caption = '';
    var fig = '';
    var id = `${this.toBase(fname)}::`;
    return [id,-1,-1,'FILE',0,[],[],fencecmd,dept,fig,caption,hidden,fname,plevel];

  }

  newFEND (fname,plevel) {

    /// create a new 'FEND' block

    var fencecmd = {};
    var dept = '';
    var hidden = false;
    var caption = '';
    var fig = '';
    var id = `${this.toBase(fname)}::`;
    return [id,-1,-1,'FEND',0,[],[],fencecmd,dept,fig,caption,hidden,fname,plevel];

  }

  newHDGS (str,fname,plevel) {

    /// create a new 'HDGS/0' block

    var fencecmd = {};
    var dept = '';
    var caption = '';
    var fig = '';
    return ['',-1,-1,'HDGS',0,[0,str],[],fencecmd,dept,fig,caption,hidden,fname,plevel];

  }

  chomp (text) {
    ///
    /// Remove the last character of a string.
    ///

    text = text || '';
    text = ''+text;
    return text.slice(0,text.length-1);
  }

  champ (text) {
    ///
    /// Remove the first and last character of a string.
    ///

    text = text || '';
    text = ''+text;
    return text.slice(1,text.length-1);
  }

  toList (text) {

    ///
    /// Turn a text into a list separated by one or more spaces
    ///

    text = text || '';
    text = ''+text;
    var pp = text.split(' ');
    pp = pp.filter(x => x.length);
    return pp;
  }

  splitFenceCmd (fencecmd) {
    ///
    /// split a fencecmd such as 'n;javascript' into array and then set them attributes
    ///

    var o = {};
    for (var v of fencecmd.split(';')) {
      o[v] = 1;
    }
    return o;
  }

  fromStyle (line) {
    ///
    /// convert from a string that is 'width:1cm;height:2cm' to an object that has width and height as its attributes and 1cm and 2cm set as the values
    ///

    return line.split(';').map(x => x.split(':'))
        .reduce((acc,curr) => {
            if (curr.length == 2) {
              var key = curr[0].trim();
              var val = curr[1].trim();
              if (key) {
                acc[key] = val;
              }
            } else if (curr.length == 1) {
              var key = curr[0].trim();
              var val = 1;
              if (key) {
                acc[key] = val;
              }
            }
            return acc;
        }, {});
  }

  hideBlocks (blocks,hiddendepts) {

    var o = [];
    for (var block of blocks) {
      const [id,row1,row2,sig,n,data,para,fencecmd,dept,fig,caption,hidden,fname,plevel] = block;
      if (hiddendepts.hasOwnProperty(dept)) {
        block[this.P_hidden] = true;
      } else {
        block[this.P_hidden] = false;
      }
      o.push(block);
    }
    return o;
  }

  idenXrefs (config,blocks,isarticle) {
      
    /// return an object with mappings from id -> dept that 
    /// can be used to display in PREVIEW the chapter/section/subsection number.
    
    var xrefs = {};
    for (var block of blocks) {
      const [id,row1,row2,sig,n,data,para,fencecmd,dept,fig,caption,hidden,fname,plevel] = block;
      if (sig === 'HDGS') {
        if (xrefs[id]) xrefs[id].push( `${dept}` );
        else xrefs[id] = [dept];
      } else if (fig ) {
        if (xrefs[id]) xrefs[id].push( `${fig}` );
        else xrefs[id] = [fig];
      }
    }
    return xrefs;
    
  }

  idenBlocks (config,blocks,isarticle) {

    /// assign chapter/section/figure/listing numbers for each block
    /// will change the 'dept' field of the block. Returns
    /// a new block.

    var chapnum = 0;
    var secnum = 0;
    var subsecnum = 0;
    var subsubsecnum = 0;
    var subsubsubsecnum = 0;
    var subsubsubsubsecnum = 0;
    var fignum = 0;
    var lstnum = 0;
    var eqnnum = 0;
    var o = [];

    var dept_text = '';
    var fig_text = '';
    var hidden_text = false;
    if (config.outlineOnly) {
      hidden_text = true;
    }
    for (var block of blocks) {
      const [id,row1,row2,sig,n,data,para,fencecmd,dept,fig,caption,hidden,fname,plevel] = block;
      switch (sig) {
        case 'HDGS': {
          var [cat,text,flags] = data;
          if (plevel) {
            cat += plevel;
          }
          switch (cat) {
            case 0:
              chapnum += 1;
              secnum = 0;
              subsecnum = 0;
              subsubsecnum = 0;
              subsubsubsecnum = 0;
              subsubsubsubsecnum = 0;
              fignum = 0;
              lstnum = 0;
              if (isarticle) {
                dept_text = 'title'
              } else {
                dept_text = `${chapnum}`;
              }
              break;
            case 1:
              secnum += 1;
              subsecnum = 0;
              subsubsecnum = 0;
              subsubsubsecnum = 0;
              subsubsubsubsecnum = 0;
              if (isarticle) {
                dept_text = `${secnum}`;
              } else {
                dept_text = `${chapnum}.${secnum}`;
              }
              break;
            case 2:
              subsecnum += 1;
              subsubsecnum = 0;
              subsubsubsecnum = 0;
              subsubsubsubsecnum = 0;
              if (isarticle) {
                dept_text = `${secnum}.${subsecnum}`;
              } else {
                dept_text = `${chapnum}.${secnum}.${subsecnum}`;
              }
              break;
            case 3:
              subsubsecnum += 1;
              subsubsubsecnum = 0;
              subsubsubsubsecnum = 0;
              if (isarticle) {
                dept_text = `${secnum}.${subsecnum}.${subsubsecnum}`;
              } else {
                dept_text = `${chapnum}.${secnum}.${subsecnum}.${subsubsecnum}`;
              }
              break;
            case 4:
              subsubsubsecnum += 1;
              subsubsubsubsecnum = 0;
              if (isarticle) {
                dept_text = `${secnum}.${subsecnum}.${subsubsecnum}.${subsubsubsecnum}`;
              } else {
                dept_text = `${chapnum}.${secnum}.${subsecnum}.${subsubsecnum}.${subsubsubsecnum}`;
              }
              break;
            default:
              subsubsubsubsecnum += 1;
              if (isarticle) {
                dept_text = `${secnum}.${subsecnum}.${subsubsecnum}.${subsubsubsecnum}.${subsubsubsubsecnum}`;
              } else {
                dept_text = `${chapnum}.${secnum}.${subsecnum}.${subsubsecnum}.${subsubsubsecnum}.${subsubsubsubsecnum}`;
              }
              break;
          }
          break;
        }
        case 'PICT': {
          if (fencecmd.figure) {
            fignum += 1;
            if (isarticle) {
              fig_text = `${fignum}`;
            } else {
              fig_text = `${chapnum}-${fignum}`;
            }
          }
          break;
        }
        case 'CODE': {
          if (fencecmd.listing) {
            lstnum += 1;
            if (isarticle) {
              fig_text = `${lstnum}`;
            } else {
              fig_text = `${chapnum}-${lstnum}`;
            }
          }
          break;
        }
        case 'EQTN': {
          eqnnum += 1;
          if (isarticle) {
            fig_text = `${eqnnum}`;
          } else {
            fig_text = `${chapnum}-${eqnnum}`;
          }
          break;
        }
        default: {
          break;
        }
      }
      /// overwrite the 'dept' field of block
      block[this.P_dept] = dept_text;
      block[this.P_fig] = fig_text;
      block[this.P_hidden] = hidden_text;
      fig_text = ''; /// clear the fig_text
      o.push(block);
    }
    return o;
  }

  styleToObject (line) {

    /// converting a line such as 'n' to an object that is {n:1}

    if (/^\w+$/.test(line)) {
      var o = {};
      o[line] = true;
      return o;
    }

    /// otherwise champ the first and the last character
    /// and try it again: [width:1in; height: 2in]

    line = this.champ(line);
    var pp = line.split(';');
    var o = {};
    for (var s of pp) {
      var kk = s.split(':');
      var key = '';
      var val = '';
      if (kk.length == 1) {
        var key = kk[0].trim();
        var val = '1'; /// this should always be a text string
                       /// as user might type 'columns' and then
                       /// this 'columns' field will have a value
                       /// that is '1'.
      } else if (kk.length == 2) {
        var key = kk[0].trim();
        var val = kk[1].trim();
      }
      if (key) {
        o[key] = val;
      }
    }
    return o;
  }

  parseFLAGS (lines) {

    /// parse the lines and return a set of flags:
    ///
    /// : author = James
    /// : subject = Technical
    ///

    var o = {};
    var re = /^\:\s*(\w+)\s*\=\s*(.*)$/;
    for (var line of lines) {
      var v = re.exec(line);
      if (v) {
        var key = v[1];
        var val = v[2];
        o[key] = val;
      }
    }
    return o;
  }

  parseFILES (lines) {

    /// parse the lines and return a set of flags:
    ///
    /// > intro.md
    /// >> intro1.md
    ///

    var o = [];
    for (var line of lines) {
      var v = this.re_files.exec(line);
      if (v) {
        var sublevel = v[1].length - 1;
        var subfname = v[2].trim();
        o.push([sublevel,subfname,'']);
        continue;
      }
      var v = this.re_parts.exec(line);
      if (v) {
        var sublevel = -1;
        var subpart = v[2].trim();
        o.push([sublevel,'',subpart]);
        continue;
      }
    }
    return o;
  }

  toSid (id, label) {

    /// return a new customized label id
    /// ('d3js:31', 'intro') -> 'd3js:intro'

    if (label) {
      var v = id.split(':');
      v[1] = label;
      return v.join(':');
    }
    return id;
  }

  toBase (str) {
    var v4 = this.re_base.exec(str);
    if (v4) {
      return v4[1];
    }
    return '';
  }

  toRef (str) {
    var v4 = this.re_ref.exec(str);
    if (v4) {
      return v4[1];
    }
    return '';
  }

  getConfig (name, obj, configSchema) {

    if (!configSchema || !configSchema.hasOwnProperty(name)) {
      return undefined;
    }
    var entry = configSchema[name];
    /// return the property of an object if exist,
    /// otherwise return the default value
    if (obj.hasOwnProperty(name)) {
      var val = obj[name];
    } else {
      var val = entry['default'];
    }
    switch (entry['type']) {
      case 'boolean': {
        return this.getBool(val);
        break;
      }
      case 'integer': {
        try {
          val = parseInt(val);
        } catch(e) {
          val = 0;
        }
        if (isNaN(val)) {
          val = 0;
        }
        if (entry.hasOwnProperty('minimum')) {
          var the_minimum = parseInt(entry['minimum']);
          if (val < the_minimum) {
            val = the_minimum;
          }
          var the_maximum = parseInt(entry['maximum']);
          if (val > the_maximum) {
            val = the_maximum;
          }
        }
        return val;
        break;
      }
      case 'number': {
        try {
          val = parseFloat(val);
        } catch(e) {
          val = 0;
        }
        if (isNaN(val)) {
          val = 0;
        }
        if (entry.hasOwnProperty('minimum')) {
          var the_minimum = parseFloat(entry['minimum']);
          if (val < the_minimum) {
            val = the_minimum;
          }
          var the_maximum = parseFloat(entry['maximum']);
          if (val > the_maximum) {
            val = the_maximum;
          }
        }
        return val;
        break;
      }
      case 'string': {
        if (entry.hasOwnProperty('enum')) {
          var the_enum = entry['enum'];
          if (the_enum.indexOf(val) < 0) {
            val = the_enum[0];
          }
        }
        return val;
        break;
      }
      case 'list': {
        return this.toList(val);
        break;
      }
      default: {
        return val;
        break;
      }
    }
    return undefined;
  }

  getBool (val) {

    ///
    /// given a string, return a boolean value
    ///
    /// getBool("1"); //true
    /// getBool("0"); //false
    /// getBool("true"); //true
    /// getBool("false"); //false
    /// getBool("TRUE"); //true
    /// getBool("FALSE"); //false
    ///

    var num = +val;
    return !isNaN(num) ? !!num : !!String(val).toLowerCase().replace(!!0,'');
  }

  async readFileAsync (filename) {

    /// Returns a Promise that resolves to a string of
    /// the entire file content being read

    return new Promise((resolve, reject)=>{
        fs.readFile(filename, "utf8", function(err, data) {
                if (err) {
                  reject(err.toString());
                } else {
                  resolve(data.toString());
                }
        });
    });
  }

  async writeFileAsync (filename, data) {

    /// Returns a Promise that resolves to a string of
    /// the entire file content being read

    return new Promise((resolve, reject)=>{
        fs.writeFile(filename, data, 'utf8', function(err) {
                if (err) {
                  reject(err.toString());
                } else {
                  resolve(filename);
                }
        });
    });
  }

}

module.exports = { NitrilePreviewParser };
