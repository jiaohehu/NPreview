'use babel';

const { NitrilePreviewParser } = require('./nitrile-preview-parser');

class NitrilePreviewHtml extends NitrilePreviewParser {

  constructor() {
    super();
  }

  /*
    return a set of lines that is the result of converting
    to output from blocks
    */
  translate (config,blocks,isarticle,o) {
    /// as it was used before to search for ref-id given a file name
    o = o || [];
    const step = config['step'];
    const indentMargin = config['indentMargin'];
    var heading = '';
    var label = '';
    this.block = [];
    for (var block of blocks) {
      /// store the current processed block so that it
      /// can be accessed by 'unmask' function to find out
      /// what block is currently being processed
      this.block = block;
      const [id,row1,row2,type,n,data,para,fencecmd,refname,caption,fname,plevel] = block;
      const left = `${Math.floor(n/step)*indentMargin}cm`;
      switch (type) {
        case 'HDGS': {
          var [cat,text] = data;
          if (plevel) {
            cat += plevel;
          }
          switch (cat) {
            case 0:
              if (isarticle) {
                // do nothing
              } else {
                heading = 'CHAPTER';
                label = id;
                o.push(`<h1 id='${id}' class='CHAPTER' label='${label}' rows='${row1} ${row2}'>`);
                o.push(`Chapter ${refname} &#160; ${this.escape(text)}`);
                o.push(`<small><mark class='ARTICLE' label='${id}'>[${id}]</mark></small>`);
                o.push(`</h1>`);
              }
              break;
            case 1:
              heading = 'SECTION';
              label = id;
              o.push(`<h2 id='${id}' class='SECTION' label='${label}' rows='${row1} ${row2}'>`);
              o.push(`${refname} &#160; ${this.escape(text)}`);
              o.push(`<small><mark class='ARTICLE' label='${id}'>[${id}]</mark></small>`);
              o.push(`</h2>`);
              break;
            case 2:
              heading = 'SUBSECTION';
              label = id;
              o.push(`<h3 id='${id}' class='SUBSECTION' label='${label}' rows='${row1} ${row2}'>`);
              o.push(`${refname} &#160; ${this.escape(text)}`);
              o.push(`<small><mark class='ARTICLE' label='${id}'>[${id}]</mark></small>`);
              o.push(`</h3>`);
              break;
            case 3:
              heading = 'SUBSUBSECTION';
              label = id;
              o.push(`<h4 id='${id}' class='SUBSUBSECTION' label='${label}' rows='${row1} ${row2}'>`);
              o.push(`${refname} &#160; ${this.escape(text)}`);
              o.push(`<small><mark class='ARTICLE' label='${id}'>[${id}]</mark></small>`);
              o.push(`</h4>`);
              break;
            case 4:
              o.push(`<div id='${id}' class='PARAGRAPH' label='${label}' rows='${row1} ${row2}'>`);
              o.push('<p>');
              o.push(`<b>${this.escape(text)}</b> &#160;`);
              o.push('</p>');
              o.push(`</div>`);
              this.heading = 'PARAGRAPH';
              break;
            default:
              o.push(`<div id='${id}' class='SUBPARAGRAPH' label='${label}' rows='${row1} ${row2}'>`);
              o.push('<p>');
              o.push(`&#160; &#160; &#160; <b>${this.escape(text)}</b> &#160;`);
              o.push('</p>');
              o.push(`</div>`);
              this.heading = 'SUBPARAGRAPH';
              break;
          }
          o.push('');
          break;
        }
        case 'VRSE': {
          o.push(`<div id='${id}' class='${type}' label='${label}' rows='${row1} ${row2}' style='margin-left:${left}'>`);
          o.push(`<blockquote>`);
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
          var text = data;
          if (fencecmd.listing) {
            o.push(`<div id='${id}' class='${type}' label='${label}' rows='${row1} ${row2}' style='margin-left:${left}'>`);
            o.push(`<figure>`);
            o.push(`<figcaption>Listing ${refname}: <small><mark>[${id}]</mark></small> ${this.unmask(caption)}</figcaption>`);
            text = text.map( x => this.escape(x) );
            var text = text.join('\n');
            o.push(`<pre>${text}</pre>`);
            o.push(`</figure>`);
            o.push(`</div>`);
            o.push('');
          } else if (fencecmd.n) {
            o.push(`<div id='${id}' class='${type}' label='${label}' rows='${row1} ${row2}' style='margin-left:${left}'>`);
            text = text.map( x => this.escape(x) );
            var linenum = 0;
            text = text.map( x => `<span><small>${this.expandString(++linenum,4,' ')}</small></span>${x}` );
            var text = text.join('\n');
            o.push(`<pre>${text}</pre>`);
            o.push(`</div>`);
            o.push('');
          } else {
            o.push(`<div id='${id}' class='${type}' label='${label}' rows='${row1} ${row2}' style='margin-left:${left}'>`);
            text = text.map( x => this.escape(x) );
            text = text.map( x => `${x}` );
            var text = text.join('\n');
            o.push(`<pre>${text}</pre>`);
            o.push(`</div>`);
            o.push('');
          }
          break;
        }
        case 'VERB': {
          var text = data;
          if (fencecmd['frame']) {
            o.push(`<div id='${id}' class='${type}' label='${label}' rows='${row1} ${row2}' style='border:1px solid;margin-left:${left}'>`);
            var text = text.join('\n');
            var text = this.escape(text);
            o.push(`<pre>${text}</pre>`);
            o.push(`</div>`);
            o.push('');
          } else {
            o.push(`<div id='${id}' class='${type}' label='${label}' rows='${row1} ${row2}' style='margin-left:${left}'>`);
            var text = text.join('\n');
            var text = this.escape(text);
            o.push(`<pre>${text}</pre>`);
            o.push(`</div>`);
            o.push('');
          }
          break;
        }
        case 'PICT': {
          var text = data;
          if (fencecmd.figure) {
            o.push(`<div id='${id}' class='${type}' label='${label}' rows='${row1} ${row2}' style='margin-left:${left}'>`);
            o.push(`<figure>`);
            o.push(`<figcaption>Figure ${refname}: <small><mark>[${id}]</mark></small> ${this.unmask(caption)}</figcaption>`);
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
            o.push(`<div id='${id}' class='${type}' label='${label}' rows='${row1} ${row2}' style='margin-left:${left}'>`);
            o.push('<p>');
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
          var text = data;
          o.push(`<div id='${id}' class='${type}' label='${label}' rows='${row1} ${row2}' style='margin-left:${left}'>`);
          o.push(`<table>`);
          var maxj = this.matrixMaxJ(text);
          if (maxj == 0) {
            maxj = 1;
          }
          var ll = this.expandList(this.toList(fencecmd.columns),maxj,'l');
          var ll = this.columnsToTableCellStyles(ll);
          var text = text.map ( pp => this.expandList(pp,maxj,'') )
          var styles = this.toList(fencecmd.style);
          var rowcount = 0;
          for (var pp of text) {
            rowcount += 1;
            pp = pp.map(x => x.split('\n'));
            if (rowcount == 1) {
              pp = pp.map(x => x.map(y => this.escape(y)));
            } else {
              pp = pp.map((x,i) => x.map(y => this.style(styles[i],y)));
            }
            pp = pp.map(x => x.join('<br/>'));
            o.push('<tr>');
            if (rowcount == 1) {
              pp = pp.map(x => `<th>${x}</th>`);
              o.push(pp.join(''));
            } else {
              pp = pp.map((x,i) => `<td style='${ll[i]}'>${x}</td>`);
              o.push(pp.join(''));
            }
            o.push('</tr>');
          }
          o.push(`</table>`);
          o.push('</div>');
          o.push('');
          break;
        }
        case 'TERM': {
          o.push(`<div id='${id}' class='${type}' label='${label}' rows='${row1} ${row2}' style='margin-left:${left}'>`);
          o.push('<dl>');
          for(var i=0; i < data.length; i+=2) {
            var dt = data[i];
            var dd = data[i+1];
            var dt = this.escape(dt);
            var dd = this.unmask(dd);
            o.push(`<dt><code>${dt}</code></dt>`);
            o.push(`<dd style='padding-left:1cm'>${dd}</dd>`);
          }
          o.push('</dl>');
          o.push('</div>');
          o.push('');
          break;
        }
        case 'QUOT': {
          o.push(`<div id='${id}' class='${type}' label='${label}' rows='${row1} ${row2}' style='margin-left:${left}'>`);
          var text = this.unmask(data);
          o.push(`<blockquote><q>${text}</q></blockquote>`);
          o.push('</div>');
          o.push('');
          break;
        }
        case 'SPEC': {
          var text = data;
          o.push(`<div id='${id}' class='${type}' label='${label}' rows='${row1} ${row2}' style='margin-left:${left}'>`);
          o.push(`<table style='width:100%'>`);
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
              o.push(`<tr><th style='width:20%'>${dt}</th><th style='width:80%'>${dd}</th></tr>`);
            } else {
              o.push(`<tr><td style='width:20%'>${dt}</td><td style='width:80%'>${dd}</td></tr>`);
            }
          }
          o.push(`</table>`);
          o.push('</div>');
          o.push('');
          break;
        }
        case 'DESC': {
          o.push(`<div id='${id}' class='${type}' label='${label}' rows='${row1} ${row2}'>`);
          o.push('<dl>');
          var [ cat, keys, text, xn ] = data;
          var xleft = `${step*xn}cm`;
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
          var [lead,text] = data;
          o.push(`<div id='${id}' class='PARAGRAPH' label='${label}' rows='${row1} ${row2}'>`);
          o.push('<p>');
          o.push(`<b>${this.escape(lead)}</b> &#160;`);
          o.push(`${this.unmask(text)}`);
          o.push('</p>');
          o.push('</div>');
          o.push('');
          break;
        }
        case 'SECO': {
          var [lead,text] = data;
          o.push(`<div id='${id}' class='SUBPARAGRAPH' label='${label}' rows='${row1} ${row2}'>`);
          o.push('<p>');
          o.push(`&#160; &#160; &#160; <b>${this.escape(lead)}</b> &#160;`);
          o.push(`${this.unmask(text)}`);
          o.push('</p>');
          o.push('</div>');
          o.push('');
          break;
        }
        case 'PLST': {
          o.push(`<div id='${id}' class='${type}' label='${label}' rows='${row1} ${row2}' style='margin-left:${left}'>`);
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
                  o.push(`<ol style='padding-left:${indentMargin}cm;list-style-position:outside;'><li value='${bullet}'>${text}`);
                  break;
                }
                case 'UL': {
                  o.push(`<ul style='padding-left:${indentMargin}cm;list-style-position:outside;'><li value='${bullet}'>${text}`);
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
          o.push('</div>');
          o.push('');
          break;
        }
        default: {
          if (heading === 'PARAGRAPH' || heading === 'SUBPARAGRAPH') {
            heading = '';
            o.pop();
            o.pop();
            o.pop();
            var text = this.unmask(data);
            o.push(`${text}`);
            o.push('</p>');
            o.push('</div>');
            o.push('');
          } else {
            o.push(`<div id='${id}' class='TEXT' label='${label}' rows='${row1} ${row2}' style='margin-left:${left}'>`);
            var text = this.unmask(data);
            o.push(`<p>${text}</p>`);
            o.push('</div>');
            o.push('');
          }
          break;
        }
      }
    }
    return o;
  }

  translateBook (blocks,o) {
    o = o || [];
    var fname0 = '';
    for (var block of blocks) {
      const [id,row1,row2,type,n,data,para,fencecmd,refname,caption,fname,plevel] = block;
      switch (type) {
        case 'FILE': {
          if (fname0) {
            o.push(`</div>`);
          }
          fname0 = fname;
          o.push(`<div id='${id}' class='FILE' src='${fname0}'>`);
          break;
        }
        case 'HDGS': {
          var [cat,text] = data;
          if (plevel) {
            cat += plevel;
          }
          switch (cat) {
            case 0:
              o.push(`<h1 id='${id}' class='CHAPTER'>`);
              o.push(`${refname} &#160; ${this.escape(text)}`);
              o.push(`<small><mark class='BOOK' label='${id}' src='${fname}'>[${id}]</mark></small>`);
              o.push(`</h1>`);
              break;
            case 1:
              o.push(`<h2 id='${id}' class='SECTION'>`);
              o.push(`${refname} &#160; ${this.escape(text)}`);
              o.push(`<small><mark class='BOOK' label='${id}' src='${fname}'>[${id}]</mark></small>`);
              o.push(`</h2>`);
              break;
            case 2:
              o.push(`<h3 id='${id}' class='SUBSECTION'>`);
              o.push(`${refname} &#160; ${this.escape(text)}`);
              o.push(`<small><mark class='BOOK' label='${id}' src='${fname}'>[${id}]</mark></small>`);
              o.push(`</h3>`);
              break;
            case 3:
              o.push(`<h4 id='${id}' class='SUBSUBSECTION'>`);
              o.push(`${refname} &#160; ${this.escape(text)}`);
              o.push(`<small><mark class='BOOK' label='${id}' src='${fname}'>[${id}]</mark></small>`);
              o.push(`</h4>`);
              break;
          }
          o.push('');
          break;
        }
      }
    }
    if (fname0) {
      o.push(`</div>`);
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
        return `<small><mark>\[${this.escape(text)}\]</mark></small>`
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
