'use babel';

const path = require('path');
const fontmap = require('./nitrile-preview-fontmap');

class NitrilePreviewParser {

  constructor() {
    this.blocks = []; /// the list of all blocks to be converted
    this.block = null;  /// the active block to be converted
    this.subfignums = ['a','b','c','d','e','f','g','h','i','j','k','l','m',
       'n','o','p','q','r','s','t','u','v','w','x','y','z'];
  }

  /**
  Return a string that is the HTML. The second and rest
  arguments can be omitted and it will be assumed as
  its sensitive default values.

  The 'fname' argument is given the basename of the
  file which is typically the editor's path, or it
  can also be a chapter file if it comes from a %!BOOK
  block.

  THe 'plevel' parameter is set to 0 typically but
  it can be set to 1 or larger if it is listed
  as "::" or ":::" or other nested levels other than
  chapter. For :: it is 1 and for ::: it is 2,
  and so on. when plevel is passed as 1 then HDGS/0 will
  become HDGS/1, essentially turning a chapter into
  a section, and section into subsection, and so on.

  The last argument is the old block list where new
  blocks will be appended to it. New blocks will be
  added to this list and the resulting list will be
  returned as the return value of this function.
  If it is null then a new block list is created
  and returned.

  */
  toBLOCKS(lines,fname,plevel,o) {
    var ins = '';
    var ins_local = '';
    var ins_text = '';
    var inst_n = 0;
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

    var v = fname.match(/^[\w\-]+/); /// extra a base off it
    if (v) {
      base = v[0];
    }

    /// start processing all lines of the editor
    while (lines.length > 0) {

      var [ para, lines, the_fence ] = this.readPara(lines);
      if (para.length == 0) {
        continue
      } else if (para.length == 1 && para[0] === '') {
        row = nlines;
        nlines++;
        row2 = nlines;
        continue
      }

      /// increment block count
      ++nblocks;
      row = nlines;
      nlines += para.length;
      row2 = nlines;
      var id = `${base}:${nblocks}`; /// default label, such as 'd3js:15'

      /// Remove the last empty line if any
      if (para[para.length-1].length == 0) {
        para = para.slice(0,para.length-1);
        row2 = row2 - 1;
      }

      /// this is a '%!BOOK' block
      if (para[0] === '%!BOOK') {
        var data = para.slice(1);
        o.push([id,row,row2,'%!BOOK',0,data,para,ins,ins_local,ins_text,fname,plevel]);
        continue;
      }


      /// this is the directive such as .figure
      var re = /^\.(\w+)$/;
      v = re.exec(para[0]);
      if (v) {
        var ins = v[1];
        if (para[1]) {
          var v2 = para[1].match(/^\[\:([\w\-]+)\]$/);
          if (v2) {
            var ins_local = v2[1];
            var ins_text = para.slice(2).join('\n');
            var inst_n = nblocks + 1;
          } else {
            var ins_local = '';
            var ins_text = para.slice(1).join('\n');
            var inst_n = nblocks + 1;

          }
        }
        continue
      }

      /// clear up the directive if it is too old.
      if (nblocks > inst_n ) {
        var ins = '';
        var ins_local = '';
        var ins_text = '';
      }

      // this is the VRSE block
      if (the_fence === '---') {
        var [data, n] = this.trimPara(para);
        var data = this.trimFences(data);
        o.push([id,row,row2,'VRSE',n,data,para,ins,ins_local,ins_text,fname,plevel]);
        continue
      }

      /// this is the VERB block
      if (the_fence === '~~~') {
        var [data, n] = this.trimPara(para);
        var data = this.trimFences(data);
        o.push([id,row,row2,'VERB',n,data,para,ins,ins_local,ins_text,fname,plevel]);
        continue;
      }

      /// this is the PICT block
      if (the_fence === '///') {
        var [data, n] = this.trimPara(para);
        var data = this.trimFences(data);
        var data = this.concatPara(data);
        var data = this.parsePICT(data);
        o.push([id,row,row2,'PICT',n,data,para,ins,ins_local,ins_text,fname,plevel]);
        continue;
      }

      // this is the TABB block
      if (the_fence === '===') {
        var [data, n] = this.trimPara(para);
        var data = this.trimFences(data);
        var data = this.parseTABB(data);
        o.push([id,row,row2,'TABB',n,data,para,ins,ins_local,ins_text,fname,plevel]);
        continue;
      }

      // this is the TERM block
      if (the_fence === '<<<') {
        var [data, n] = this.trimPara(para);
        var data = this.trimFences(data);
        var data = this.parseTERM(data);
        o.push([id,row,row2,'TERM',n,data,para,ins,ins_local,ins_text,fname,plevel]);
        continue;
      }

      // this is the QUOT block
      if (the_fence === '\"\"\"') {
        var [data, n] = this.trimPara(para);
        var data = this.trimFences(data);
        var data = this.joinPara(data);
        o.push([id,row,row2,'QUOT',n,data,para,ins,ins_local,ins_text,fname,plevel]);
        continue;
      }

      /// this is the DEF1 block
      var re = /^(\@{1})\s+(\S.*)$/;
      if (re.test(para[0])) {
        var data = this.parseDEF(para,re);
        o.push([id,row,row2,'DEF1',n,data,para,ins,ins_local,ins_text,fname,plevel]);
        continue;
      }

      /// this is the DEF2 block
      var re = /^(\@{2})\s+(\S.*)$/;
      if (re.test(para[0])) {
        var data = this.parseDEF(para,re);
        o.push([id,row,row2,'DEF2',n,data,para,ins,ins_local,ins_text,fname,plevel]);
        continue;
      }

      /// this is the DEF3 block
      var re = /^(\@{3})\s+(\S.*)$/;
      if (re.test(para[0])) {
        var data = this.parseDEF(para,re);
        o.push([id,row,row2,'DEF3',n,data,para,ins,ins_local,ins_text,fname,plevel]);
        continue;
      }

      /// this is the PRIM block
      var re = /^\[\s+(.*?)\s+\]\s*(.*)$/;
      var v = re.exec(para[0]);
      if (v) {
        var lead = v[1];
        var text = v[2];
        for (i=1; i < para.length; ++i) {
          /// candidate for line join
          text = this.joinLine(text,para[i]);
        }
        var data = [lead,text];
        o.push([id,row,row2,'PRIM',0,data,para,ins,ins_local,ins_text,fname,plevel]);
        continue;
      }

      /// this is the SECO block
      var re = /^\[\[\s+(.*?)\s+\]\]\s*(.*)$/;
      var v = re.exec(para[0]);
      if (v) {
        var lead = v[1];
        var text = v[2];
        for (i=1; i < para.length; ++i) {
          /// candidate for line join
          text = this.joinLine(text,para[i]);
        }
        var data = [lead,text];
        o.push([id,row,row2,'SECO',0,data,para,ins,ins_local,ins_text,fname,plevel]);
        continue;
      }

      /// This is a PLST block
      var re = /^(\s*)(\-|\*|\d+.)\s+\S/;
      v = re.exec(para[0]);
      if (v) {
        var [data, n] = this.trimPara(para);
        var data = this.parsePLST(data);
        o.push([id,row,row2,'PLST',n,data,para,ins,ins_local,ins_text,fname,plevel]);
        continue
      }

      /// this is the HDGS block
      var re = /^(\#{1,})\s+(.*)$/;
      if ((v = re.exec(para[0])) !== null) {
        var cat = v[1];
        var text = v[2];
        if (para[1]) {
          var v1 = para[1].match(/^\[\:([\w\-]+)\]$/);
          if (v1) {
            var local = v1[1];
            id = `${base}:${local}`; /// custom label, such as 'd3js:intro'
          }
        }
        var data = [cat.length,text];
        o.push([id,row,row2,'HDGS',0,data,para,ins,ins_local,ins_text,fname,plevel]);
        continue;
      }

      /// first block that is of a regular paragraph
      /// is treated as a HDGS/0 block
      if (nblocks == 1) {
        var text = this.joinPara(para);
        var data = [0,text];
        id = `${base}`; /// a HDGS/0 block's label is only the 'base' part
        o.push([id,row,row2,'HDGS',0,data,para,ins,ins_local,ins_text,fname,plevel]);
        continue;
      }

      // This is a regular paragraph block
      if (true) {
        var [data, n] = this.trimPara(para);
        var data = this.joinPara(data);
        o.push([id,row,row2,'',n,data,para,ins,ins_local,ins_text,fname,plevel]);
        continue;
      }

    }

    return o;
  }

  /*
   Read a paragraph and return the paragraph, the unread lines.
   and the fence if there is any.

   For a paragraph with fence, the returned paragraph is from the
   first fence down the last fence. For a paragraph without fence,
   the first line of the paragraph is the first line and the last
   line of the paragraph is the blank immediately after the last
   non-empty line of the paragraph.
  */
  readPara (lines) {
    var para = [];
    var is_fence = false;
    var the_fence = '';
    for (var i=0; i < lines.length; ++i) {
      var line = lines[i];
      line = line.trimRight();
      if (is_fence) {
        if (line === the_fence) {
          para.push(line);
          break
        }
        para.push(line);
        continue
      }
      if (line.length == 0) {
        para.push(line);
        break
      }
      para.push(line);
      if (para.length == 1) {
        if (/^\s*(\~\~\~|\<\<\<|\/\/\/|\-\-\-|\=\=\=|\"\"\")\s*$/.test(para[0])) {
          is_fence = true;
          the_fence = para[0];
        }
      }
    }
    return [
      para,
      lines.slice(i+1),
      the_fence.trim()
    ];
  }

  /*
  unmask all inline markups within a text
  */
  unmask (text) {
    var cnt;
    var v;
    var str = ' ' + text;
    var start_i = 0;
    var newtext = '';
    let re = /\s\_{2}(.*?)\_{2}|\s\_{1}(.*?)\_{1}|\s\`{3}\s*(.*?)\s*\`{3}|\s\`{2}\s*(.*?)\s*\`{2}|\s\`\s*(.*?)\s*\`|\[\^\^(.*?)\]|\[\^U\+([0-9a-fA-F]+)\]|\[\^\@(.*?)\]|\[\^\/(.*?)\]/g;
    while ((v = re.exec(str)) !== null) {
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
        newtext += this.style('tt',cnt);

      } else if (v[4]) {
        var cnt = v[4];
        newtext += ' ';
        newtext += this.style('tt',cnt);

      } else if (v[5]) {
        var cnt = v[5];
        newtext += ' ';
        newtext += this.style('tt',cnt);

      } else if (v[6]) {
        var cnt = v[6];
        var [rb, rt] = cnt.split(/\s+/);
        if (!rb) {
          rb = '';
        }
        if (!rt) {
          rt = '';
        }
        newtext += this.style('ruby',[rb,rt]);

      } else if (v[7]) {
        /// xunicode: [^U+4f60] /// 你
        var cnt = v[7];
        cnt = String.fromCodePoint('0x' + cnt);
        newtext += this.style('unicode',cnt);

      } else if (v[8]) {
        /// uri: [^@d3js.org]
        var cnt = v[8];
        //newtext = newtext.concat(` <a style='word-break:break-all' href='${cnt}'><tt>${cnt}</tt></a>`);
        newtext += this.style('uri',cnt);

      } else if (v[9]) {
        /// ref: [^/d3js] or [^/d3js:intro] or [^/:intro]

        var labl = v[9].trim();
        var v1 = labl.match(/^([\w\-]+)\:([\w\-]+)$/); /// 'd3js:intro'
        var v2 = labl.match(/^([\w\-]+)$/);  /// 'd3js'
        var v3 = labl.match(/^\:([\w\-]+)$/);   /// ':intro'
        var id = '';
        if (v1) {
          id = labl;  /// this is a label that refers to a heading
                      /// other than the main heading
        } else if (v2) {
          id = labl;  /// this is a label that refers to the main
                      /// heading
        } else if (v3) {
          /// this label does not have a 'base' portion, so
          /// it needs to grab it from the 'id' part of the curr block
          var default_id = this.block[0];
          var v4 = default_id.match(/^([\w\-]+)/);
          if (v4) {
            id = v4[1] + labl;
          }
        }
        if (id) {
          newtext += this.style('ref',id);
        } else {
          newtext += this.escape(`??${labl}??`);
        }
      }
      start_i = re.lastIndex;
    }
    cnt = str.slice(start_i);
    cnt = this.escape(cnt);
    newtext = newtext.concat(cnt);
    newtext = newtext.slice(1);
    return newtext;
  }

  /*
    Find the 'id' of a block given the 'fname'
  */
  findIdForFname (fn, blocks) {
    for (var block of blocks) {
      const [id,row1,row2,type,n,data,para,ins,ins_local,ins_text,fname,plevel] = block;
      if (fname === fn) {
        if (type === 'HDGS') {
          if (data[0] === 0) {
            return id;
          }
        }
      }
    }
    return '';
  }

  /*
  Trim the paragraph on the left side and return the number of
  spaces trimmed
  */
  trimPara (para) {
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

  /*
  Trim the paragraph to remove fences on the top and/or bottom
  */
  trimFences (para) {
    if (para[para.length-1] === para[0]) {
      para = para.slice(1,para.length-1);
    } else {
      para = para.slice(1);
    }
    return para;
  }

  /*
    Concatenate all lines within that paragraph that ends with backslashes
  */
  concatPara (para) {
    var out = [];
    var iscont = false;
    var s0 = '';
    for (var line of para) {
      if (iscont) {
        var s = out[out.length-1];
        s = s.slice(0,s.length-1);
        s += ' '
        s += line;
        out[out.length-1] = s;
      } else {
        out.push(line);
      }
      iscont = line.endsWith('\\');
    }
    return out;
  }

  /*
    Break a line into multiple segments based on three-spaces
  */
  splitLineThreeSpaces (line) {
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

  /*
    Parse the PICT
  */
  parsePICT (para) {
    /// image [width:100%;height:4cm] (tree.png tree.pdf)
    /// image [width:4cm] (frog.png frog.pdf)
    var o = [];
    for (var line of para) {
      var re = /^\s*image\s+\[(.*?)\]\s+\((.*?)\)\s*(.*)$/;
      var v = re.exec(line);
      if (v) {
        var opts = v[1].split(';').map(x => x.split(':'))
            .reduce((acc,curr) => {
                acc[curr[0]] = curr[1];
                return acc;
            }, {});
        var srcs = v[2].split(' ').filter(x => x.length);
        var sub = v[3];
        o.push(['image',opts,srcs,sub]);
        continue;
      }
    }
    return o;
  }

  /*
    Parse the TABB
  */
  parseTABB (para) {
    ///  Informal negative        簡単ではない\
    ///                           簡単じゃない
    ///  Informal past            簡単だった
    ///  Informal negative past   簡単ではなかった\
    ///                           簡単じゃなかった
    ///  Formal                   簡単です
    ///  Formal negative          簡単ではありません\
    ///                           簡単じゃありません
    ///  Formal past              簡単でした

    var o = [];
    var iscont = false;
    for (var row of para) {
      var pp = this.splitLineThreeSpaces(row);
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
            s += pp[j];
            pp0[i] = s;
            j++;
          } else if (s.endsWith('\\')) {
            s = s.slice(0,s.length-1);
            s += ' ';
            s += pp[j];
            pp0[i] = s;
            j++;
          }
        }
        o[o.length-1] = pp0;
      } else {
        o.push(pp);
      }
      iscont = pp.some(x => x.endsWith('\\'));
    }
    return o;
  }

  /*
  Parse the DEF1, DEF2, and DEF3 block
  */
  parseDEF (para, re) {
    var text = '';
    var keys = [];
    var n = 0;
    for (i=0; i < para.length; ++i) {
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
    return [ keys, text, n ];
  }

  /*
  Parse the paragraph that is PLST
  */
  parsePLST (para) {
    var items = [];
    //
    var levels = [];
    var lead = '';
    var bull = '';
    var bullet = ''
    //
    var i = 0;
    var re = /^(\s*)(\-|\*|\d+\.)\s+(.*)$/;
    //
    for (i in para) {
      var line = para[i];
      var v = re.exec(line);
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
        if (bullet === '-') {
          items.push(['UL','',text]);
          levels.push([lead,'UL']);
          bull = 'UL';
        } else if (bullet === '*') {
          items.push(['UL','',text]);
          levels.push([lead,'UL']);
          bull = 'UL';
        } else {
          items.push(['OL',bullet.slice(0,bullet.length-1),text]);
          levels.push([lead,'OL']);
          bull = 'OL';
        }
      } else if (action === 'pop') {
        if (bull === 'OL') {
          items.push(['/OL',bullet.slice(0,bullet.length-1),text]);
        } else {
          items.push(['/UL','',text]);
        }
        [lead,bull] = levels.pop();
      } else if (action === 'item') {
        if (bull === 'OL') {
          items.push(['LI',bullet.slice(0,bullet.length-1),text]);
        } else {
          items.push(['LI','',text]);
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

  /*
  */
  parseTERM (para) {
    var out = [];
    for (var line of para) {
      if (/^\S/.test(line)) {
        out.push(line);
        out.push('');
      } else if (out.length > 0) {
        out[out.length-1] = this.joinLine(out[out.length-1],line);
      }
    }
    return out;
  }

  /*
    parse BOOK block
  */
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

  /*
    perform replacements given a list of substrings and target
    strings.
  */
  replaceSubstrings (src, map) {
    var j = 0;
    var k = 0;
    var out = '';
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

  /*
    Given a character code and returns true if
    it is considered a CJK unified character
  */
  isHan (cc) {
    if (cc >= 0x4E00 && cc <= 0x9FFF) {
      return true;
    } else {
      return false;
    }
  }

  /*
    join two lines
  */
  joinLine (s0, s1) {
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

  /*
    join two lines
  */
  joinPara (para) {
    var line = '';
    for (var s of para) {
      line = this.joinLine(line,s);
    }
    return line;
  }

  /*
    fontify in the style of Latex
  */
  fontifyLATEX (text) {

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

  /*
    Return the MaxJ of the matrix
  */
  matrixMaxJ (matrix) {
    var maxj = 0;
    for (var row of matrix) {
      var maxj = row.length > maxj ? row.length : maxj;
    }
    return maxj;
  }

  /*
    Expand an array so that it has at least this number of
    elements.
  */
  expandRow (row,data,maxj) {
    while (row.length < maxj) {
      row.push(data);
    }
    return row;
  }

  /*
    Given an integer, return the subfig number: 0 -> a, 1 -> b
    */
  toSubfigNum (j) {
    return this.subfignums[j];
  }

  /*
    Return part of the text trimmed at 5 characters, and if it
    is longer than 5 characters it will be appended ...
    */
  toEllipsedText (text,m) {
    if (text.length > m) {
      return text.slice(0,m) + '...';
    }
    return text;
  }
}

module.exports = { NitrilePreviewParser };
