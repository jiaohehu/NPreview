'use babel';

const { NitrilePreviewParser } = require('./nitrile-preview-parser');

class NitrilePreviewHtml extends NitrilePreviewParser {

  constructor() {
    super();
    this.title = '';
    this.author = '';
    this.secnum = 0;
    this.subsecnum = 0;
    this.subsubsecnum = 0;
    this.fignum = 0;
    this.lstnum = 0;
  }

  /*
    return a set of lines that is the result of converting
    to output from blocks
    */
  translate (blocks,isarticle,o) {
    /// as it was used before to search for ref-id given a file name
    o = o || [];
    if (blocks.length == 1 && blocks[0][3] === '%!BOOK') {
      var block = blocks[0];
      this.block = block;
      const [id,row1,row2,type,n,data,para,ins,ins_local,ins_text,fname,plevel] = block;
      o.push(`<div`);
      o.push('<p>');
      for (var text of para) {
        var re = /^(\:+)\s+(.*)$/;
        var v = text.match(re);
        if (v) {
          o.push(`<tt>${v[1]} <a href='file://${v[2]}'>${v[2]}</a></tt><br/>`);
        } else {
          o.push(`<tt>${text}</tt><br/>`);
        }
      }
      o.push('</p>');
      o.push(`</div>`);
      o.push('');
      return o;
    }
    o.push(`<div style='box-sizing:border-box;width:8.5in;padding:1in 1.25in 1in 1.5in;margin:0;font-size:12pt;background-color:white;'>`);
    const step = 0.25;
    for (var block of blocks) {
      this.block = block;
      const [id,row1,row2,type,n,data,para,ins,ins_local,ins_text,fname,plevel] = block;
      const left = `${step*n}cm`;
      switch (type) {
        case 'HDGS': {
          var [cat,text] = data;
          if (plevel) {
            cat += plevel;
          }
          switch (cat) {
            case 0:
              if (isarticle) {
                this.title = text;
                o.push(`<div id='${id}' class='TITLE' rows='${row1} ${row2}'>`);
                o.push(`<p>`);
                o.push(`${this.escape(text)}`);
                o.push(`</p>`);
                o.push(`</div>`);
                o.push('');
                o.push(`<div class='DATE'>`);
                o.push(`<p>`);
                o.push(`${this.escape(new Date().toLocaleDateString())}`);
                o.push(`</p>`);
                o.push(`</div>`);
              } else {
                o.push(`<div id='${id}' class='${type}' rows='${row1} ${row2}'>`);
                o.push(`<h1>`);
                o.push(`${this.escape(text)}`);
                o.push(`<small><mark>[${id}]</mark></small>`);
                o.push(`</h1>`);
                o.push(`</div>`);
              }
              break;
            case 1:
              this.secnum += 1;
              this.subsecnum = 0;
              this.subsubsecnum = 0;
              o.push(`<div id='${id}' class='${type}' rows='${row1} ${row2}'>`);
              o.push(`<h2>`);
              o.push(`${this.secnum} &#160; ${this.escape(text)}`);
              o.push(`<small><mark>[${id}]</mark></small>`);
              o.push(`</h2>`);
              o.push(`</div>`);
              break;
            case 2:
              this.subsecnum += 1;
              this.subsubsecnum = 0;
              o.push(`<div id='${id}' class='${type}' rows='${row1} ${row2}'>`);
              o.push(`<h3>`);
              o.push(`${this.secnum}.${this.subsecnum} &#160; ${this.escape(text)}`);
              o.push(`<small><mark>[${id}]</mark></small>`);
              o.push(`</h3>`);
              o.push(`</div>`);
              break;
            default:
              this.subsubsecnum += 1;
              o.push(`<div id='${id}' class='${type}' rows='${row1} ${row2}'>`);
              o.push(`<h4>`);
              o.push(`${this.secnum}.${this.subsecnum}.${this.subsubsecnum} &#160; ${this.escape(text)}`);
              o.push(`<small><mark>[${id}]</mark></small>`);
              o.push(`</h4>`);
              o.push(`</div>`);
              break;
          }
          o.push('');
          break;
        }
        case 'VRSE': {
          o.push(`<div id='${id}' class='${type}' rows='${row1} ${row2}' style='margin-left:${left}'>`);
          o.push(`<p>`);
          for (var text of data) {
            text = this.unmask(text);
            o.push(`${text}<br/>`);
          }
          o.push(`</p>`);
          o.push(`</div>`);
          o.push('');
          break;
        }
        case 'LSTG': {
          this.lstnum += 1;
          o.push(`<div id='${id}' class='${type}' rows='${row1} ${row2}' style='margin-left:${left}'>`);
          o.push(`<figure>`);
          o.push(`<figcaption>Listing ${this.lstnum}: <small><mark>[${id}]</mark></small> ${this.unmask(ins_text)}</figcaption>`);
          text = data.map( x => this.escape(x) );
          var linenum = 0;
          text = text.map( x => `<span>${++linenum}</span>${x}` );
          var text = text.join('\n');
          o.push(`<pre>${text}</pre>`);
          o.push(`</figure>`);
          o.push(`</div>`);
          o.push('');
          break;
        }
        case 'CODE': {
          var [text,fencecmd] = data;
          if (fencecmd['n']) {
            o.push(`<div id='${id}' class='${type}' rows='${row1} ${row2}' style='margin-left:${left}'>`);
            text = text.map( x => this.escape(x) );
            var linenum = 0;
            text = text.map( x => `<span><small>${this.expandString(++linenum,4,' ')}</small></span>${x}` );
            var text = text.join('\n');
            o.push(`<pre>${text}</pre>`);
            o.push(`</div>`);
            o.push('');
          } else {
            o.push(`<div id='${id}' class='${type}' rows='${row1} ${row2}' style='margin-left:${left}'>`);
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
          var [text,fencecmd] = data;
          if (fencecmd['frame']) {
            o.push(`<div id='${id}' class='${type}' rows='${row1} ${row2}' style='border:1px solid;margin-left:${left}'>`);
            var text = text.join('\n');
            var text = this.escape(text);
            o.push(`<pre>${text}</pre>`);
            o.push(`</div>`);
            o.push('');
          } else {
            o.push(`<div id='${id}' class='${type}' rows='${row1} ${row2}' style='margin-left:${left}'>`);
            var text = text.join('\n');
            var text = this.escape(text);
            o.push(`<pre>${text}</pre>`);
            o.push(`</div>`);
            o.push('');
          }
          break;
        }
        case 'FIGE': {
          this.fignum += 1;
          o.push(`<div id='${id}' class='${type}' rows='${row1} ${row2}'>`);
          o.push(`<figure>`);
          o.push(`<figcaption>Figure ${this.fignum}: <small><mark>[${id}]</mark></small> ${this.unmask(ins_text)}</figcaption>`);
          for (var j in data) {  
            var pp = data[j];
            const [what,opts,srcs,sub] = pp;
            if (what === 'image') {
              const src = srcs[0] || '';
              o.push(`<svg width="200" height="200">`);
              o.push(`<rect x='1' y='1' width='198' height='178' stroke='#333' fill='none'/>`);
              o.push(`<text x='100' y='20' text-anchor='middle' textLength='190'>${this.escape(src)}</text>`);
              o.push(`<text x='100' y='50' text-anchor='middle'`);
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
          break;
        }
        case 'PICT': {
          o.push(`<div id='${id}' class='${type}' rows='${row1} ${row2}' style='margin-left:${left}'>`);
          o.push('<p>');
          for (var j in data) {
            var pp = data[j];
            const [what,opts,srcs,sub] = pp;
            const src = srcs[0] || '';
            if (what === 'image') {
              o.push(`<svg width="200" height="180">`);
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
          break;
        }
        case 'TABB': {
          o.push(`<div id='${id}' class='${type}' rows='${row1} ${row2}' style='margin-left:${left}'>`);
          o.push(`<table>`);
          var maxj = this.matrixMaxJ(data);
          if (maxj == 0) {
            maxj = 1;
          }
          var text = data.map ( pp => this.expandRow(pp,maxj,'') )
          var text = text.map ( pp => {
             pp = pp.map(x => this.unmask(x));
             pp = pp.map(x => x.split('\n'));
             pp = pp.map(x => x.join('<br/>'));
             return pp;
          });
          for (var pp of text) {
            o.push('<tr>');
            for (var j=0; j < pp.length; ++j) {
              var ppj = pp[j];
              o.push(`<td>${ppj}</td>`);
            }
            o.push('</tr>');
          }
          o.push(`</table>`);
          o.push('</div>');
          o.push('');
          break;
        }
        case 'TERM': {
          o.push(`<div id='${id}' class='${type}' rows='${row1} ${row2}' style='margin-left:${left}'>`);
          o.push('<dl>');
          for(var i=0; i < data.length; i+=2) {
            var dt = data[i];
            var dd = data[i+1];
            var dt = this.escape(dt);
            var dd = this.unmask(dd);
            o.push(`<dt><tt>${dt}</tt></dt>`);
            o.push(`<dd style='padding-left:1cm'>${dd}</dd>`);
          }
          o.push('</dl>');
          o.push('</div>');
          o.push('');
          break;
        }
        case 'QUOT': {
          o.push(`<div id='${id}' class='${type}' rows='${row1} ${row2}' style='margin-left:${left}'>`);
          var text = this.unmask(data);
          o.push(`<blockquote><q>${text}</q></blockquote>`);
          o.push('</div>');
          o.push('');
          break;
        }
        case 'DESC': {
          o.push(`<div id='${id}' class='${type}' rows='${row1} ${row2}'>`);
          o.push('<dl>');
          var [ keys, text, xn ] = data;
          var xleft = `${step*xn}cm`;
          for (i=0; i < keys.length; ++i) {
            o.push(`<dt><b><tt>${this.escape(keys[i])}</tt></b></dt>`);
          }
          o.push(`<dd style='margin-left:${xleft}'>${this.unmask(text)}</dd>`);
          o.push('</dl>');
          o.push('</div>');
          o.push('');
          break;
        }
        case 'PRIM': {
          o.push(`<div id='${id}' class='${type}' rows='${row1} ${row2}'>`);
          o.push('<p>');
          var [lead,text] = data;
          o.push(`<b>${this.escape(lead)}</b> &#160; ${this.unmask(text)}`);
          o.push('</p>');
          o.push('</div>');
          o.push('');
          break;
        }
        case 'SECO': {
          o.push(`<div id='${id}' class='${type}' rows='${row1} ${row2}'>`);
          o.push('<p>');
          var [lead,text] = data;
          o.push(`&#160;&#160;&#160; <b>${this.escape(lead)}</b> &#160; ${this.unmask(text)}`);
          o.push('</p>');
          o.push('</div>');
          o.push('');
          break;
        }
        case 'PLST': {
          o.push(`<div id='${id}' class='${type}' rows='${row1} ${row2}' style='margin-left:${left}'>`);
          for (var item of data) {
            var [lead,bullet,text] = item;
            bullet = bullet || '';
            text = text || '';
            if (bullet === '*') {
              var v = text.match(this.re_bullet_text);
              if (v) {
                text = `<tt>${this.escape(v[1])}</tt> ${v[2]} ${this.unmask(v[3])}`;
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
                  o.push(`<ol style='padding-left:3ex;list-style-position:outside'><li value='${bullet}'>${text}`);
                  break;
                }
                case 'UL': {
                  o.push(`<ul style='padding-left:3ex;list-style-position:outside'><li value='${bullet}'>${text}`);
                  break;
                }
                case 'LI': {
                  o.push(`</li><li value='${bullet}'>${text}`);
                  break;
                }
                case '/OL': {
                  o.push(`</li></ol><li value='${bullet}'>${text}`);
                  break;
                }
                case '/UL': {
                  o.push(`</li></ul><li value='${bullet}'>${text}`);
                  break;
                }
              }
            } else if (item.length == 1) {
              if (item[0] === '/OL') {
                o.push('</ol>');
              } else if (item[0] === '/UL') {
                o.push('</ul>');
              }
            }
          }
          o.push('</div>');
          o.push('');
          break;
        }
        default: {
          o.push(`<div id='${id}' class='PARA' rows='${row1} ${row2}' style='margin-left:${left}'>`);
          var text = this.unmask(data);
          o.push(`<p>${text}</p>`);
          o.push('</div>');
          o.push('');
          break;
        }
      }
    }
    o.push(`</div>`);
    return o;
  }

  /*
    Translate only the HDGS block and ignore everything else
    */
  translateHdgsOnly (title,author,blocks,o) {
    o = o || [];
    o.push(`<div style='box-sizing:border-box;width:8.5in;padding:1in 1.25in 1in 1.5in;margin:0;font-size:12pt;background-color:white;'>`);
    o.push(`<div class='TITLE'>`);
    o.push(`<p>`);
    o.push(`${this.escape(title)}`);
    o.push(`</p>`);
    o.push(`</div>`);
    o.push(`<div class='AUTHOR'>`);
    o.push(`<p>`);
    o.push(`${this.escape(author)}`);
    o.push(`</p>`);
    o.push(`</div>`);
    o.push(`<div class='DATE'>`);
    o.push(`<p>`);
    o.push(`${this.escape(new Date().toLocaleDateString())}`);
    o.push(`</p>`);
    o.push(`</div>`);
    var chapnum = 0;
    for (var block of blocks) {
      const [id,row1,row2,type,n,data,para,ins,ins_local,ins_text,fname,plevel] = block;
      switch (type) {
        case 'HDGS': {
          o.push(`<div id='${id}' class='${type}' rows='${row1} ${row2}'>`);
          var [cat,text] = data;
          if (plevel) {
            cat += plevel;
          }
          switch (cat) {
            case 0:
              chapnum += 1;
              this.secnum = 0;
              this.subsecnum = 0;
              this.subsubsecnum = 0;
              this.fignum = 0;
              this.lstnum = 0;
              o.push(`<h1>`);
              o.push(`Chapter ${chapnum} &#160; ${this.escape(text)}`);
              o.push(`<small><mark>[${id}]</mark></small>`);
              o.push(`</h1>`);
              break;
            case 1:
              this.secnum += 1;
              this.subsecnum = 0;
              this.subsubsecnum = 0;
              o.push(`<h2>`);
              o.push(`${chapnum}.${this.secnum} &#160; ${this.escape(text)}`);
              o.push(`<small><mark>[${id}]</mark></small>`);
              o.push(`</h2>`);
              break;
            case 2:
              this.subsecnum += 1;
              this.subsubsecnum = 0;
              o.push(`<h3>`);
              o.push(`${chapnum}.${this.secnum}.${this.subsecnum} &#160; ${this.escape(text)}`);
              o.push(`<small><mark>[${id}]</mark></small>`);
              o.push(`</h3>`);
              break;
            default:
              this.subsubsecnum += 1;
              o.push(`<h4>`);
              o.push(`${chapnum}.${this.secnum}.${this.subsecnum}.${this.subsubsecnum} &#160; ${this.escape(text)}`);
              o.push(`<small><mark>[${id}]</mark></small>`);
              o.push(`</h4>`);
              break;
          }
          o.push(`</div>`);
          o.push('');
          break;
        }
        case 'FIGE': {
          this.fignum += 1;
          o.push(`<p>`);
          o.push(`Figure ${chapnum}-${this.fignum}`);
          o.push(`</p>`);
          break;
        }
        case 'LSTG': {
          this.lstnum += 1;
          o.push(`<p>`);
          o.push(`Listing ${chapnum}-${this.lstnum}`);
          o.push(`</p>`);
          break;
        }
      }
    }
    o.push(`</div>`);
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
    switch (type) {
      case 'tt': {
        return `<nobr><code>${this.escape(text)}</code></nobr>`
        break;
      }
      case 'em': {
        return `<em>${this.escape(text)}</em>`
        break;
      }
      case 'strong': {
        return `<strong>${this.escape(text)}</strong>`
        break;
      }
      case 'uri': {
        const [cnt,href] = text;
        if (cnt) {
          return `<span>${this.escape(cnt)}</span><span style='word-break:break-all'>(<tt>${this.escape(href)}</tt>)</span>`
        } else {
          return `<span style='word-break:break-all'><tt>${this.escape(href)}</tt></span>`
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

}

module.exports = { NitrilePreviewHtml };
