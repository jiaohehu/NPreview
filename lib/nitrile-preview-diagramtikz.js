'use babel';

const { NitrilePreviewDiagram } = require('./nitrile-preview-diagram');
const { arcpath } = require('./nitrile-preview-arcpath');

class NitrilePreviewDiagramTikz extends NitrilePreviewDiagram {

  constructor(translator) {
    super(translator);
    this.iscontext = 0;
  }
  do_setup() {
    this.definedcolors = [];
    this.usercolor_names = new Map();
    this.usercolor_id = 0;
  }
  do_finalize(s,style) {
    var o = [];
    var xm = this.config.width;
    var ym = this.config.height;
    var unit = this.config.unit;
    ///get the define colornames
    var definedcolors = this.definedcolors;
    /// these items needs to be constracted after all
    /// previous p's have been processed because it needs
    /// to be dependant on some of the command line options
    /// settings such as width and height.
    ///var ym = this.config.height;
    ///var xm = this.config.width;
    ///var unit = this.config.unit;
    ///var a1 = `pu := \\mpdim{\\linewidth}/${xm};`;
    ///var a2 = `u := ${unit}mm;`;///unit is always in mm
    ///var a3 = `ratio := pu/u;`;
    ///var a4 = `picture wheel;`;
    ///var a5 = `wheel := image(`;
    ///var a6 = `for i=0 upto ${ym}: draw (0,i*u) --- (${xm}*u,i*u) withcolor .9white; endfor;`;
    ///var a7 = `for i=0 upto ${xm}: draw (i*u,0) --- (i*u,${ym}*u) withcolor .9white; endfor;`;
    ///o.push(a1, a2, a3, a4, a5, a6, a7);
    if(this.is_dia){
      var p = `\\draw[help lines, step=${xm*unit}mm,lightgray,ultra thin] (0,0) grid (${xm*unit}mm,${ym*unit}mm);`;
    }else{
      var p = `\\draw[help lines, step=${unit}mm,lightgray,ultra thin] (0,0) grid (${xm*unit}mm,${ym*unit}mm);`;
    }
    p = p.trim();
    o.push(p);
    o.push(s);
    var s = o.join('\n');
    if(this.iscontext){
      let d = [];
      d.push('\\starttikzpicture')
      d.push(s);
      d.push('\\stoptikzpicture')
      var text = d.join('\n');
      if(style && style.width){
        let w = style.width;
        w = this.translator.str_to_context_length(w);
        text = `\\definehbox[tikz][${w}]\n\\hboxtikz{${text}}`;
      }else{
        text = `\\hbox{${text}}`;
      }
      s = text;
    }else{
      let d = [];
      d.push('\\begin{tikzpicture}');
      d.push(s);
      d.push('\\end{tikzpicture}')
      var text = d.join('\n');
      ///style.float
      if(style && style.width){
        let w = style.width;
        w = this.translator.string_to_latex_length(w);
        text = `\\resizebox{${w}}{!}{${text}}`;
      }
      if (style.zoom) {
        let w = style.zoom;
        text = `\\scalebox{${w}}{${text}}`
      }
      if (style && style.float) {
        let f = (style.float == 'left') ? 'l' : 'r';
        text = `\\begin{wraptable}{${f}}{0pt}\n${text}\n\\end{wraptable}`;
      }
    }
    return {s:text};
  }
  do_comment(s) {
    s = s.replace(/\-\-/g,'');
    s = s.replace(/\\/g,'\\\\');
    return `% <-- ${s} -->`;
  }
  do_reset() {
    var o = [];
    return o.join('\n');
  }
  p_fillclipath(_coords,g){
    let clipath = g.clipath || '';
    let names = clipath.split(',').map(x => x.trim()).filter(x => x.length);
    let ids = [];
    let o = [];
    o.push('\\begin{scope}')
    names.forEach(x => {
      if (this.my_paths.has(x)) {
        let path = this.my_paths.get(x);
        path = this.offset_and_scale_coords(path, this.refx, this.refy, this.refs);
        let items = this.coordsToDraw(path, true);
        let dd = items.map(item => item.d);
        let d = dd.join(' ');///combine multiple path into a single line       
        if(d){
          o.push(`\\clip ${d};`);
        }
      }
    });
    let u = this.config.unit;
    let w = `\\fill[${this.to_fills(g,1)}] (0,0) rectangle (${this.fix(this.config.width*u)}mm,${this.fix(this.config.height*u)}mm);`;
    o.push(w);
    o.push('\\end{scope}')
    return o.join('\n');
  }
  p_fill(coords,g){
    var o = [];
    var items = this.coordsToDraw(coords,true);
    for(var item of items) {
      var {iscycled,d} = item;
      d = d.trim();
      if(!d) continue;
      o.push(`\\fill[${this.to_fills(g,1)}] ${d};`);
    }
    return o.join('\n');
  }
  p_path(coords,g){
    var o = [];
    var items = this.coordsToDraw(coords,true);
    for(var item of items) {
      var {iscycled,d} = item;
      d = d.trim();
      if(!d) continue;
      if(iscycled && this.has_fills(g)){
        o.push(`\\fill[${this.to_fills(g)}] ${d};`);
      }
      o.push(`\\draw[${this.to_draws(g)}] ${d};`);
    }
    return o.join('\n');
  }
  p_circle(x,y,radius,g){
    let u = this.config.unit;
    var o = [];
    if (this.has_fills(g)) {
      o.push(`\\fill[${this.to_fills(g)}] (${x*u}mm,${y*u}mm) circle [radius=${radius*u}mm];`);
    }
    o.push(`\\draw[${this.to_draws(g)}] (${x*u}mm,${y*u}mm) circle [radius=${radius*u}mm];`);
    return o.join('\n');
  }
  p_rect(x,y,w,h,g){
    let u = this.config.unit;
    var mypath = `(${x * u}mm,${y * u}mm)--(${(x + w)*u}mm,${y*u}mm)--(${(x + w)*u}mm,${(y + h)*u}mm)--(${x*u}mm,${(y + h)*u}mm)--cycle`;
    var o = [];
    if (this.has_fills(g)) {
      o.push(`\\fill[${this.to_fills(g)}] ${mypath};`);
    }
    o.push(`\\draw[${this.to_draws(g)}] ${mypath};`);
    return o.join('\n');
  }
  p_line(x1,y1,x2,y2,g){
    let u = this.config.unit;
    var mypath = `(${x1*u}mm,${y1*u}mm)--(${x2*u}mm,${y2*u}mm)`;
    var o = [];
    o.push(`\\draw[${this.to_draws(g)}] ${mypath};`);
    return o.join('\n');
  }
  p_qbezier_line(x0,y0, x1,y1, x2,y2, g){
    var o = [];
    let [C0,C1,C2,C3] = this.quadrilatic_bezier_to_cubic([x0,y0],[x1,y1],[x2,y2]);
    let unit = this.config.unit;
    var x0 = C0[0];
    var y0 = C0[1];
    var x1 = C1[0];
    var y1 = C1[1];
    var x2 = C2[0];
    var y2 = C2[1];
    var x3 = C3[0];
    var y3 = C3[1];
    var path = `(${this.fix(x0*unit)}mm,${this.fix(y0*unit)}mm)..controls(${this.fix(x1*unit)}mm,${this.fix(y1*unit)}mm)and(${this.fix(x2*unit)}mm,${this.fix(y2*unit)}mm)..(${this.fix(x3*unit)}mm,${this.fix(y3*unit)}mm)`;
    o.push(`\\draw[${this.to_draws(g)}] ${path};`);
    return o.join('\n');
  }
  p_hbar(x,y,g){
    var o = [];
    let u = this.config.unit;
    var dx = this.to_barlength_length(g);
    var mypath = `(${x*u}mm,${y*u}mm)--(${(x+dx)*u}mm,${y*u}mm)`;
    o.push(`\\draw[${this.to_draws(g)}] ${mypath};`);
    return o.join('\n');
  }
  p_vbar(x,y,g){
    var o = [];
    let u = this.config.unit;
    var dy = this.to_barlength_length(g);
    var mypath = `(${x * u}mm,${y * u}mm)--(${(x) * u}mm,${(y+dy) * u}mm)`;
    o.push(`\\draw[${this.to_draws(g)}] ${mypath};`);
    return o.join('\n');
  }
  p_label(x,y,txt,ts,ta,g){
    [x,y] = this.move_label_away(x,y,ta,this.config.labeldx,this.config.labeldy);
    var unit = this.config.unit;
    var d = [];
    var anchor = this.to_anchor(ta);
    if(anchor){
      d.push(`anchor=${anchor}`);
    }
    var fontcolor = this.to_fontcolor_str(g);
    if(fontcolor){
      d.push(`text=${fontcolor}`)
    }
    let dx = this.assertFloat(g.dx,0);
    let dy = this.assertFloat(g.dy,0);
    x += dx;
    y += dy;
    let fs = this.to_fontsize_str(g);
    var tex_label = this.to_tex_label(txt, ts, fs);
    return `\\draw (${this.fix(x*unit)}mm,${this.fix(y*unit)}mm) node[${d.join(',')}] {\\fontsize{${fs}pt}{${fs}pt}\\selectfont{}${tex_label}};`;
  }
  p_pie(x,y,radius,angle1,angle2,g){
    ///pie
    var x1 = radius * Math.cos(angle1 / 180 * Math.PI);
    var y1 = radius * Math.sin(angle1 / 180 * Math.PI);
    var x2 = radius * Math.cos(angle2 / 180 * Math.PI);
    var y2 = radius * Math.sin(angle2 / 180 * Math.PI);
    let u = this.config.unit;
    if(angle2 < angle1){
      angle2 += 360;
    }
    let mypath = `(${this.fix(x*u)}mm,${this.fix(y*u)}mm)--(${this.fix((x+x1)*u)}mm,${this.fix((y+y1)*u)}mm)arc[start angle=${angle1},end angle=${angle2},radius=${this.fix(radius*u)}mm]`
    var o = [];
    if (this.has_fills(g)) {
      o.push(`\\fill[${this.to_fills(g)}] ${mypath}--cycle;`);
    }
    o.push(`\\draw[${this.to_draws(g)}] ${mypath}--cycle;`);
    return o.join('\n');
  }
  p_chord(x,y,radius,angle1,angle2,g){
    ///chord
    var x1 = radius * Math.cos(angle1 / 180 * Math.PI);
    var y1 = radius * Math.sin(angle1 / 180 * Math.PI);
    var x2 = radius * Math.cos(angle2 / 180 * Math.PI);
    var y2 = radius * Math.sin(angle2 / 180 * Math.PI);
    let u = this.config.unit;
    if (angle2 < angle1) {
      angle2 += 360;
    }
    let mypath = `(${this.fix((x + x1) * u)}mm,${this.fix((y + y1) * u)}mm)--(${this.fix((x + x2) * u)}mm,${this.fix((y + y2) * u)}mm)`
    var o = [];
    o.push(`\\draw[${this.to_draws(g)}] ${mypath};`);
    return o.join('\n');
  }
  p_cseg(x,y,radius,angle1,angle2,g){
    ///cseg
    var x1 = radius * Math.cos(angle1 / 180 * Math.PI);
    var y1 = radius * Math.sin(angle1 / 180 * Math.PI);
    var x2 = radius * Math.cos(angle2 / 180 * Math.PI);
    var y2 = radius * Math.sin(angle2 / 180 * Math.PI);
    let u = this.config.unit;
    if (angle2 < angle1) {
      angle2 += 360;
    }
    let mypath = `(${this.fix((x + x1) * u)}mm,${this.fix((y + y1) * u)}mm)arc[start angle=${angle1},end angle=${angle2},radius=${this.fix(radius * u)}mm]`
    var o = [];
    if (this.has_fills(g)) {
      o.push(`\\fill[${this.to_fills(g)}] ${mypath}--cycle;`);
    }
    o.push(`\\draw[${this.to_draws(g)}] ${mypath}--cycle;`);
    return o.join('\n');
  }
  p_ellipse(x,y,Rx,Ry,angle,g){
    let u = this.config.unit;
    var o = [];
    if (this.has_fills(g)) {
      o.push(`\\fill[${this.to_fills(g)}] (${this.fix(x * u)}mm,${this.fix(y * u)}mm) circle [x radius=${this.fix(Rx * u)}mm,y radius=${this.fix(Ry * u)}mm, rotate=${angle}];`);
    }
    o.push(`\\draw[${this.to_draws(g)}] (${this.fix(x * u)}mm,${this.fix(y * u)}mm) circle [x radius=${this.fix(Rx * u)}mm,y radius=${this.fix(Ry * u)}mm, rotate=${angle}];`);
    return o.join('\n');
  }
  p_dot_square(x,y,g){
    ///reject points that are not within the viewport
    if (x < 0 || x > this.config.width) {
      return;
    }
    if (y < 0 || y > this.config.height) {
      return;
    }
    let u = this.config.unit;
    ///***NOTE that drawdot cannot use shifted or scaled command
    ///   because there is no path before it
    let r2 = this.to_dotsize_diameter(g);
    let r = r2*0.5;
    r2 *= 0.35;///pt to mm
    r *= 0.35;///pt to mm
    return `\\fill[${this.to_dotcolors(g)}] (${x * u - r}mm,${y * u - r}mm) rectangle (${x*u+r}mm,${y*u+r}mm);`;
    //return (`fill fullcircle scaled(${this.to_dotsize_diameter(g)}) shifted(${x}*u,${y}*u) ${this.to_dotcolors(g)};`);
  }
  p_dot_circle(x,y,g){
    ///reject points that are not within the viewport
    if (x < 0 || x > this.config.width) {
      return;
    }
    if (y < 0 || y > this.config.height) {
      return;
    }
    let u = this.config.unit;
    ///***NOTE that drawdot cannot use shifted or scaled command
    ///   because there is no path before it
    return `\\fill[${this.to_dotcolors(g)}] (${x * u}mm,${y * u}mm) circle [radius=${this.to_dotsize_diameter(g)*0.5}pt];`;
    //return (`fill fullcircle scaled(${this.to_dotsize_diameter(g)}) shifted(${x}*u,${y}*u) ${this.to_dotcolors(g)};`);
  }
  p_arc(x,y,r,a1,a2,g){
    var x1 = r * Math.cos(a1 / 180 * Math.PI);
    var y1 = r * Math.sin(a1 / 180 * Math.PI);
    var x2 = r * Math.cos(a2 / 180 * Math.PI);
    var y2 = r * Math.sin(a2 / 180 * Math.PI);
    let u = this.config.unit;
    if (a2 < a1) {
      a2 += 360;
    }
    let mypath = `(${this.fix((x + x1) * u)}mm,${this.fix((y + y1) * u)}mm)arc[start angle=${a1},end angle=${a2},radius=${this.fix(r * u)}mm]`
    var o = [];
    o.push(`\\draw[${this.to_draws(g)}] ${mypath};`);
    return o.join('\n');
  }
  p_arc_sq(x,y,r,a1,a2,g){
    var o = [];
    var x1 = x + 0.7 * r * Math.cos(a1 / 180 * Math.PI);
    var y1 = y + 0.7 * r * Math.sin(a1 / 180 * Math.PI);
    var x2 = x + 0.7 * r * Math.cos(a2 / 180 * Math.PI);
    var y2 = y + 0.7 * r * Math.sin(a2 / 180 * Math.PI);
    var xm = x + r * Math.cos((a1 + a2) / 2 / 180 * Math.PI);
    var ym = y + r * Math.sin((a1 + a2) / 2 / 180 * Math.PI); 
    let u = this.config.unit;
    var mypath = `(${this.fix(x1*u)}mm,${this.fix(y1*u)}mm)--(${this.fix(xm*u)}mm,${this.fix(ym*u)}mm)--(${this.fix(x2*u)}mm,${this.fix(y2*u)}mm)`;
    o.push(`\\draw[${this.to_draws(g)}] ${mypath};`);
    return o.join('\n');
  }
  p_shape(x,y,p,g){
    var o = [];
    var items = this.coordsToDraw(p, true);
    var sx = this.assertFloat(g.sx, 1);
    var sy = this.assertFloat(g.sy, 1);
    let u = this.config.unit;
    for (var item of items) {
      var { iscycled, d } = item;
      d = d.trim();
      if (!d) continue;
      if (iscycled && this.has_fills(g)) {
        o.push(`\\fill[${this.to_fills(g)},xshift=${x * u}mm,yshift=${y * u}mm,xscale=${sx},yscale=${sy}] ${d} [reset cm];`);
      }
      o.push(`\\draw[${this.to_draws(g)},xshift=${x * u}mm,yshift=${y * u}mm,xscale=${sx},yscale=${sy}] ${d} [reset cm];`);
    }
    return o.join('\n');
  }
  coordsToDraw(coords,multi=false) {
    ///***NOTE: returns [str,bad_vars]
    ///***NOTE: i.e: (1,2)..(2,3)--cycle
    /// pt[0]: [1,2,'','','']
    /// pt[1]: [2,3,'..','','']
    /// pt[2]: ['cycle','','--','','']
    var o = [];
    var items = [];
    var iscycled = 0;
    var d = '';
    var x0 = 0;//previous point
    var y0 = 0;
    var isnewseg = 0;
    var u = this.config.unit;
    for (var i in coords) {
      var pt = coords[i];
      var x = pt[0];/// we will do fix down below
      var y = pt[1];///
      var join = pt[2];
      ///doing some fixes
      join = join || '';
      if (i == 0) {
        o.push(`(${this.fix(x*u)}mm,${this.fix(y*u)}mm)`);
        x0 = x;
        y0 = y;
        continue;
      }
      else if (join == 'cycle') {
        if(o.length){
          o.push(`--cycle`);
        }
        if(multi){
          iscycled = 1;
          d = o.join('');
          o = [];
          items.push({iscycled,d});
          isnewseg = 1;
          continue;
        }else{
          break;
        }
      }
      else if (join == 'nan') {
        if(multi){
          iscycled = 0;
          d = o.join('');
          o = [];
          items.push({iscycled,d});
          isnewseg = 1;
        }
        continue;
      }
      else if (multi && isnewseg == 1) {
        isnewseg = 0;
        o.push(`(${this.fix(x*u)}mm,${this.fix(y*u)}mm)`);
        x0 = x;
        y0 = y;
        continue;
      }
      else if (join == 'C') {
        var u = this.config.unit;
        let p1x = pt[3];/// CUBIC BEZIER curve controlpoint 1x
        let p1y = pt[4];/// CUBIC BEZIER curve controlpoint 1y
        let p2x = pt[5];/// CUBIC BEZIER curve controlpoint 2x
        let p2y = pt[6];/// CUBIC BEZIER curve controlpoint 2y
        var bezier = `..controls(${this.fix(p1x*u)}mm,${this.fix(p1y*u)}mm)and(${this.fix(p2x*u)}mm,${this.fix(p2y*u)}mm)..`;
        o.push(`${bezier}(${this.fix(x*u)}mm,${this.fix(y*u)}mm)`);
        x0 = x;
        y0 = y;
      }
      else if (join == 'Q') {
        let p1x_ = pt[3];/// QUADRILATIC BEZIER curve controlpoint 1x
        let p1y_ = pt[4];/// QUADRILATIC BEZIER curve controlpoint 1y
        let [C0,C1,C2,C3] = this.quadrilatic_bezier_to_cubic([x0,y0],[p1x_,p1y_],[x,y]);
        let p1x = C1[0];
        let p1y = C1[1];
        let p2x = C2[0];
        let p2y = C2[1];
        var bezier = `..controls(${this.fix(p1x*u)}mm,${this.fix(p1y*u)}mm)and(${this.fix(p2x*u)}mm,${this.fix(p2y*u)}mm)..`;
        o.push(`${bezier}(${this.fix(x*u)}mm,${this.fix(y*u)}mm)`);
        x0 = x;
        y0 = y;
      }
      else if (join == 'A') {
        var X1 = x0;
        var Y1 = y0;
        var X2 = x;
        var Y2 = y;
        var Rx         = pt[7];       
        var Ry         = pt[8];       
        var Phi        = pt[9];        
        var bigarcflag = pt[10];        
        var sweepflag  = pt[11];        
        if (sweepflag) {
          ///NOTE: note that the arcpath() always assumes anti-clockwise. So if we are
          ///drawing clockwise we just need to swap the starting and end point
          ///for X1/Y1 and X2/Y2
          ///this.sweepflag=1: clockwise
          ///this.sweepflag=0: anti-clockwise
          var tmp = X1; X1 = X2; X2 = tmp;
          var tmp = Y1; Y1 = Y2; Y2 = tmp;
        } 
        var [Cx, Cy, Rx, Ry] = arcpath(X1, Y1, X2, Y2, Rx, Ry, Phi, bigarcflag);
        if (Number.isFinite(Cx) && Number.isFinite(Cy)) {
          var lambda1 = Math.atan2(Y1 - Cy, X1 - Cx);
          var lambda2 = Math.atan2(Y2 - Cy, X2 - Cx);
          lambda2 -= Phi / 180 * Math.PI;
          lambda1 -= Phi / 180 * Math.PI;
          var tao1 = Math.atan2(Math.sin(lambda1) / Ry, Math.cos(lambda1) / Rx);
          var tao2 = Math.atan2(Math.sin(lambda2) / Ry, Math.cos(lambda2) / Rx);
          var ang1 = this.to360(tao1 / Math.PI * 180);
          var ang2 = this.to360(tao2 / Math.PI * 180);
          if (ang2 < ang1) { ang2 += 360; }
        }
        if (sweepflag) {//clockwise
          o.push(`[rotate around={${this.fix(Phi)}:(${this.fix(x0*u)}mm,${this.fix(y0*u)}mm)}] arc [start angle=${ang2},end angle=${ang1},x radius=${this.fix(Rx*u)}mm,y radius=${this.fix(Ry*u)}mm][reset cm]`);
        } else {//counter-clockwise
          o.push(`[rotate around={${this.fix(Phi)}:(${this.fix(x0*u)}mm,${this.fix(y0*u)}mm)}] arc [start angle=${ang1},end angle=${ang2},x radius=${this.fix(Rx*u)}mm,y radius=${this.fix(Ry*u)}mm][reset cm]`);
        }
        x0 = x;
        y0 = y;
      }
      else {
        ///NOTE: line
        o.push(`--(${this.fix(x*u)}mm,${this.fix(y*u)}mm)`);
        x0 = x;
        y0 = y;
      }
    }
    if(multi){
      if(o.length){
        iscycled = 0;
        d = o.join('');
        items.push({iscycled,d});
      }
      return items;
    }else{
      return o.join('');
    }
  }
  to_draws(g) {
    var o = [];
    if (g.linedashed) {
      o.push(`dashed`);
    }
    var d = this.to_linesize_pt(g);
    if(d){
      o.push(`line width=${d}pt`);
    }
    let linecolor = this.to_linecolor_str(g);
    if (linecolor) {
      o.push(`color=${this.to_colors(linecolor)}`);
    }
    var linecap = this.to_linecap_str(g);
    if (linecap) {
      o.push(`line cap=${linecap}`)
    } 
    var linejoin = this.to_linejoin_str(g);
    if (linejoin) {
      o.push(`line join=${linejoin}`)
    } 
    if (g.dblarrow){
      o.push(`<->`);
    }else if(g.revarrow){
      o.push(`<-`);
    }else if(g.arrow){
      o.push(`->`);
    }
    return o.join(',');
  }
  to_fills(g,isinherit) {
    let d = [];
    var s = this.to_fillcolor_str(g);
    if (s) {
      d.push(`fill=${s}`);
    } else if (isinherit) {
      d.push('fill=black');
    }
    s = this.to_opacity_str(g);
    if(s) {
      d.push(s);
    }
    return d.join(',');
  }
  to_linesize_pt(g){
    if (g.linesize) {
      var d = parseFloat(g.linesize);
      if(Number.isFinite(d)){
        return(`${d}`);
      }
    }
    if(this.config.linesize){
      d = this.config.linesize;
      return(`${d}`);
    }
    return '';
  }  
  to_linecolor_str(g){
    if (g.linecolor) {
      return g.linecolor;
    }
    if(this.config.linecolor){
      return this.config.linecolor;
    }
    return '';
  }
  fontsizes() {
    //return this.translator.mpfontsize(this.fontsize);
    return '12';
  }
  to_colors(color,user) {
    if (!color) {
      return 'black';
    } 
    if (color === 'currentColor'){
      return 'black';
    }
    if (color === 'none'){
      return '';
    }
    else if (typeof color === 'string' && color[0] == '#') {
      color = color.slice(1);///getrid of the first #
      return this.webrgb_to_definecolor(color,user);
    }
    else if (typeof color === 'string') {
      return (color);
    } 
    else {
      return 'black';
    }
  }
  to_anchor(ta){
    if( ta.localeCompare('lft') == 0   ) return 'east';
    if( ta.localeCompare('rt') == 0    ) return 'west';
    if( ta.localeCompare('top') == 0   ) return 'south';
    if( ta.localeCompare('bot') == 0   ) return 'north';
    if( ta.localeCompare('ulft') == 0  ) return 'south east';
    if( ta.localeCompare('urt') == 0   ) return 'south west';
    if( ta.localeCompare('llft') == 0  ) return 'north east';
    if( ta.localeCompare('lrt') == 0   ) return 'north west';
    if( ta.localeCompare('ctr') == 0   ) return '';
    return 'south west';
  }
  to_fontcolor_str(g) {
    if (g.fontcolor) {
      return `${this.to_colors(g.fontcolor)}`;
    }
    return '';
  }
  has_fills(g) {
    var d = this.to_fillcolor_str(g);
    return (d) ? true : false;
  }
  to_fontsize_str(g){
    if(g.fontsize){
      return g.fontsize;
    }
    if(this.config.fontsize){
      return this.config.fontsize;
    }
    return '12';
  }
  to_fillcolor_str(g) {
    if (g.fillcolor) {
      return (`${this.to_colors(g.fillcolor)}`);
    }
    if (this.config.fillcolor) {
      return (`${this.to_colors(this.config.fillcolor)}`);
    }
    return '';
  }
  to_linecap_str(g) {
    let linecap = g.linecap;
    if (!linecap) {
      linecap = this.config.linecap;
    }
    if (linecap === 'butt') {
      return 'butt';
    } else if (linecap === 'round') {
      return 'round';
    } else if (linecap === 'square') {
      return 'rect';
    }
    return '';
  }
  to_linejoin_str(g) {
    let linejoin = g.linejoin;
    if(!linejoin){
      linejoin = this.config.linejoin;
    }
    if (linejoin === 'miter') {
      return 'miter';
    } else if (linejoin === 'round') {
      return 'round';
    } else if (linejoin === 'bevel') {
      return 'bevel';
    }
    return '';
  }
  to_opacity_str(g){
    if(typeof g.opacity==='number'){
      return `opacity=${g.opacity}`;
    }else if(typeof g.opacity==='string' && g.opacity.length){
      return `opacity=${g.opacity}`;
    }else if(typeof this.config.opacity==='number'){
      return `opacity=${this.config.opacity}`;
    }else if(typeof this.config.opacity==='string' && this.config.opacity.length){
      return `opacity=${this.config.opacity}`;
    }
    return '';
  }
  _webrgb_to_definecolor(s) {
    if(this.usercolor_names.has(s)){
      return this.usercolor_names.get(s);
    }
    // convert a string such as EFD to (0.93,1,0.87)
    // will truncate to 2 decimal places
    // convert a string such as E0F0D0 to (0.93,1,0.87)
    if (s.length == 6) {
      var r = s.substr(0, 2); r = parseInt(`0x${r}`); r /= 255;
      var g = s.substr(2, 2); g = parseInt(`0x${g}`); g /= 255;
      var b = s.substr(4, 2); b = parseInt(`0x${b}`); b /= 255;
    } else if (s.length == 3) {
      var r = s.substr(0, 1); r = parseInt(`0x${r}`); r /= 15;
      var g = s.substr(1, 1); g = parseInt(`0x${g}`); g /= 15;
      var b = s.substr(2, 1); b = parseInt(`0x${b}`); b /= 15;
    } else {
      var r = 1;
      var g = 1;
      var b = 1;
    }
    let id = ++this.usercolor_id;
    let colorname = `usercolor${id}`;
    this.usercolor_names.set(s,colorname);
    this.definedcolors.push(`\\definecolor{${colorname}}{rgb}{${r},${g},${b}}`)
    return colorname;
  }
  webrgb_to_definecolor(s) {
    // convert a string such as EFD to {rgb,15:red,3; green,4; blue,5}
    // will truncate to 2 decimal places
    // convert a string such as E0F0D0 to (0.93,1,0.87)
    if (s.length == 6) {
      var r = s.substr(0, 2); r = parseInt(`0x${r}`); 
      var g = s.substr(2, 2); g = parseInt(`0x${g}`); 
      var b = s.substr(4, 2); b = parseInt(`0x${b}`); 
      var base = 255;
    } else if (s.length == 3) {
      var r = s.substr(0, 1); r = parseInt(`0x${r}`); 
      var g = s.substr(1, 1); g = parseInt(`0x${g}`); 
      var b = s.substr(2, 1); b = parseInt(`0x${b}`); 
      var base = 15;
    } else {
      var r = 0;
      var g = 0;
      var b = 0;
      var base = 1;
    }
    return `{rgb,${base}:red,${r};green,${g};blue,${b}}`;
  }
  to_barlength_length(g) {
    if (g.barlength) {
      var d = parseFloat(g.barlength);
      if (Number.isFinite(d)) {
        return (d);
      }
    }
    return parseFloat(this.config.barlength);
  }
  to_tex_label(txt, ts, fontsize) {
    txt = txt || '';
    var fs = `${fontsize}pt`;
    if (ts == 2) {
      // math text
      var s = this.translator.to_inlinemath(txt);
    } else if (ts == 1) {
      // literal text 
      var s = this.translator.polish(txt);
    } else {
      // normal text with symbols
      var s = this.translator.smooth(txt);
    }
    return `${s}`;
  }
  to_dotsize_diameter(g) {
    if (g.dotsize) {
      var d = parseFloat(g.dotsize);
      if(Number.isFinite(d)){
        return (d);
      }
    } 
    return parseFloat(this.config.dotsize);
  }
  to_dotcolors(g) {
    if (g.dotcolor) {
      return (`${this.to_colors(g.dotcolor)}`);
    }
    return '';
  }

}
module.exports = { NitrilePreviewDiagramTikz };
