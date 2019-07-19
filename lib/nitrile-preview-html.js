'use babel';

const { NitrilePreviewParser } = require('./nitrile-preview-parser');
const { NitrilePreviewTokenizer } = require('./nitrile-preview-tokenizer');

class NitrilePreviewHtml extends NitrilePreviewParser {

  constructor() {
    super();
    this.tokenizer = new NitrilePreviewTokenizer();
  }

  /*
    return a set of lines that is the result of converting
    to output from blocks
    */
  translateHtml (config,xrefs,blocks,isarticle,o) {
    /// as it was used before to search for ref-id given a file name
    o = o || [];
    const step = config['step'];
    const stepMargin = config['stepMargin'];
    const parskip = config['parskip'];
    var heading = '';
    this.block = [];
    this.xrefs = xrefs;
    for (var block of blocks) {
      /// store the current processed block so that it
      /// can be accessed by 'unmask' function to find out
      /// what block is currently being processed
      this.block = block;
      const [id,row1,row2,sig,n,data,para,fencecmd,dept,fig,caption,hidden,fname,plevel] = block;
      const left = `${Math.floor(n/step)*stepMargin}cm`;
      switch (sig) {
        case 'FILE': {
          o.push(`<div id='${id}' class='FILE' fName='${fname}'>`);
          o.push('');
          break;
        }
        case 'FEND': {
          o.push(`</div>`);
          o.push('');
          break;
        }
        case 'PART': {
          var text = data;
          o.push(`<div id='${id}' class='PART'>`);
          o.push(`<p style='margin:1em 0'>`);
          o.push(this.escape(text));
          o.push(`</p>`);
          o.push(`</div>`);
          o.push('');
          break;
        }
        case 'HDGS': {
          var [cat,text] = data;
          if (plevel) {
            cat += plevel;
          }
          if (cat == 0 && isarticle) {
            /// dont do anything
            break
          }
          switch (cat) {
            case 0:
              heading = 'CHAPTER';
              o.push(`<h1 id='${id}' class='${heading}' dept='${dept}' fName='${fname}' rows='${row1} ${row2}'>`);
              o.push(`Chapter ${dept} &#160; ${this.escape(text)}`);
              o.push(`<small><mark fName='${fname}' dept='${dept}'>[${id}]</mark></small>`);
              if (hidden) o.push(`<small>(hidden)</small>`);
              o.push(`</h1>`);
              break;
            case 1:
              heading = 'SECTION';
              o.push(`<h2 id='${id}' class='${heading}' dept='${dept}' fName='${fname}' rows='${row1} ${row2}'>`);
              o.push(`${dept} &#160; ${this.escape(text)}`);
              o.push(`<small><mark fName='${fname}' dept='${dept}'>[${id}]</mark></small>`);
              if (hidden) o.push(`<small>(hidden)</small>`);
              o.push(`</h2>`);
              break;
            case 2:
              heading = 'SUBSECTION';
              o.push(`<h3 id='${id}' class='${heading}' dept='${dept}' fName='${fname}' rows='${row1} ${row2}'>`);
              o.push(`${dept} &#160; ${this.escape(text)}`);
              o.push(`<small><mark fName='${fname}' dept='${dept}'>[${id}]</mark></small>`);
              if (hidden) o.push(`<small>(hidden)</small>`);
              o.push(`</h3>`);
              break;
            case 3:
              heading = 'SUBSUBSECTION';
              o.push(`<h4 id='${id}' class='${heading}' dept='${dept}' fName='${fname}' rows='${row1} ${row2}'>`);
              o.push(`${dept} &#160; ${this.escape(text)}`);
              o.push(`<small><mark fName='${fname}' dept='${dept}'>[${id}]</mark></small>`);
              if (hidden) o.push(`<small>(hidden)</small>`);
              o.push(`</h4>`);
              break;
            case 4:
              heading = 'SUBSUBSUBSECTION';
              o.push(`<h5 id='${id}' class='${heading}' dept='${dept}' fName='${fname}' rows='${row1} ${row2}'>`);
              o.push(`${dept} &#160; ${this.escape(text)}`);
              o.push(`<small><mark fName='${fname}' dept='${dept}'>[${id}]</mark></small>`);
              if (hidden) o.push(`<small>(hidden)</small>`);
              o.push(`</h5>`);
              break;
            default:
              heading = 'SUBSUBSUBSUBSECTION';
              o.push(`<h6 id='${id}' class='${heading}' dept='${dept}' fName='${fname}' rows='${row1} ${row2}'>`);
              o.push(`${dept} &#160; ${this.escape(text)}`);
              o.push(`<small><mark fName='${fname}' dept='${dept}'>[${id}]</mark></small>`);
              if (hidden) o.push(`<small>(hidden)</small>`);
              o.push(`</h6>`);
              break;
          }
          o.push('');
          break;
        }
        case 'VRSE': {
          if (hidden) { break; }
          o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' rows='${row1} ${row2}' style='margin-left:${left}'>`);
          o.push(`<blockquote style='margin:1em 0'>`);
          for (var text of data) {
            text = this.unmask(text);
            o.push(`${text}<br/>`);
          }
          o.push(`</blockquote>`);
          o.push(`</div>`);
          o.push('');
          break;
        }
        case 'CODE': {
          if (hidden) { break; }
          var text = data;
          if (fencecmd.listing) {
            o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' rows='${row1} ${row2}' style='margin-left:${left}'>`);
            o.push(`<figure style='margin:1em 0'>`);
            o.push(`<figcaption>Listing ${fig}: <small>[${id}]</small> ${this.unmask(caption)}</figcaption>`);
            text = text.map( x => this.escape(x) );
            var text = text.join('\n');
            o.push(`<pre>${text}</pre>`);
            o.push(`</figure>`);
            o.push(`</div>`);
            o.push('');
          } else if (fencecmd.n) {
            o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' rows='${row1} ${row2}' style='margin-left:${left}'>`);
            text = text.map( x => this.escape(x) );
            var linenum = 0;
            text = text.map( x => `<span><small>${this.expandString(++linenum,4,' ')}</small></span>${x}` );
            var text = text.join('\n');
            o.push(`<pre style='margin:1em 0'>${text}</pre>`);
            o.push(`</div>`);
            o.push('');
          } else {
            o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' rows='${row1} ${row2}' style='margin-left:${left}'>`);
            text = text.map( x => this.escape(x) );
            text = text.map( x => `${x}` );
            var text = text.join('\n');
            o.push(`<pre style='margin:1em 0'>${text}</pre>`);
            o.push(`</div>`);
            o.push('');
          }
          break;
        }
        case 'VERB': {
          if (hidden) { break; }
          var text = data;
          o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' rows='${row1} ${row2}' style='margin-left:${left}'>`);
          var text = text.join('\n');
          var text = this.escape(text);
          o.push(`<pre style='margin:1em 0'>${text}</pre>`);
          o.push(`</div>`);
          o.push('');
          break;
        }
        case 'PICT': {
          if (hidden) { break; }
          var text = data;
          if (fencecmd.figure) {
            o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' rows='${row1} ${row2}' style='margin-left:${left}'>`);
            o.push(`<figure style='margin:1em 0'>`);
            o.push(`<figcaption>Figure ${fig}: <small>[${id}]</small> ${this.unmask(caption)}</figcaption>`);
            for (var j in text) {
              var pp = text[j];
              const [what,opts,srcs,sub] = pp;
              if (what === 'image') {
                const src = srcs[0] || '';
                o.push(`<svg xmlns='http://www.w3.org/2000/svg' width="200" height="200">`);
                o.push(`<rect x='1' y='1' width='198' height='178' stroke='#333' fill='none'/>`);
                o.push(`<text x='100' y='20' text-anchor='middle' textLength='190'>${this.escape(src)}</text>`);
                o.push(`<text x='100' y='50' text-anchor='middle'>`);
                for (var key of ['width','height','frame']) {
                  var val = opts[key] || '';
                  o.push(`<tspan x='100' dy='1em'>${this.escape(key)}:${this.escape(val)}</tspan>`);
                }
                o.push(`</text>`);
                o.push(`<text x='0' y='195' font-size='10'>(${this.toSubfigNum(j)}) ${this.escape(this.toEllipsedText(sub,10))}</text>`);
                o.push(`</svg>`);

              } else {
                o.push(`<br/>`);
              }
            }
            o.push('</figure>');
            o.push('</div>');
            o.push('');
          } else {
            o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' rows='${row1} ${row2}' style='margin-left:${left}'>`);
            o.push(`<p style='margin:1em 0'>`);
            for (var j in text) {
              var pp = text[j];
              const [what,opts,srcs,sub] = pp;
              var src = srcs[0] || '';
              if (what === 'image' && src) {
                o.push(`<svg xmlns='http://www.w3.org/2000/svg' width="200" height="180">`);
                o.push(`<rect x='1' y='1' width='198' height='178' stroke='#333' fill='none'/>`);
                o.push(`<text x='100' y='20' text-anchor='middle' textLength='190'>${this.escape(src)}</text>`);
                o.push(`<text x='100' y='50' text-anchor='middle'`);
                for (var key of ['width','height','frame']) {
                  var val = opts[key] || '';
                  o.push(`<tspan x='100' dy='1em'>${this.escape(key)}:${this.escape(val)}</tspan>`);
                }
                o.push(`</text>`);
                o.push(`</svg>`);

              } else {
                o.push('<br/>');
              }
            }
            o.push('</p>');
            o.push('</div>');
            o.push('');
          }
          break;
        }
        case 'TABB': {
          if (hidden) { break; }
          var text = data;
          o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' rows='${row1} ${row2}' style='margin-left:${left}'>`);
          o.push(`<table style='margin:1em 0'>`);
          var maxj = this.matrixMaxJ(text);
          if (maxj == 0) {
            maxj = 1;
          }
          var text = text.map ( pp => this.expandList(pp,maxj,'') )
          var formats = this.toList(fencecmd.format);
          var rowcount = 0;
          for (var pp of text) {
            rowcount += 1;
            pp = pp.map(x => x.split('\n'));
            if (rowcount == 1) {
              pp = pp.map(x => x.map(y => this.escape(y)));
            } else {
              pp = pp.map((x,i) => x.map(y => this.style(formats[i],y)));
            }
            pp = pp.map(x => x.join('<br/>'));
            o.push('<tr>');
            if (rowcount == 1) {
              pp = pp.map(x => `<th style='text-align:center'>${x}</th>`);
              o.push(pp.join(''));
            } else {
              pp = pp.map((x,i) => `<td style='text-align:left'>${x}</td>`);
              o.push(pp.join(''));
            }
            o.push('</tr>');
          }
          o.push(`</table>`);
          o.push('</div>');
          o.push('');
          break;
        }
        case 'QUOT': {
          if (hidden) { break; }
          o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' rows='${row1} ${row2}' style='margin-left:${left}'>`);
          var text = this.unmask(data);
          o.push(`<blockquote style='margin:1em 0'><q>${text}</q></blockquote>`);
          o.push('</div>');
          o.push('');
          break;
        }
        case 'TERM': {
          if (hidden) { break; }
          if (fencecmd.table) {
            var text = data;
            o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' rows='${row1} ${row2}' style='margin-left:${left}'>`);
            o.push(`<table width='100%' style='margin:1em 0'>`);
            o.push(`<colgroup>`);
            o.push(`<col width='30%'/>`);
            o.push(`<col width='70%'/>`);
            o.push(`</colgroup>`);
            o.push(`<tbody>`);
            for (var i=0; i < text.length; i+=2) {
              var dt = text[i];
              var dd = text[i+1];
              if (i==0) {
                dt = this.escape(dt);
                dd = this.escape(dd);
              } else {
                dt = this.style('mono',dt);
                dd = this.unmask(dd);
              }
              if (i == 0) {
                o.push(`<tr><th style='text-align:left'>${dt}</th><th style='text-align:left'>${dd}</th></tr>`);
              } else {
                o.push(`<tr><td style='text-align:left'>${dt}</td><td style='text-align:left'>${dd}</td></tr>`);
              }
            }
            o.push(`</tbody>`);
            o.push(`</table>`);
            o.push('</div>');
            o.push('');
          } else {
            var text = data;
            o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' rows='${row1} ${row2}' style='margin-left:${left}'>`);
            o.push(`<dl style='margin:1em 0'>`);
            for(var i=0; i < text.length; i+=2) {
              var dt = text[i];
              var dd = text[i+1];
              var dt = this.escape(dt);
              var dd = this.unmask(dd);
              o.push(`<dt><code>${dt}</code></dt>`);
              o.push(`<dd style='padding-left:1cm'>${dd}</dd>`);
            }
            o.push('</dl>');
            o.push('</div>');
            o.push('');
          }
          break;
        }
        case 'EQTN': {
          if (hidden) { break; }
          o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' rows='${row1} ${row2}'>`);
          o.push(`<figure style='margin:1em 0'>`);
          o.push(`<figcaption>Equation ${fig}:</figcaption>`);
          var text = data;
          for (var s of text) {
            s = this.tokenizer.parse(s,true);
            o.push(s);
            o.push('<br/>');
          }
          o.push(`</figure>`);
          o.push('</div>');
          o.push('');
          break;
        }
        case 'DESC': {
          if (hidden) { break; }
          o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' rows='${row1} ${row2}'>`);
          o.push(`<dl style='margin:1em 0'>`);
          var [ cat, keys, text, xn ] = data;
          const xleft = `${Math.floor(xn/step)*stepMargin}cm`;
          for (i=0; i < keys.length; ++i) {
            if (cat === 'mono') {
              o.push(`<dt><code><b>${this.escape(keys[i])}</b></code></dt>`);
            } else if (cat === 'strong') {
              o.push(`<dt><b>${this.escape(keys[i])}</b></dt>`);
            } else {
              o.push(`<dt><b><i>${this.escape(keys[i])}</i></b></dt>`);
            }
          }
          o.push(`<dd style='margin-left:${xleft}'>${this.unmask(text)}</dd>`);
          o.push('</dl>');
          o.push('</div>');
          o.push('');
          break;
        }
        case 'PRIM': {
          if (hidden) { break; }
          var [lead,text] = data;
          o.push(`<div id='${id}' class='PRIM' dept='${dept}' fName='${fname}' rows='${row1} ${row2}'>`);
          o.push(`<p style='margin:1em 0'>`);
          o.push(`<b>${this.escape(lead)}</b>`);
          o.push(`${this.unmask(text)}`);
          o.push('</p>');
          o.push('</div>');
          o.push('');
          break;
        }
        case 'SECO': {
          if (hidden) { break; }
          var [lead,text] = data;
          o.push(`<div id='${id}' class='SECO' dept='${dept}' fName='${fname}' rows='${row1} ${row2}'>`);
          o.push(`<p style='margin:1em 0'>`);
          o.push(`&#160; &#160; &#160; <b>${this.escape(lead)}</b>`);
          o.push(`${this.unmask(text)}`);
          o.push('</p>');
          o.push('</div>');
          o.push('');
          break;
        }
        case 'PLST': {
          if (hidden) { break; }
          o.push(`<div id='${id}' class='${sig}' dept='${dept}' fName='${fname}' rows='${row1} ${row2}' style='margin-left:${left}'>`);
          o.push(`<p style='margin:1em 0'>`);
          for (var item of data) {
            var [lead,bullet,text] = item;
            bullet = bullet || '';
            text = text || '';
            if (bullet === '-') {
              var v = text.match(this.re_bullet_text);
              if (v) {
                text = `<i>${this.escape(v[1])}</i> ${v[2]} ${this.unmask(v[3])}`;
              } else {
                text = this.unmask(text);
              }
              bullet = '';
            } else if (bullet === '+') {
              var v = text.match(this.re_bullet_text);
              if (v) {
                text = `<code>${this.escape(v[1])}</code> ${v[2]} ${this.unmask(v[3])}`;
              } else {
                text = this.unmask(text);
              }
              bullet = '';
            } else if (bullet === '*') {
              var v = text.match(this.re_bullet_text);
              if (v) {
                text = `<b>${this.escape(v[1])}</b> ${v[2]} ${this.unmask(v[3])}`;
              } else {
                text = this.unmask(text);
              }
              bullet = '';
            } else if (bullet.match(/^\d+\.$/)) {
              bullet = this.chomp(bullet);
              text = this.unmask(text);
            } else {
              bullet = '';
              text = this.unmask(text);
            }
            if (item.length === 3) {
              switch (lead) {
                case 'OL': {
                  o.push(`<ol style='padding-left:${stepMargin}cm;list-style-position:outside;'><li value='${bullet}'>${text}`);
                  break;
                }
                case 'UL': {
                  o.push(`<ul style='padding-left:${stepMargin}cm;list-style-position:outside;'><li value='${bullet}'>${text}`);
                  break;
                }
                case 'LI': {
                  o.push(`</li><li value='${bullet}'>${text}`);
                  break;
                }
                case '/OL': {
                  o.push(`</li></ol></li><li value='${bullet}'>${text}`);
                  break;
                }
                case '/UL': {
                  o.push(`</li></ul></li><li value='${bullet}'>${text}`);
                  break;
                }
              }
            } else if (item.length == 1) {
              if (item[0] === '/OL') {
                o.push('</li></ol>');
              } else if (item[0] === '/UL') {
                o.push('</li></ul>');
              }
            }
          }
          o.push('</p>');
          o.push('</div>');
          o.push('');
          break;
        }
        case '': {
          if (hidden) { break; }
          o.push(`<div id='${id}' class='TEXT' dept='${dept}' fName='${fname}' rows='${row1} ${row2}' style='margin-left:${left}'>`);
          var text = this.unmask(data);
          if (parskip) {
            o.push(`<p style='margin:1em 0'>${text}</p>`);
          } else {
            /// checks the 'heading' variable and if it is set to 'CHAPTER', 'SECTION', etc.,
            /// then this is the first content block for this dept.
            if (heading) {
              o.push(`<p style='margin:0'>${text}</p>`);
              heading = '';
            } else {
              o.push(`<p style='margin:0;text-indent:0.5cm'>${text}</p>`);
            }
          }
          o.push('</div>');
          o.push('');
          break;
        }
      }
    }
    return o;
  }

  /*
    Returns a safe string suitable for HTML
  */
  escape (unsafe) {
    unsafe = ''+unsafe; /// force it to be a string when it can be a interger
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
  }

  /*
    return the styled inline text
  */
  style (type, text) {
    type = type || '';
    switch (type) {
      case 'inlinemath': {
        var s = this.tokenizer.parse(text);
        return s;
        break;
      }
      case 'displaymath': {
        var s = this.tokenizer.parse(text,true);
        return s;
        break;
      }
      case 'mono': {
        return `<code>${this.escape(text)}</code>`
        break;
      }
      case 'em': {
        return `<i>${this.escape(text)}</i>`
        break;
      }
      case 'strong': {
        return `<b>${this.escape(text)}</b>`
        break;
      }
      case 'uri': {
        const [cnt,uri] = text;
        if (cnt) {
          return `<span>${this.escape(cnt)}</span><span style='word-break:break-all'>(<code>${this.escape(uri)}</code>)</span>`
        } else {
          return `<span style='word-break:break-all'><code>${this.escape(uri)}</code></span>`
        }
        break;
      }
      case 'ruby': {
        const [rb,rt] = text;
        return `<ruby><rb>${this.escape(rb)}</rb><rt>${this.escape(rt)}</rt></ruby>`
        break;
      }
      case 'ref': {
        /// checks to see if it exists in 'this.xrefs' database
        if (this.xrefs[text]) {
          var label = text;
          var alt_text = this.xrefs[text];
          return `<a href='#${label}'>${this.escape(alt_text)}</a> <small>\[${text}\]</small>`
        } else {
          var label = text;
          return `?? <small><s>\[${label}\]</s></small>`
        }
        break;
      }
      default: {
        return `<span>${this.escape(text)}</span>`
        break;
      }
    }
  }

  columnsToTableCellStyles (ll) {
    var o = [];
    var re_p = /^p\{(.*)\}$/;
    for (var s of ll) {
      if (s === 'l') {
        o.push('text-align:left');
      } else if (s === 'r') {
        o.push('text-align:right');
      } else if (s === 'c') {
        o.push('text-align:center');
      } else if (s === 'L') {
        o.push('');
      } else {
        var v = re_p.exec(s);
        if (v) {
          o.push(`width:${v[1]}`);
        } else {
          o.push('');
        }
      }
    }
    return o;
  }
}

module.exports = { NitrilePreviewHtml };
