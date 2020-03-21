'use babel';

const path = require('path');
const fs = require('fs');
const fontmap = require('./nitrile-preview-fontmap');
const json_rubymap = require('./nitrile-preview-rubymap.json');
const json_config = require('./nitrile-preview-config.json');
const json_math = require('./nitrile-preview-math.json');
const C_textrightarrow = String.fromCharCode(8594);
const N_stepspaces = 2;
const N_sampspaces = 4;

class NitrilePreviewParser {


  constructor() {
    this.block0 = [];  /// the block immediately before the active block during 'unmask'
    this.block = [];  /// the active block during 'unmask'
    this.contentBlockCount = 0; /// the accumulating count of content blocks for this dept
    this.subfignums = ['a','b','c','d','e','f','g','h','i','j','k','l','m',
       'n','o','p','q','r','s','t','u','v','w','x','y','z'];
    this.re_sampfence = /^\s*\~{3,}$/;
    this.re_fence = /^\s*(\`\`\`)\s*(\w+\*|\w+|)$/;
    this.re_unmask = /\s\_{2}(.*?)\_{2}|\s\_{1}(.*?)\_{1}|\`\`(\s*.*?\s*)\`\`|\`(\s*.*?\s*)\`|\[(.*?)\]\((.*?)\)|\s\*([\w\-]+)\*|\[\[\&(\w+)\;\]\]|\[\[\^(\S+)\^\]\]|\[\[\#(\S+)\#\]\]/g;
    this.re_local = /^\:([\w\-]+)$/;
    this.re_full = /^([\w\-]+)\:([\w\-]+)$/;
    this.re_texcomment  = /^\%\s+\!TEX\s*(.*)$/;
    this.re_ntrflag     = /^nitrile\s+(.*?)\s*\=\s*(.*)\s*$/;
    this.re_fencecmd    = /^\.(\w+)\s*(.*)$/;
    this.re_four_spaces = /^\s{4}/;
    this.re_base = /^([\w\-]+)/;
    this.re_ref = /^([\w\-\:]+)/;
    this.re_enum = /^(\s*)(\(\d+\))\s+(.*)$/;
    this.re_plst = /^(\s{2,})(\-|\+|\*|\d+\.|\d+\))\s+(.*)$/;
    this.re_hdgs = /^(\#{1,})\s+(.*)$/;
    this.re_part = /^(\#{1,})\s+(.*)\s+\1$/;
    this.re_cite = /^(\>{1,})\s+(.*)$/;
    this.re_files = /^(\>{1,})\s+(.*)$/;
    this.re_verbatim = /^(\s*)/;
    this.re_leadspaces = /^(\s*)/;
    this.re_image = /^image\s*\[(.*?)\]\s*\((.*?)\)\s*(.*)$/;
    this.re_alt_tabb = /^\s*\-{1,}(\|\-{1,})+$/;
    this.re_alt_tabb2 = /^\s*\|\-{1,}(\|\-{1,})+\|$/;
    this.re_para = /^\[\s*\]\s*(.*)$/;
    this.re_prim = /^\[\s+(.+?)\s+\]\s*(.*)$/;
    this.re_seco = /^\[\[\s+(.*?)\s+\]\]\s*(.*)$/;
    this.re_entityi = /^\&\#(.*)\;$/;
    this.re_displaymath = /^\`\`(.*)\`\`$/;
    this.re_tabular = /^|/;
    this.unicode_right_arrow = String.fromCharCode(8594);
    this.rubymap = this.buildRubyMap(json_rubymap);

  }

  toFlow(lines,plevel,fname,o=null) {

    /*
    This func returns an arrow of two elements. The first one is an array of 
    blocks. The second element is an object of flags. 

    The first one is an arry of blocks. Each block is an array of 11 elements. 
    Following is a description:

    [0] id: an id, used as HTML id= attribute, such as 'nitrile-preview-block-1'
    [1] row1: the first line number in the original MD file
    [2] row2: the last line number in the original MD file
    [3] sig: the signature of the block: 'TEXT', 'SAMP', 'LIST', 'equation*', etc.
    [4] subrow: initially set to empty string, but will be filled with a number by
        this.mergeBlocks() if this document is a child document. This number then
        denotes the source line number in the master file that imports this child doc
    [5] data: the parsed structured data for this block. The exact details of the 
        structure is dependent on the type of the block.
    [6] para: the untempered line of the source document
    [7] fencecmd: an javascript object of all the flags of this block. The flags are a merged
        copy of the ones provided by the user as well as those provided by the system
        as default in 'toConfig()' method
    [8] star: either an empty string of '*' depending on whether it is a fenced block
        with star placed as the last character.
    [9] base: this is a string that intends to be used for a prefix for all labels.
        It is constructed by taking the basename of the current input file name. This
        is to avoid the situation such that two labels in two different files share 
        the same name thus causing conflect. The 'base' is also used to cross reference
        from one source file to another source file, because the first block is 
        always labeled as 'base:1'. 
    [10] label: this is a string that is the label of the block. Currently this is
        duplicate of the fencecmd.label but it could also be different if the label
        of a block is not set by a fencecmd.
    [11] fname: the filename of the source file, if any. It could also be the 
        file name of the child document.

    */

    var flags = {};
    var label = '';
    var v = '';
    var m = 0;
    var i = 0;
    var nblocks = 0;
    var nlines = 0;
    var row = 0;
    var row2 = 0;
    var base = '';
    var fencecmd = {};
    var plevel = parseInt(plevel);
    var block_type0 = '';
    var long_table_blocks = [];

    if (!Number.isFinite(plevel)) {
      plevel = 0;
    }

    /// initialize the
    if (!o) {
      o = [];
    }
    fname = fname || '';

    /// update 'base'
    var base = this.toBase(path.basename(fname)); /// extra a base off it

    /// start processing all lines of the editor
    while (lines.length > 0) {

      /// save off the previous block type
      block_type0 = block_type;

      var [nread, para, _flags, lines, the_fence, fencecmd, is_sample, block_type] = this.readPara(lines);

      /// increment block count
      ++nblocks;
      row = nlines;
      nlines += nread;
      row2 = nlines;
      var end = para.length-1;

      /// we will merge all the flags
      flags = {...flags, ..._flags};

      /// prepare the HTML id
      const id = `nitrile-preview-block-${base}-${nblocks}`;

      /// set the label to the same as block ID
      if (!fencecmd.label) {
        fencecmd.label = `${nblocks}`;
      }

      /// Remove the last and first empty line if any
      while (para.length && para[para.length-1].length == 0) {
        para.pop();
        row2--;
      }
      while (para.length && para[0].length == 0) {
        para.shift();
        row++;
      }

      /// if sampspaces is set to none-zero check to see if the first
      /// line has enough leading spaces specified by this flag
      if (block_type === 'SAMP' && block_type0 === 'PLST') {

        block_type = 'PLST';

        var [data, m] = this.trimParaAt(para,N_sampspaces); /// m is to be ignored
        var [data,fence,brand] = this.trimSampleFences(data);
        if (fence) {
          o.push([id,row,row2,'SAMP','',data,para,fencecmd,'',base,label,fname]);
        } else {
          o.push([id,row,row2,'ITEM','',data,para,fencecmd,'',base,label,fname]);
        }
        continue;

      } else if (block_type === 'SAMP') {

        var [data, m] = this.trimParaAt(para,N_sampspaces); /// m is to be ignored
        var [data,fence,brand] = this.trimSampleFences(data);
        o.push([id,row,row2,'SAMP','',data,para,fencecmd,'',base,label,fname]);
        continue;

      } else if (block_type === 'HDGS') {

        var v = this.re_hdgs.exec(para[0]);
        var v2 = this.re_part.exec(para[0]);

        if (v2) {
          /// # Part 1: Background #
          /// ## Part 1: Background ##
          /// ### Part 1: Background ###
          /// #### Part 1: Background ####
          var text = v2[2];
          o.push([id,row,row2,'PART','',text,para,fencecmd,'',base,label,fname]);
          continue;
        }
        var hdgn = v[1].length + plevel;
        var text = v[2];
        var data = [hdgn,text];
        o.push([id,row,row2,'HDGS','',data,para,fencecmd,'',base,label,fname]);
        continue;

      } else if (block_type === '' && the_fence === '```' ) {

        /// trim the paragraph to remove any indenting spaces
        var [data, m] = this.trimPara(para);

        var [data,fence,brand] = this.trimFences(data);
        brand = brand.toLowerCase(brand);
        brand = brand || 'LSTG';
        if (brand.endsWith('*')) {
          var sig = brand.slice(0,brand.length-1);
          var star = '*';
        } else {
          var sig = brand;
          var star = '';
        }
        if (sig === 'imgs') {

          data = this.parseIMGS(data);
          o.push([id,row,row2,'IMGS','',data,para,fencecmd,star,base,label,fname]);

        } else if (sig === 'diagram') {

          data = this.parseDIAGRAM(data);
          o.push([id,row,row2,'DIAG','',data,para,fencecmd,star,base,label,fname]);

        } else if (sig === 'tabbing') {

          data = this.parseLINETABULAR(data);
          o.push([id,row,row2,'TABB','',data,para,fencecmd,star,base,label,fname]);

        } else if (sig==='equation'||sig==='subequations'||sig==='equations'||sig==='multline') {

          data = this.parseEQTN(data);
          o.push([id,row,row2,sig,'',data,para,fencecmd,star,base,label,fname]);

        } else if (sig === 'tabular') {

          data = this.parseLINETABULAR(data);
          o.push([id,row,row2,'TBLR','',data,para,fencecmd,star,base,label,fname]);

        } else if (sig === 'dt') {

          data = this.parseDT(data);
          o.push([id,row,row2,'DLST','',data,para,fencecmd,star,base,label,fname]);

        } else {

          o.push([id,row,row2,sig,'',data,para,fencecmd,star,base,label,fname]);

        }
        continue;

      } else if (this.isShortTable(para)) {

        var data = this.parseShortTable(para);
        o.push([id,row,row2,'TBLR','',data,para,fencecmd,'',base,label,fname]);
        block_type = 'tabular';
        continue

      } else if (this.isLongTablePara(para)) {

        if (block_type0 === 'longtablepara') {
          var bl = o.pop();
          var data = bl[5];
          var srow = this.parseLongTablePara(para);
          data[0].push(srow);
          bl[2] = row2;
          bl[5] = data;
          o.push(bl);
        } else {
          var srow = this.parseLongTablePara(para);
          var maxj = srow.length;
          var data = [[srow],maxj,this.toWW(maxj)];
          o.push([id,row,row2,'LONG','',data,para,fencecmd,'',base,label,fname]);
        }
        block_type = 'longtablepara';
        continue

      } else if (this.isDtListPara(para)) {

        if (block_type0 === 'dtlistpara') {
          var bl = o.pop();
          var data = bl[5];
          var nitems = this.parseDtListPara(para);
          for (var item of nitems) {
            data.push(item);
          }
          bl[2] = row2;
          bl[5] = data;
          o.push(bl);
        } else {
          var data = this.parseDtListPara(para);
          o.push([id,row,row2,'DLST','',data,para,fencecmd,'',base,label,fname]);
        }
        block_type = 'dtlistpara';
        continue

      } else if ((v = this.re_plst.exec(para[0])) !== null) {

        /// trim it first before parse
        var [data, m] = this.trimPara(para);
        var data = this.parsePLST(para);
        o.push([id,row,row2,'PLST','',data,para,fencecmd,'',base,label,fname]);
        block_type = 'PLST';
        continue

      } else if ((v = this.re_cite.exec(para[0])) !== null) {

        /// this is the CITE block:
        ///
        /// > ch1.md
        /// > ch2.md
        /// >> ch3.md
        /// >>> ch4.md
        /// > ch5.md
        ///
        var data = this.parseCITE(para,row);
        o.push([id,row,row2,'CITE','',data,para,fencecmd,'',base,label,fname]);
        block_type = 'CITE';
        continue;

      } else if ((v = this.re_para.exec(para[0])) !== null) {

        /// this the PARA block: [ ] This is ...

        var text = v[1];
        for (i=1; i < para.length; ++i) {
          /// candidate for line join
          text = this.joinLine(text,para[i]);
        }
        o.push([id,row,row2,'PARA','',text,para,fencecmd,'',base,label,fname]);
        block_type = 'PARA';

      } else if ((v = this.re_prim.exec(para[0])) !== null) {

        /// this is the PRIM block: [ Apple ] This is ...

        var lead = v[1];
        var text = v[2];
        for (i=1; i < para.length; ++i) {
          /// candidate for line join
          text = this.joinLine(text,para[i]);
        }
        var data = [lead,text];
        o.push([id,row,row2,'PRIM','',data,para,fencecmd,'',base,label,fname]);
        block_type = 'PRIM';

      } else if ((v = this.re_seco.exec(para[0])) !== null) {

        /// this is the SECO block: [[ Apple ]] This is ...

        var lead = v[1];
        var text = v[2];
        for (i=1; i < para.length; ++i) {
          /// candidate for line join
          text = this.joinLine(text,para[i]);
        }
        var data = [lead,text];
        o.push([id,row,row2,'SECO','',data,para,fencecmd,'',base,label,fname]);
        block_type = 'SECO';
        continue;
      } else {

        // This is a regular paragraph block
        var text = this.joinPara(para);
        o.push([id,row,row2,'TEXT','',text,para,fencecmd,'',base,label,fname]);
        block_type = 'TEXT';
        continue;
      }
    }

    /// If the flag is not set then treat the first block as the title
    if (!flags.title) {
      if (o.length == 0) {
        ///insert a HDGS/0 block
        var b = this.new_hdgs_block(plevel, 'Untitled', fname);
        o.unshift(b);
      } else {
        ///NOTE: Here if the first block is a HDGS but its level is not plevel,
        /// this could happen because the first block is a '#' block;
        /// in this case, we need to reduced all subsequent HDGS level by 1.
        if (o[0][3] === 'HDGS' && o[0][5][0] !== plevel) {
          o[0][5][0] = plevel;///change the HDGS level of the first block to plevel
          var title = o[0][5][1];
          flags['ALL title'] = title;
          for (var i=1; i < o.length; ++i) {
            if (o[i][3] === 'HDGS') {
              if (o[i][5][0] > 1) {
                o[i][5][0]--;
              }
            }
          }
        } else {
          ///NOTE: here the first block is a 'TEXT' block, we will
          /// turn it into a HDGS/0 block
          if (o[0][3] === 'TEXT') {
            var title = o[0][5];
            flags['ALL title'] = title;
            o[0][3] = 'HDGS';
            o[0][5] = [plevel, title];
          } else {
            ///insert a synthetic HDGS/0 block
            var b = this.new_hdgs_block(plevel, 'Untitled', fname);
            o.unshift(b);
          }
        }
      }
    }

    return [o,flags];
  }

  readPara (lines) {

    ///
    /// Read a paragraph and return the paragraph, the unread lines.
    /// and the fence if there is any. If it started with NTR lines they
    /// will also be processed and returned. The fence and the fencecmd
    /// will also be processed and returned. There should not be any blank
    /// lines between the fence commands and the content of the block.

    /// A paragraph will look like the following:
    ///
    /// .adjust 4 6
    /// .caption The trees and the flogs in \
    /// the middle of the day.
    /// .label tree
    /// ``` imgs
    /// image (image-tree.png) Tree
    /// image (image-flog.png) Flog
    /// ```

    /// It will watch out for in the following order
    ///
    /// - SAMP
    /// - FENCE
    /// - FENCE

    var v = null;
    var label = '';
    var fencecmd = {};
    var para = [];
    var flags = {};
    var is_fence = false;
    var the_fence = '';
    var num_solid = 0;
    var is_sample = false;
    var block_type = '';
    var the_sample_fence = '';
    var v = null;
    var line0 = '';

    for (var i=0; i < lines.length; ++i) {
      var line = lines[i];
      line = line.trimRight();
      if (is_fence) {
        if ((v = this.re_fence.exec(line)) !== null && v[1] == the_fence) {
          para.push(line);
          i += 1;
          break
        }
        para.push(line);
        continue
      } else if (is_sample) {
        if (the_sample_fence) {
          if (the_sample_fence === line) {
            para.push(line);
            i += 1;
            break;
          }
        } else {
          if (line.length == 0) {
            break
          }
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

      /// If we haven't seen any solid lines and line0 is non-empty,
      /// that means the previous line is ended with a backslash and
      /// the current line is a continuation of a previous fence cmd line
      ///
      /// .caption Tree and flogs \        <- 'line0'
      /// lovely.                          <- current line
      ///
      /// We will join the *line0* + *line*, removing the backslash of *line0* first,
      /// and set the *line* to be the joint line.

      if (num_solid == 0 && line0) {
        line0 = line0.slice(0,line0.length-1);
        line0 = this.joinLine(line0,line);
        line = line0;
        line0 = '';
      }

      /// If we haven't ready any solid lines and we have seen
      /// a fence command line, then we will process it.

      if (num_solid == 0 && this.re_fencecmd.test(line)) {
        var v = this.re_fencecmd.exec(line);
        ///check to see if the fence cmd line ends with a backslash
        if (line.length && line[line.length-1] == '\\') {
          line0 = line;
          line = line.slice(0,line.length-1);
        } else {
          line0 = '';
        }
        ///
        /// .adjust .33 .33
        /// .caption The tree and flog \
        /// are lovely.
        ///
        var the_key = v[1]
        var the_val = v[2].trim();
        fencecmd[the_key] = the_val;
        para.push('');
        continue
      }

      /// If we haven't seen any solid lines and we have seen
      /// a !TEX line, then process it
      var v = this.re_texcomment.exec(line);
      if ((num_solid == 0) && (v !== null)) {
        para.push('');
        var nitrile_line = v[1];
        if ((v = this.re_ntrflag.exec(nitrile_line)) !== null) {
          var key = v[1];
          var val = v[2];
          flags[key] = val;
        }
        continue;
      }

      /// Here is for solid lines

      // add to this paragraph
      para.push(line);

      /// keep track of the number of solid lines
      if (line.length) {
        num_solid += 1;

      }

      /// 'num_solid' expresses how many solid lines we have collected
      /// has been encountered, excluding the fence commands or config flags,
      /// but including the fence that is ```

      if (num_solid === 1) {

        /// If it is a hash-mark followed by one or more texts, then
        /// we are only interested in the first line

        if (this.re_hdgs.test(line) ) {
          i += 1;
          block_type = 'HDGS';
          break;

        }

        /// if this is the first solid line the we check
        /// to see if this is a sample

        var v = this.re_leadspaces.exec(line);
        if (v) {
          if (v[1].length >= N_sampspaces) {
            is_sample = true;
            block_type = 'SAMP';
            if (this.re_sampfence.test(line)) {
              the_sample_fence = line;
            }
            continue
          }
        }

        // if this is the first solid line then we check
        // to see if this is a fence

        var v = this.re_fence.exec(line);
        if (v) {
          is_fence = true;
          the_fence = v[1];
          continue
        }


      }

    }
    return [
      i,
      para,
      flags,
      lines.slice(i),
      the_fence.trim(),
      fencecmd,
      is_sample,
      block_type
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
      if (v[1] !== undefined) {
        var cnt = v[1]; // __apple__
        newtext += ' ';
        newtext += this.style('strong',cnt);

      } else if (v[2] !== undefined) {
        var cnt = v[2];  // _apple_
        newtext += ' ';
        newtext += this.style('em',cnt);

      } else if (v[3] !== undefined) {
        var raw = v[3]; // `` \sqrt 2 ``
        var cnt = raw.trim();
        newtext += this.style('inlinemath',cnt);

      } else if (v[4] !== undefined) {
        var raw = v[4]; // ` return 5 `
        var cnt = raw.trim();
        if (cnt == '') {
          newtext += '``';
        } else {
          newtext += this.style('code',cnt);
        }

      } else if (v[5] !== undefined && v[6] !== undefined) {
        /// uri: [](www.yahoo.com)
        /// uri: [Google](www.google.com)
        var alt = v[5];
        var cnt = v[6];
        var orig_cnt = cnt;
        alt = alt || '';
        alt = alt.trim();
        cnt = cnt.trim();
        ///detecting
        newtext += this.style('uri',[alt,cnt]);
      } else if (v[7] !== undefined) { /// *italic*
        var cnt = v[7];
        newtext += ' ';
        newtext += this.style('em',cnt);
      } else if (v[8] !== undefined) { /// ENTITY: [[&deg;]] or [[&amp;]]
        var cnt = v[8];
        newtext += this.entity(cnt);
      } else if (v[9] !== undefined) { /// RUBY: [[^簡単・かんたん^]]
        var cnt = v[9];
        newtext += this.ruby(cnt);
      } else if (v[10] !== undefined) { /// REF: [[#:tbl1#]] or [[#ch1:tbl1#]]
        var cnt = v[10];
        newtext += this.ref(cnt);
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
    /// find out the smallest leading space of all lines
    var n0 = Number.MAX_SAFE_INTEGER;
    for (let line of para) {
      var line0 = line.trimLeft();
      var n = line.length - line0.length;
      if (n < n0) {
        n0 = n;
      }
    }
    var n = n0;
    /// start trimming
    var out = [];
    var i;
    for (i in para) {
      out.push(para[i].slice(n));
    }
    return [out, n];
  }

  trimParaAt (para,n) {

    ///
    /// Trim the paragraph on the left side for the exact number of
    /// characters provided.
    ///

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

    /// ~~~ imgs
    /// image tree.png
    /// ~~~
    ///

    var the_fence = '';
    var the_brand = '';
    var v1 = this.re_fence.exec(para[0]);
    var v2 = this.re_fence.exec(para[para.length-1]);
    if (v1 !== null && v2 !== null) {
      var the_fence = v1[1];
      var the_brand = v1[2];
      para = para.slice(1,para.length-1);
      return [para,the_fence,the_brand];
    } else if (v1 !== null) {
      var the_fence = v1[1];
      var the_brand = v1[2];
      para = para.slice(1);
      return [para,the_fence,the_brand];
    }
    return [para,'',''];
  }

  trimSampleFences (para) {

    ///
    /// Trim the paragraph to remove fences on the top and/or bottom

    /// ~~~
    /// printf("hello world\n");
    /// ~~~

    var v1 = this.re_sampfence.test(para[0]);
    var v2 = this.re_sampfence.test(para[para.length-1]);
    if (v1 && v2) {
      para = para.slice(1,para.length-1);
      return [para,'~~~',''];
    } else if (v1) {
      para = para.slice(1);
      return [para,'~~~',''];
    }
    return [para,'',''];
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

  parseIMGS (para) {
    ///
    /// Parse the IMGS
    ///  image (tree.png tree.pdf) This is a tree.
    ///  image (frog.png frog.pdf) This is a flog.
    ///

    var pp = [];
    var line0 = '';
    var para_2 = [];// hold the result after joining lines
    var re_image0 = /^image\s+\((.*?)\)\s*(.*)$/;
    for (var line of para) {
      if (line0 && line0[line0.length-1] === '\\') {
        line0 = line0.slice(0,line0.length-1);
        line0 = this.joinLine(line0,line);
        para_2.pop();
        para_2.push(line0);
      } else {
        para_2.push(line);
        line0 = line;
      }
    }
    for (var line of para_2) {
      var m0 = re_image0.exec(line);
      if (m0 ) {
        var srcs = this.toArray(m0[1]);
        var sub = m0[2];
        pp.push(['image',srcs,sub]);
      }
    }
    return pp;
  }

  parseLINE (para) {

    ///
    /// Parse the LINE block
    ///
    ///  ~~~line
    ///  Oh McDonald had a farm,
    ///  E ya E ya yo...
    ///  ~~~
    return this.concatPara(para);
  }

  parseTABL (para) {

    ///Test to see if it is in AltTABL2 format
    if (para.length >= 3 &&
        this.re_alt_tabb2.test(para[0]) &&
        (para[0] === para[para.length-1]) ) {

      /// remove the leading/ending vertical bar if there are any
      para = this.removeLeadingEndingVerticalBar(para);

      /// parse this as if it is a AltTABL block
      return this.parseAltTABL(para);
    }

    ///Test to see if it is in AltTABL format
    if (para.length >= 3 &&
        this.re_alt_tabb.test(para[0]) &&
        (para[0] === para[para.length-1]) ) {

      /// parse this as if it is a AltTABL block
      return this.parseAltTABL(para);
    }

    /// test to see which format it is in
    /// for parseTABULAR, parsePARATABULAR, and parseLINETABULAR
    var form = '';
    if (para.length) {
      var pp = this.splitLineTwoSpaces(para[0]);
      if (pp.length === 1 && this.countEmptyLines(para) > 0) {
        return this.parsePARATABULAR(para);
      }
    }

    /// test to see which format it is in
    /// for parseTABULAR, parsePARATABULAR, and parseLINETABULAR
    var form = '';
    if (para.length) {
      var pp = this.splitLineTwoSpaces(para[0]);
      if (pp.length > 1 && this.countEmptyLines(para) > 0) {
        return this.parseTABULAR(para);
      }
    }

    return this.parseLINETABULAR(para);
  }

  parseAltTABL (para) {

    var o = [];
    var pp0 = [];
    var s0 = para[0];
    para = para.slice(1);
    for (var s of para) {
      if (s === s0) {
        o.push(pp0);
        pp0 = [];
        continue;
      }
      var pp = s.split('|');
      var pp = pp.map ( x => x.trim() );
      pp0 = pp.map( (x,j) => `${this.joinTableCell(pp0[j],x)}` );
    }
    if (pp0.length) {
      o.push(pp0);
    }

    ///now figure out 'ww' and 'maxj'
    var adjust = [];
    var pp = s0.split('|');
    var maxj = pp.length;
    var pp = pp.map( x => x.length );
    var sum = pp.reduce( (acc,num) => acc += num, 0 );
    var sum = Math.max(sum,1);
    var pp = pp.map( x => 1.0*x/sum );
    var pp = pp.map( x => x.toFixed(3) );

    return [o,maxj,pp];
  }

  parseLIST (para, re) {
    ///
    ///   + `drawline (1,1) (2,2)`
    ///   +  fill (1,1) (2,2)
    ///

    var items = [];
    var n = 0;
    for (var i=0; i < para.length; ++i) {
      var v = re.exec(para[i]);
      if (v) {
        items.push(v[2]);
        continue;
      }
      var text = items.pop();
      text = text||'';
      text = this.joinLine(text,para[i]);
      items.push(text);
    }
    return items;
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
    var xn = 0;
    if (n >= N_stepspaces) {
      xn = 1;
    }
    return [ cat, keys, text, xn ];
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
        if (bullet === '-'||bullet === '+'||bullet === '*') {
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

  parseDT (para) {
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
    ///convert to DLST format
    var o = [];
    var p = [[],''];
    var is_cont = 0;
    for (var j=0; j < out.length; j+=2){
      var key = out[j];
      var text = out[j+1];
      if (is_cont) {
        p[0].push(key);
        p[1] = text;
      } else {
        p = [[key],text];
        o.push(p);
      }
      if (!text) {
        is_cont = 1;
      } else {
        is_cont = 0;
      }
    }
    o = o.filter( item => (item[0].length > 0)?true:false );
    return o;
  }

  parseQUOT (para) {
    var out = [];
    var s0 = '';
    for (var s of para) {
      if (s === '') {
        if (s0) {
          out.push(s0);
          s0 = '';
        }
      } else {
        s0 = this.joinLine(s0,s);
      }
    }
    if (s0) {
      out.push(s0);
    }
    return out;
  }

  parseEQTN(para) {
    var out = [];
    while (para.length > 0) {
      var [o,para] = this.getClusterLines(para);
      if (o.length > 0){
        out.push(o);
      }
    }
    return out;
  }

  _parseEQTN (para) {
    var out = [];
    var p = [];
    var s0 = '';
    var re = /(.*)\\\\$/;
    out.push(p);
    for (var s of para) {
      if (s === '') {
        if (p.length) {
          p = [];
          s0 = '';
          out.push(p);
        }
        continue;
      }
      s = `${s0} ${s}`;
      var v = re.exec(s);
      if(v){
        if (s0) {
          p.pop();
        }
        p.push(v[1]);
        s0 = '';
      } else if (s0) {
        p.pop();
        p.push(s);
        s0 = s;
      } else {
        p.push(s);
        s0 = s;
      }
    }
    if (p.length===0) {
      out.pop(p);
    }
    console.log(out);
    return out;
  }

  parseDIAGRAM (para) {
    var o = [];
    var s0 = '';
    for (var s of para) {
      if (s) {
        if (s0 && s0[s0.length-1] === '\\') {
          s0 = s0.slice(0,s0.length-1);///remove the last backslash
          s0 += ' ';
          s0 += s.trimLeft();
          o.pop();
          o.push(s0);
        } else {
          s0 = s.trimLeft();
          o.push(s0);
        }
      }
    }
    return o;
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

  parseCITE (para,row) {
    var o = [];
    for (var k in para) {
      var line = para[k];
      var v = this.re_files.exec(line);
      if (v) {
        var sublevel = v[1].length;
        var subfname = v[2].trim();
        var subrow = parseInt(row) + parseInt(k);
        o.push({sublevel,subfname,subrow});
      }
    }
    return o;
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

  joinTableCell (s0, s1) {
    ///
    /// join separate components of a single table cell.
    ///

    s0 = s0 || '';
    s1 = s1 || '';

    if (s0.endsWith('\\\\')) {
      s0 = s0.slice(0,s0.length-2);
      return `${s0}\n${s1}`;
    }

    if (s0.endsWith('\\')) {
      s0 = s0.slice(0,s0.length-1);
      return this.joinLine(s0,s1);
    }

    return this.joinLine(s0,s1);
  }

  joinLine (s0, s1) {
    ///
    /// join two lines
    ///

    s0 = s0 || '';
    s1 = s1 || '';
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

    if (para.length === 0) {
      return '';
    }
    var line = para.shift();
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

  calcTabbWidthByColumnWidth (text,maxj) {

    var text = text.map ( pp => {
      pp = pp.map(x => x.split('\n'));
      pp = pp.map(x => x.map( y => y.length ));
      pp = pp.map(x => x.reduce( (a,c) => (a>c)?(a):(c) ), 0);
      return pp;
    });
    var ww = this.expandArray([],maxj,0);
    var ww = ww.map( (x,i) => {
        var n = 0;
        for (var row of text) {
          n = (n > row[i]) ? n : row[i];
        }
        return n;
    });
    var n = ww.reduce( (a,c) => a + c, 0 );
    var ww = ww.map( x => x/n );
    return ww;
  }

  toWW (maxj) {

    var w = 1;
    var ww = this.expandArray([],maxj,w);
    return ww;
  }

  calcTabbWidthByNumCharacters (rows,maxj) {

    var w = 1;
    var ww = this.expandArray([],maxj,w);

    for (var k=0; k < rows.length; ++k) {
      var pp = rows[k];

      var pp = pp.map(x => x.split('\n'));
      var nn = pp.map(x => x.length);
      var maxn = nn.reduce((acc,cur) => Math.max(acc,cur));
      for (var i=0; i < maxn; ++i) {
        var qq = pp.map(x => x[i]);
        var ll = qq.map(x => (x)?x.length:0);
        var ww = ww.map((w,n) => Math.max(w,ll[n]));
      }
    }
    return ww;
  }

  expandArray (row,maxj,data) {
    ///
    /// Expand an array so that it has at least this number of
    /// elements.
    ///

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

  newPARTblock (count,subpart) {

    /// create a new 'PART' block

    var fencecmd = {};
    var dept = '';
    var fig = '';
    var id = `nitrile-preview-part-${count}`;
    var base = '';
    var fname = '';
    var plevel = 0;
    var label = '';
    return [id,-1,-1,'PART',0,subpart,[],fencecmd,'',base,label,fname];

  }

  new_hdgs_block (level,text,fname) {

    /// create a new 'HDGS/0' block

    var fencecmd = {};
    var dept = '';
    var fig = '';
    var base = '';
    var label = '';
    var para = [];
    var n = 0;
    return ['',-1,-1,'HDGS',n,[level,text],para,fencecmd,'',base,label,fname];

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

  toArray (text) {

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

  toObject (line) {

    /// converting a line such as 'n' to an object that is {n:1}

    if (/^\w+$/.test(line)) {
      var o = {};
      o[line] = true;
      return o;
    }

    /// champ the first and the last character
    /// [width:1in; height: 2in]

    if (/^\[.*\]$/.test(line)) {
      line = this.champ(line);
    }

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

  toSubs (main) {

    var o = [];
    for (var block of main) {
      const [id,row1,row2,brand,n,data,para,fencecmd,star,base,label,fname] = block;
      switch (brand) {
        case 'CITE': {
          for (var sub of data) {
            o.push(sub);
          }
          break;
        }
      }
    }
    return o;
  }

  mergeBlocks (main,subs) {

    var subflows = {};
    var subrows = {};
    for (var sub of subs) {
      let {subfname,subrow,flow} = sub;
      subflows[subfname] = flow;
      subrows[subfname] = subrow;
    }
    var o = [];
    for (var m of main) {
      const [id,row1,row2,brand,n,data,para,fencecmd,star,base,label,fname] = m;
      switch (brand) {
        case 'CITE': {
          for (var sub of data) {
            var {subfname} = sub;
            var flow = subflows[subfname];
            var subr = subrows[subfname];
            if (flow) {
              for (var f of flow) {
                f[1] = parseInt(subr); ///change the row and row2 field
                f[2] = parseInt(subr) + 1;
                f[4] = parseInt(subr);///NOTE:it has to be a number
                o.push(f)
              }
            }
          }
          break;
        }
        default: {
          o.push(m);
          break;
        }
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

  assertConfigEntry (val,entry) {

    /// given a value such as 12.5, ensure that it is valid
    /// by the definition of the entry, and return the corrected
    /// one if the one given is out-of-range.
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
        return this.toArray(val);
        break;
      }
      default: {
        return val;
        break;
      }
    }
  }

  old_toConfig (flags) {

    /// get all default values first
    var config = {};
    var schema = json_config.configSchema;
    for (var key in schema) {
      if (schema.hasOwnProperty(key)) {
        var entry = schema[key];
        var def_val = entry['default'];
        config[key] = def_val;
      }
    }
    /// get all keys from 'flags' and overwrite them in 'config'
    for (var key in flags) {
      if (flags.hasOwnProperty(key)) {
        var val = flags[key];
        if (config.hasOwnProperty(key)) {
          config[key] = val;
        }
      }
    }
    /// now check the validity of the new values
    for (var key in config) {
      if (config.hasOwnProperty(key)) {
        var val = config[key];
        var entry = schema[key];
        var val = this.assertConfigEntry(val,entry);
        config[key] = val;
      }
    }
  }

  toConfig (flags) {

    /// get all default values first
    var config = {};

    config.ALL = {};
    config.ALL.title = 'Untitled';
    config.ALL.author = '';

    /// FIRST make sure some property always exist
    config.LATEX = {};
    config.LATEX.leftMargin=4.45;
    config.LATEX.rightMargin=4.45;
    config.LATEX.topMargin=4;
    config.LATEX.leftMarginForTwoColumn=2.5;
    config.LATEX.rightMarginForTwoColumn=2.5;
    config.LATEX.topMarginForTwoColumn=4;

    config.HTML = {};
    config.HTML.leftMargin=4.45;
    config.HTML.rightMargin=4.45;
    config.HTML.topMargin=4;
    config.HTML.normalfontsize=11.5;

    config.PREVIEW = {};

    config.TEXT = {};
    config.ITEM = {};
    config.VERB = {};
    config.HDGS = {};
    config.PART = {};
    config.CITE = {};
    config.PARA = {};
    config.PRIM = {};
    config.SECO = {};
    config.PLST = {};
    config.DLST = {};
    config.TBLR = {};
    config.TBLR.hlines = 'm';
    config.TBLR.vpadding = 1;
    config.LONG = {};
    config.LONG.hlines = 't m b';
    config.LONG.vpadding = 4;
    config.SAMP = {};
    config.SAMP.wrap=0;
    config.LSTG = {};
    config.LSTG.numbers = 'left';
    config.LSTG.numbersep = '12pt';
    config.TABB = {};
    config.IMGS = {};
    config.DIAG = {};

    /// now grab all fenceopt
    var re = /^(\w+)\s+(\w+)/;
    for (var key in flags) {
      //config[key] = flags[key];
      if (re.test(key)) {
        var v = re.exec(key);
        var brand = v[1];
        var prop = v[2];
        if (config[brand]) {
          config[brand][prop] = flags[key];
        } else {
          config[brand] = {};
          config[brand][prop] = flags[key];
        }
      }
    }

    return config;
  }


  getBool (val) {

    ///
    /// given a string, return a boolean value
    ///
    /// getBool("1"); //true
    /// getBool("12"); //true
    /// getBool("12.5"); //true
    /// getBool("1005"); //true
    /// getBool("0"); //false
    /// getBool("0.0"); //false
    /// getBool(" "); //false
    /// getBool(""); //false
    /// getBool(undefined); //false
    /// getBool(null); //false
    /// getBool('blah'); //false
    /// getBool('yes'); //true
    /// getBool('on'); //true
    /// getBool('YES'); //true
    /// getBool('ON'); //true
    /// getBool("true"); //true
    /// getBool("TRUE"); //true
    /// getBool("false"); //false
    /// getBool("FALSE"); //false
    ///

    if (!val) return false;
    if (typeof val === 'string') {
      val = val.trim();
      if (!val.length) { return false; }
      val = val.toLowerCase();
      if (val === 'true' || val === 'yes' || val === 'on') {
        return true;
      }
      val = +val;
      if (isNaN(val)) return false;
      return (val !== 0);
    }
    if (typeof val === 'boolean') {
      return val;
    }
    if (typeof val === 'number') {
      return !(val == 0);
    }
    return true;
  }

  replaceAllBlanks (str, c) {
    return str.replace(/\s/g,c);
  }

  replaceLeadingBlanks (str, c) {
    var newstr = '';
    var m = /^(\s*)(.*)$/.exec(str);
    if (m) {
      if (m[1].length > 0) {
        for (var j=0; j < m[1].length; ++j) {
          newstr += c;
        }
        newstr += m[2];
        return newstr;
      }
    }
    return str;
  }

  isInsideSection (w, v) {

    ///
    /// given two sections, w and v, returns true
    /// if w is considered part of v.
    ///
    /// 1.1, 1 => true
    /// 1, 1.1 => false

    var vv = v.split('.');
    var ww = w.split('.');

    if (ww.length < vv.length) {
      return false;
    }
    for (var j=0; j < vv.length; ++j) {
      if (ww[j] !== vv[j]) {
        return false;
      }
    }
    return true;
  }

  isSectionShowing (dept, sections) {
    for (var section of sections) {
      if (this.isInsideSection(dept,section)) {
        return true;
      }
    }
    return false;
  }

  findSpaceBeforeWordAt (s, longn, shortn) {
    var j = longn;
    var c = s[j];
    var re_ws = /\s/;
    if (re_ws.test(c)) {
      return j;
    }
    while (j > shortn && !re_ws.test(c)) {
      --j;
      c = s[j];
    }
    if (j == shortn) {
      j = longn;/// if cannot find a space, use the longn
    }
    return j;
  }

  wrapSample (para, sampwrapn) {
    var re_leadn = /^(\s*)/;
    var o = [];
    var l = [];
    for (var n = 0; n < para.length; ++n) {
      var s = para[n];
      var lineno = n+1;
      lineno = ''+lineno;/// convert to string
      var leadn = 0;
      var v = re_leadn.exec(s);
      if (v) {
        leadn = v[1].length;
      }
      var maxn = sampwrapn - leadn;
      if (maxn < 1) {
        maxn = 1;
      }
      var longn = maxn + leadn;
      var shortn = 1 + leadn;
      if (sampwrapn == 0 || s.length <= longn) {
        o.push(s);
        l.push(lineno);
        continue;
      }
      while (s.length > longn) {
        var s1 = s;
        var s2 = '';
        ///var k = this.findSpaceBeforeWordAt(s, longn, shortn);
        var k = longn;
        if (k < shortn) {
          k = shortn;
        }
        var s1 = s.slice(0,k);
        var s2 = s.slice(k);
        o.push(`${s1}\\`);
        l.push(lineno);
        lineno = '';/// clear out so that for subsequent cont lines they are blank
        /// add in the leadn of blank spaces
        s = '';
        s += ' '.repeat(leadn);
        s += this.unicode_right_arrow;
        s += s2;
        longn = 1 + maxn + leadn;///increment by 1 because of the arrow
        shortn = 2 + leadn;///increment by 1 because of the arrow
      }
      o.push(s);
      l.push(lineno);
    }
    return o;
  }

  toAdjustedColumns (maxj,adjust) {

    /// For an adjust that is "2 3" and x_count is "3".
    /// it returns "2 3 3"

    var aa = this.toArray(adjust);
    var aa = aa.map( x => parseFloat(x) );
    var aa = aa.filter( x => Number.isFinite(x) );
    var aa = aa.filter( x => (x!=0) );
    if (aa.length>0) {
      var aa = this.expandArray(aa,maxj,aa[aa.length-1]);
    } else {
      var aa = this.expandArray([],maxj,1);
    }
    return aa;
  }

  toReversedArray (para) {
    var o = [];
    for (var s of para) {
      o.unshift(s);
    }
    return o;
  }

  getParaMaxWidth (para) {
    var n = 0;
    for (var s of para) {
      n = (s.length > n) ? s.length : n;
    }
    return n;
  }

  rubify (src) {

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
    var found = 0;
    var found_str1 = '';
    var found_str2 = '';
    var out = '';
    src = src || '';
    while (j < src.length) {
      i0 = src.length;
      found = 0;
      for (var rubyitem of this.rubymap) {
        var [str1,str2] = rubyitem;
        var i = src.indexOf(str1,j);
        if (i < 0) {
          continue
        }
        if (i < i0) { /// first found or a new found that is closer
          i0 = i;
          found = 1;
          found_str1 = str1;
          found_str2 = str2;
        } else if (i === i0 && str1.length > found_str1.length) { /// found two at the same location, prefer the longest
          i0 = i;
          found = 1;
          found_str1 = str1;
          found_str2 = str2;
        }
      }
      if (found) {
        /// found!
        var str1 = found_str1;
        var str2 = found_str2;
        out += src.slice(j,i0);
        out += this.extractRubyItems(str1,str2);
        j = i0 + str1.length;
      } else {
        /// we are done, none of the substrings exists!
        out += src.slice(j);
        j = src.length;
      }
    }
    return out;
  }

  buildRubyMap (json) {
    var o = [];
    for (var item of json.vsuru) {
      let [base,top] = item;
      o.push(item);
      o.push([base.slice(0,base.length-2),top.slice(0,top.length-2)]);
    }
    for (var item of json.v1) {
      let [base,top] = item;
      o.push(item);
      o.push([base.slice(0,base.length-1),top.slice(0,top.length-1)]);
    }
    for (var item of json.v5m) {
      let [base,top] = item;
      o.push(item);
      var suffixes = [
            '\u307e', //ま
            '\u307f', //み
            '\u3081', //め
            '\u3082\u3046', //もう
            '\u3093\u3067', //んで
            '\u3093\u3060'  //んだ
      ];
      for (let suffix of suffixes) {
        o.push([`${base.slice(0,base.length-1)}${suffix}`,`${top.slice(0,top.length-1)}${suffix}`]);
      }
    }
    for (var item of json.v5b) {
      let [base,top] = item;
      o.push(item);
      var suffixes = [
            '\u3070', //ば
            '\u3073', //び
            '\u3079', //べ
            '\u307c\u3046', //ぼう
            '\u3093\u3067', //んで
            '\u3093\u3060'  //んだ
      ];
      for (let suffix of suffixes) {
        o.push([`${base.slice(0,base.length-1)}${suffix}`,`${top.slice(0,top.length-1)}${suffix}`]);
      }
    }
    for (var item of json.v5n) {
      let [base,top] = item;
      o.push(item);
      var suffixes = [
          '\u306a', //な
          '\u306b', //に
          '\u306d', //ね
          '\u306e\u3046', //のう
          '\u3093\u3067', //んで
          '\u3093\u3060'   //んだ
      ];
      for (let suffix of suffixes) {
        o.push([`${base.slice(0,base.length-1)}${suffix}`,`${top.slice(0,top.length-1)}${suffix}`]);
      }
    }
    for (var item of json.v5s) {
      let [base,top] = item;
      o.push(item);
      var suffixes = [
          '\u3055', //さ
          '\u3057', //し
          '\u305b', //せ
          '\u305d\u3046', //そう
          '\u3057\u3066', //して
          '\u3057\u305f'  //した
      ];
      for (let suffix of suffixes) {
        o.push([`${base.slice(0,base.length-1)}${suffix}`,`${top.slice(0,top.length-1)}${suffix}`]);
      }
    }
    for (var item of json.v5g) {
      let [base,top] = item;
      o.push(item);
      var suffixes = [
          '\u304c', //が
          '\u304e', //ぎ
          '\u3052', //げ
          '\u3054\u3046', //ごう
          '\u3044\u3067', //いで
          '\u3044\u3060'  //いだ
      ];
      for (let suffix of suffixes) {
        o.push([`${base.slice(0,base.length-1)}${suffix}`,`${top.slice(0,top.length-1)}${suffix}`]);
      }
    }
    for (var item of json.v5k) {
      let [base,top] = item;
      o.push(item);
      var suffixes = [
          '\u304b', //か
          '\u304d', //き
          '\u3051', //け
          '\u3053\u3046', //こう
          '\u3044\u3066', //いて
          '\u3044\u305f'  //いた
      ];
      for (let suffix of suffixes) {
        o.push([`${base.slice(0,base.length-1)}${suffix}`,`${top.slice(0,top.length-1)}${suffix}`]);
      }
    }
    for (var item of json.v5r) {
      let [base,top] = item;
      o.push(item);
      var suffixes = [
          '\u3089', //ら
          '\u308a', //り
          '\u308c', //れ
          '\u308d\u3046', //ろう
          '\u3063\u3066', //って
          '\u3063\u305f'  //った
      ];
      for (let suffix of suffixes) {
        o.push([`${base.slice(0,base.length-1)}${suffix}`,`${top.slice(0,top.length-1)}${suffix}`]);
      }
    }
    for (var item of json.v5t) {
      let [base,top] = item;
      o.push(item);
      var suffixes = [
          '\u305f', //た
          '\u3061', //ち
          '\u3066', //て
          '\u3068\u3046', //とう
          '\u3063\u3066', //って
          '\u3063\u305f'  //った
      ];
      for (let suffix of suffixes) {
        o.push([`${base.slice(0,base.length-1)}${suffix}`,`${top.slice(0,top.length-1)}${suffix}`]);
      }
    }
    for (var item of json.v5u) {
      let [base,top] = item;
      o.push(item);
      var suffixes = [
          '\u308f', //わ
          '\u3044', //い
          '\u3048', //え
          '\u304a\u3046', //おう
          '\u3063\u3066', //って
          '\u3063\u305f'  //った
      ];
      for (let suffix of suffixes) {
        o.push([`${base.slice(0,base.length-1)}${suffix}`,`${top.slice(0,top.length-1)}${suffix}`]);
      }
    }
    for (var item of json.adji) {
      let [base,top] = item;
      o.push(item);
      var suffixes = [
          '\u304b\u3063\u305f', //かった
          '\u304f', //く
          '\u3055', //さ
          '\u307f', //み
          '\u305d\u3046'  //そう
      ];
      for (let suffix of suffixes) {
        o.push([`${base.slice(0,base.length-1)}${suffix}`,`${top.slice(0,top.length-1)}${suffix}`]);
      }
    }
    for (var item of json.exp) {
      o.push(item);
    }
    return o;
  }

  toLatexLength (str) {

    // to turn a string such as 100% to \linewidth
    // .. and 25% to .25\linewidth
    var v;
    if ((v = /^([\.\d]+)\%$/.exec(str)) !== null) {
      return `${v[1]*0.01}\\linewidth`;
    }
    return str;
  }

  countEmptyLines (para) {

    var n = 0;
    for (let line of para) {
      if (line.length == 0) {
        n++;
      }
    }
    return n;

  }

  removeLeadingEndingVerticalBar (para) {

    var o = [];
    for (let line of para) {
      if (line[0] === '|') {
        line = line.slice(1);
      }
      if (line[line.length-1] === '|') {
        line = line.slice(0,line.length-1);
      }
      o.push(line);
    }
    return o;
  }

  parseTABULAR (para) {

    ///
    /// Parse the TABL block
    ///
    ///  ```
    ///  Informal negative        簡単ではない
    ///                           簡単じゃない
    ///
    ///  Informal past            簡単だった
    ///
    ///  Informal negative past   簡単ではなかった
    ///                           簡単じゃなかった
    ///
    ///  Formal                   簡単です
    ///
    ///  Formal negative          簡単ではありません\\
    ///                           簡単じゃありません\\
    ///
    ///  Formal past              簡単でした
    ///  ```
    ///

    var re_ebs = /\\$/;
    var o = [];
    var s0 = [];///this is the current row
    o.push(s0);
    for (var row of para) {
      if (row.length === 0) {
        ///NOTE: we need to insert a new row. But we need to watch
        /// out for multiple empty lines
        if (s0.length) {
          s0 = [];
          o.push(s0);
        }
      }
      ///NOTE: two leading spaces are treated as starting at the
      /// second column
      var pp = this.splitLineTwoSpaces(row);
      var pp = pp.map(s => s.trim());
      var pp = pp.map(s => s=='{}'?'':s);
      if (s0.length === 0) {
        pp.forEach(x => s0.push(x));
        var ebs = s0.map(s => re_ebs.test(s));
      } else {
        var j = 0;
        ebs.forEach((x,i) => {
            if(x){
              s0[i] = s0[i].replace(/\\\\$/,'\n');
              s0[i] = s0[i].replace(/\\$/,'');
              s0[i] = this.joinLine(s0[i],pp[j++]);
            }
        });
        var ebs = s0.map(s => re_ebs.test(s));
      }
    }
    ///NOTE: we need to watch for the last s0 which is empty
    if (s0.length === 0) {
      o.pop();
    }
    ///NOTE: remove all entries with ending \\\\ or \\
    o = o.map( row => {
        row = row.map( s => s.replace(/\\\\$/,'') );
        row = row.map( s => s.replace(/\\$/,'') );
        return row;
    });
    var maxj = this.matrixMaxJ(o);
    if (maxj < 1) maxj = 1;
    var o = o.map( x => this.expandArray(x,maxj,'') );
    var ww = this.calcTabbWidthByNumCharacters(o,maxj);
    var ww = ww.map( x => x.toFixed(3) );
    return [o,maxj,ww];

  }

  parsePARATABULAR(para) {
    ///
    /// ```
    /// apple
    /// Apple is good.
    ///
    /// pear
    /// Pear is good.
    ///
    /// banana
    /// Banana is good.
    /// ```
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
    var maxj = this.matrixMaxJ(o);
    if (maxj < 1) maxj = 1;
    var o = o.map( x => this.expandArray(x,maxj,'') );
    var ww = this.calcTabbWidthByNumCharacters(o,maxj);
    var ww = ww.map( x => x.toFixed(3) );
    return [o,maxj,ww];
  }

  parseLINETABULAR(para) {

    /// ```
    ///
    ///   Syntax         Name                           Example(s)
    ///   +              Plus                           x = 5 + 1
    ///   -              Minus                          x = 5 - 1
    ///   *              Multiply                       x = 5 * 1
    ///   /              Divide                         x = 5 / 1
    ///   %              Modulo                         x = 5 % 1
    ///   ++             Increment                      x = ++y
    ///   --             Decrement                      x = --y
    ///   +val           Positive                       x = +y
    ///   -val           Negation                       x = -y
    ///
    /// ```

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
    var maxj = this.matrixMaxJ(o);
    if (maxj < 1) maxj = 1;
    var o = o.map( x => this.expandArray(x,maxj,'') );
    var ww = this.calcTabbWidthByNumCharacters(o,maxj);
    var ww = ww.map( x => x.toFixed(3) );
    return [o,maxj,ww];
  }

  wwToOne(ww) {
    var sum = ww.reduce( (acc,num) => acc += parseFloat(num), 0 );
    ww = ww.map( x => x/sum );
    ww = ww.map( x => x.toFixed(6) );
    return ww;
  }

  wwToHundred(ww) {
    var sum = ww.reduce( (acc,num) => acc += parseFloat(num), 0 );
    ww = ww.map( x => x/sum );
    ww = ww.map( x => x*100 );
    ww = ww.map( x => Math.round(x) );
    return ww;
  }

  updateFencecmd(fencecmd,sig,config){
    /// now grab all fenceopt
    for (var key in config) {
      if (key === sig) {
        for (var prop in config[key]) {
          if(fencecmd[prop]){
            ///good ignore
          }else{
            var val = config[key][prop];
            fencecmd[prop]=val;
          }
        }
      }
    }
    return fencecmd;
  }

  getClusterLines(lines) {
    var o = [];
    ///skip empty lines
    while(lines.length > 0){
      var line = lines[0];
      if (line.length === 0) {
        lines.shift();
      } else {
        break;
      }
    }
    /// get as many solid lines
    while(lines.length > 0){
      var line = lines[0];
      if (line.length > 0) {
        o.push(line);
        lines.shift();
      } else {
        break;
      }
    }
    return [o,lines];
  }

  splitShortRowVB(s) {
    if (!s || typeof s !== 'string') {
      return [];
    }
    var ss = s.split('|');
    if (typeof ss[0] === 'string' && ss[0] === '') {
      ss.shift();
    } 
    if (typeof ss[ss.length-1] === 'string' && ss[ss.length-1] === '') {
      ss.pop();
    }
    return ss;
  }

  isShortTable(para) {
    
    var re = /^\-+$/;
    var o = [];
    var maxj = 0;
    var ww = [];
    var flag = 0;
    var ss0 = this.splitShortRowVB(para[0]);
    var ss1 = this.splitShortRowVB(para[1]);
    if (para.length > 1 && ss0.length > 1 && ss1.length > 1 && ss0.length === ss1.length) {
      ///check to see if the second line containsly hyphen-minus
      var seps = ss1.filter( x => re.test(x) );
      if (seps.length === ss1.length) {
        ///good
        return true;
      } else {
        return false;
      }
      return false;
    }
  }

  parseShortTable(para) {
    
    var re = /^\-+$/;
    var o = [];
    var maxj = 0;
    var ww = [];
    var ss0 = this.splitShortRowVB(para[0]);
    var ss1 = this.splitShortRowVB(para[1]);
    
    para.shift();
    para.shift();
    o.push(ss0);
    maxj = ss0.length;
    for( var s of para) {
      var ss = this.splitShortRowVB(s);
      while(ss.length > maxj) {
        ss.pop();
      } 
      while(ss.length < maxj) {
        ss.push('');
      }
      o.push(ss);
    }
    ///for tabular ww does not matter
    return [o,maxj,ww];
  }

  isLongTablePara(para) {
    
    if (para.length < 2) {
      return false;
    }
    var re = /^\((\d+)\)\s+(.*)$/;
    var s = para[0];
    var v = re.exec(s);
    if (v && v[1] === '1') {
      for (var j = 1; j < para.length; ++j) {
        var s = para[j];
        v = re.exec(s);
        if( v && v[1] === '2') {
          return true;
        }
      }
    }
    return false;
  }

  parseLongTablePara(para) {
    
    var o = [];
    var re = /^\((\d+)\)\s+(.*)$/;
    var s = para[0];
    var v = re.exec(s);
    var start = 1;
    var s0 = '';
    for (var j = 0; j < para.length; ++j) {
      var s = para[j];
      v = re.exec(s);
      if( v && v[1] === ''+start) {
        s0 = v[2];
        o.push(s0);
        start++;
      } else {
        s0 = this.joinLine(s0,s);
        o.pop();
        o.push(s0);
      }
    }
    return o;
  }

  isDtListPara(para) {

    var re = /^\*\s+\[(.*?)\]\s*(.*)$/;
    var re2 = /^\+\s+(.*)$/;
    if (para.length === 0) {
      return false;
    }
    var s0 = para[0];
    if (re.test(s0)) {
      return true;
    }
    if (re2.test(s0)) {
      return true;
    }
    return false;
  }

  parseDtListPara(para) {

    var o = [];
    var keys = [];
    var desc = [];
    o.push([keys,desc]);
    var re = /^\*\s+\[(.*?)\]\s*(.*)$/;
    var re2 = /^\+\s+(.*)$/;
    for (var j = 0; j < para.length; ++j) {
      var s = para[j];
      var v;
      if((v=re.exec(s)) !== null) {
        var key = v[1];
        /// if desc is not empty,then we need to create
        /// a new row
        if (desc.length > 0) {
          var keys = [];
          var desc = [];
          o.push([keys,desc]);
        }
        keys.push(key);
        var text = v[2];
        if (text.length > 0) {
          desc.push(text);
        }
      } else if((v=re2.exec(s)) !== null) {
        var key = v[1];
        /// if desc is not empty,then we need to create
        /// a new row
        if (desc.length > 0) {
          var keys = [];
          var desc = [];
          o.push([keys,desc]);
        }
        keys.push(key);
        var text = '';///for this re, the text is empty 
        if (text.length > 0) {
          desc.push(text);
        }
      } else {
        desc.push(s);
      }
    }
    /// we need to remove the last row if it is empty
    o = o.filter( item => (item[0].length > 0)?true:false );
    o = o.map( item => {
      item[1] = this.joinPara(item[1]);
      return item;
    });
    return o;
  }

  to_stepmargin(v){
    var v = parseFloat(v);
    if (Number.isFinite(v) && v > 0) {
      return `${v.toFixed(2)}mm`;
    }
    return '8mm';
  }

  to_numbers(v) {
    var p = json_math.config_numbers[v];
    if (p) {
      return p;
    }
    return '';
  }

  to_numbersep(v) {
    var v = parseFloat(v);
    if (Number.isFinite(v)) {
      if (v < 1) {
        v = 1;
      }
      return `${v.toFixed(2)}mm`;
    }
    return '4mm';
  }

  to_normalfontsize(v) {
    var v = parseFloat(v);
    if (Number.isFinite(v)) {
      if (v < 1) {
        v = 1;
      }
      return `${v.toFixed(2)}pt`;
    }
    return '11.5pt';
  }

}























module.exports = { NitrilePreviewParser };
