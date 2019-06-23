'use babel';

class SphinxPreviewParser {

  constructor() {
  }

  /*
  Return a string that is the HTML
  */
  toBLOCKS(lines) {
    var the_directive = '';
    var the_directive_n = 0;
    var v = '';
    var n = 0;
    var i = 0;
    var o = [];
    var nblocks = 0;
    var nlines = 0;
    var row = 0;
    var row2 = 0;

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

      /// Remove the last empty line if any
      if (para[para.length-1].length == 0) {
        para = para.slice(0,para.length-1);
        row2 = row2 - 1;
      }

      /// the very first block is treated as a 'SECT' block
      if (nblocks == 1) {
        var text = para.join(' ');
        o.push([nblocks,row,row2,'SECT',0,text]);
        continue;
      }

      /// this is the directive such as [@itemize]
      var re = /^\[\@(\w+)\]$/;
      v = re.exec(para[0]); 
      if (v) {
        the_directive = v[1];
        the_directive_n = nblocks + 1;
        continue
      }

      /// clear up the directive if it is too old.
      if (nblocks > the_directive_n ) {
        the_directive = ''
      }

      // this is the VRSE block
      if (the_fence === '---') {
        [para, n] = this.trimPara(para);
        para = this.trimFences(para);
        o.push([nblocks,row,row2,'VRSE',n,para]);
        continue
      }

      /// this is the CODE block
      if (the_fence === '~~~') {
        [para, n] = this.trimPara(para);
        para = this.trimFences(para);
        o.push([nblocks,row,row2,'CODE',n,para]);
        continue;
      }

      /// this is the PGFP block
      if (the_fence === '///') {
        [para, n] = this.trimPara(para);
        para = this.trimFences(para);
        o.push([nblocks,row,row2,'PGFP',n,para]);
        continue;
      }

      // this is the TERM block
      if (the_fence === '<<<') {
        [para, n] = this.trimPara(para);
        para = this.trimFences(para);
        para = this.parseTERM(para);
        o.push([nblocks,row,row2,'TERM',n,para]);
        continue;
      }

      /// this is the DEF1 block
      if (/^(\@{1})\s+(\S.*)$/.test(para[0])) {
        var [ keys, text, n ] = this.parseDEF1(para);
        para = [keys,text]
        o.push([nblocks,row,row2,'DEF1',n,para]);
        continue;
      }

      /// this is the DEF2 block
      if (/^(\@{2})\s+(\S.*)$/.test(para[0])) {
        var [ keys, text, n ] = this.parseDEF2(para);
        para = [keys,text]
        o.push([nblocks,row,row2,'DEF2',n,para]);
        continue;
      }

      /// this is the DEF3 block
      if (/^(\@{3})\s+(\S.*)$/.test(para[0])) {
        var [ keys, text, n ] = this.parseDEF2(para);
        para = [keys,text]
        o.push([nblocks,row,row2,'DEF3',n,para]);
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
          text = text.concat(` ${para[i].trimLeft()}`);
        }
        para = [lead,text];
        o.push([nblocks,row,row2,'PRIM',0,para]);
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
          text = text.concat(` ${para[i].trimLeft()}`);
        }
        para = [lead,text];
        o.push([nblocks,row,row2,'SECO',0,para]);
        continue;
      }

      /// this is the HDGS block
      var re = /^(\#{1,})\s+(.*)$/;
      if ((v = re.exec(para[0])) !== null) {
        var cat = v[1];
        var text = v[2];
        for (i=1; i < para.length; ++i) {
          /// candidate for line join
          text = text.concat(` ${para[i].trimLeft()}`);
        }
        para = [cat.length,text];
        o.push([nblocks,row,row2,'HDGS',0,para]);
        continue;
      }

      /// This is a PLST block
      var re = /^(\s*)(\-|\*|\d+.)\s+\S/;
      v = re.exec(para[0]);
      if (v) {
        [para, n] = this.trimPara(para);
        para = this.parsePLST(para);
        o.push([nblocks,row,row2,'PLST',n,para]);
        continue
      }

      // This is a default block      
      if (true) {
        [para, n] = this.trimPara(para);
        /// a candidate for line join
        para = para.join(' ');
        o.push([nblocks,row,row2,'',n,para]);
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
        if (/^\s*(\~\~\~|\<\<\<|\/\/\/|\-\-\-)\s*$/.test(para[0])) {
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
    let re = /\s\_{2}(.*?)\_{2}|\s\_{1}(.*?)\_{1}|\s\`{3}\s*(.*?)\s*\`{3}|\s\`{2}\s*(.*?)\s*\`{2}|\s\`\s*(.*?)\s*\`|\[\^\^(.*?)\]|\[\^U\+([0-9a-fA-F]+)\]|\[\^\@(.*?)\]/g;
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
        if (rb) {
          rb = this.escape(rb);
        } else {
          rb = '';
        }
        if (rt) {
          rt = this.escape(rt);
        } else {
          rt = '';
        }
        //newtext = newtext.concat(`<ruby><rb>${rb}</rb><rt>${rt}</rt></ruby>`);
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
  Parse DEF1 block
  */
  parseDEF1 (para) {
    var re = /^(\@{1})\s+(\S.*)$/;
    return this.parseDEFS(para,re);
  }

  /*
  Parse DEF2 block
  */
  parseDEF2 (para) {
    var re = /^(\@{2})\s+(\S.*)$/;
    return this.parseDEFS(para,re);
  }

  /*
  Parse DEF3 block
  */
  parseDEF3 (para) {
    var re = /^(\@{3})\s+(\S.*)$/;
    return this.parseDEFS(para,re);
  }

  /*
  Parse the DEF1, DEF2, and DEF3 block
  */
  parseDEFS (para, re) {
    var text = '';
    var keys = [];
    var n = 0;
    for (i=0; i < para.length; ++i) {
      if (text) {
        text = text.concat(` ${para[i].trimLeft()}`);
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
          text0 = text0.concat(` ${line}`);
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
    for (i in para) {
      var v = para[i];
      if (/^\S/.test(v)) {
        out.push(v);
        out.push('');
      } else {
        if (out.length > 0) {
          /// join line candidate
          out[out.length-1] = out[out.length-1].concat(`${v}`);
        }
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
}

module.exports = { SphinxPreviewParser };

