'use babel';

const { NitrilePreviewDiagram } = require('./nitrile-preview-diagram');
const { arcpath } = require('./nitrile-preview-arcpath');

class NitrilePreviewDiagramTikz extends NitrilePreviewDiagram {

  constructor(translator) {
    super(translator);
  }
  do_setup() {
  }
  do_finalize(s) {
    var o = [];
    var xm = this.config.width;
    var ym = this.config.height;
    var unit = this.config.unit;
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
    var s = `
\\draw[help lines, step=${unit}mm,gray,very thin] (0,0) grid (${xm*unit}mm,${ym*unit}mm);
`;

    s = s.trim();
    o.push(s);
    var s = o.join('\n');
    return {s,xm,ym,unit};
  }
  do_comment(s) {
    s = s.replace(/\-\-/g,'');
    s = s.replace(/\\/g,'\\\\');
    return `% <-- ${s} -->`;
  }
  p_path(coords,g){
  }
  p_circle(x,y,radius,g){
  }
  p_rect(x,y,w,h,g){
  }
  p_line(x1,y1,x2,y2,g){
  }
  p_qbezier_line(x0,y0, x1,y1, x2,y2, g){
  }
  p_hbar(x,y,g){
  }
  p_vbar(x,y,g){
  }
  p_label(x,y,txt,ts,ta,g){
  }
  p_pie(x,y,radius,angle1,angle2,g){
  }
  p_chord(x,y,radius,angle1,angle2,g){
  }
  p_cseg(x,y,radius,angle1,angle2,g){
  }
  p_ellipse(x,y,Rx,Ry,angle,g){
  }
  p_dot(x,y,g){
  }
  p_arc(x,y,r,a1,a2,g){
  }
  p_arc_sq(x,y,r,a1,a2,g){
  }
  p_shape(x,y,p,g){
  }
}
module.exports = { NitrilePreviewDiagramTikz };
