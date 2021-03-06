'use babel';

const { NitrilePreviewBase } = require('./nitrile-preview-base');
const { makeknots, mp_make_choices } = require('./nitrile-preview-mppath');
const global_pics = {};

const N_Max_Array = 256;
class NitrilePreviewDiagram extends NitrilePreviewBase {

  constructor(translator) {
    super();
    this.translator = translator;
    this.MAX = 2048;
    this.MIN = 0.000001;
    /// range expression
    this.re_range_two = /^([^:]+):([^:]+)$/;
    this.re_range_three = /^([^:]+):([^:]+):([^:]+)$/;
    /// regular expression
    this.re_foreach_loop = /^foreach\s*\(([A-Za-z,\s]+)\)\s*\[(.*?)\]\s*:$/;
    this.re_word = /^[A-Za-z]\w*$/;
    this.re_commentline = /^\%/;
    this.re_viewport_command = /^viewport\s+(\d+)\s+(\d+)/;
    this.re_config_command = /^config\s+(\w+)\s*(.*)$/;
    this.re_reset_command = /^reset/;
    this.re_set_command = /^set\s+([\w\-]+)\s*(.*)$/;
    this.re_pic_command = /^pic\s+(.*)$/;
    this.re_exit_command = /^exit/;
    // path, fn, var
    this.re_path_command = /^path\s+(.*?)\s*\=\s*(.*)$/;
    this.re_fn_command = /^fn\s+([A-Za-z][A-Za-z0-9]*)\((.*?)\)\s*=\s*(.*)$/;
    this.re_var_command = /^var\s+([A-Za-z][A-Za-z0-9]*)\s*=\s*(.*)$/;
    // draw 
    this.re_draw_command = /^draw(\.\w+|)\s+(.*)$/;
    this.re_drawarrow_command = /^drawarrow(\.\w+|)\s+(.*)$/;
    this.re_drawrevarrow_command = /^drawrevarrow(\.\w+|)\s+(.*)$/;
    this.re_drawdblarrow_command = /^drawdblarrow(\.\w+|)\s+(.*)$/;
    this.re_drawcontrolpoints_command = /^drawcontrolpoints(\.\w+|)\s+(.*)$/;
    this.re_drawanglearc_command = /^drawanglearc(\.\w+|)\s+(.*)$/;
    // fill -- no stroking
    this.re_fill_command = /^fill(\.\w+|)\s+(.*)$/;
    this.re_fillclipath_command = /^fillclipath(\.\w+|)\s+(.*)$/;
    // node and edge
    this.re_node_command = /^node(\.[\.\w]+|)\b\s*(.*)$/;
    this.re_edge_command = /^edge(\.[\.\w]+|)\b\s*(.*)$/;
    // ellipse  
    this.re_ellipse_command =       /^ellipse(\.[\.\w]+|)\s+(.*)$/;
    // circular
    this.re_circle_command =       /^circle(\.[\.\w]+|)\s+(.*)$/;
    // rect
    this.re_rect_command =         /^rect(\.[\.\w]+|)\s+(.*)$/;
    // shapes
    this.re_shape_command =         /^shape(\.[\.\w]+|)\s+(.*)$/;
    // label
    this.re_label_command =         /^label(\.[\.\w]+|)\s+(.*)$/;
    // dot
    this.re_dot_command =             /^dot(\.[\.\w]+|)\s+(.*)$/;
    // box
    this.re_box_command =             /^box(\.[\.\w]+|)\s+(.*)$/;
    // scalar command - cartesian 
    this.re_cartesian_command = /^cartesian(\.[\.\w]+|)\s+(.*)$/;
    // scalar command
    this.re_barchart_command =   /^barchart(\.[\.\w]+|)\s+(.*)$/;
    // RE
    this.re_pathfunc        = /^&([A-Za-z][A-Za-z0-9]*)\{(.*?)\}\s*(.*)$/;
    this.re_pathvar_range   = /^&([A-Za-z][A-Za-z0-9]*)\[(.*?)\]\s*(.*)$/;
    this.re_pathvar_single  = /^&([A-Za-z][A-Za-z0-9]*)\s*(.*)$/;
    this.re_dashdot = /^(\-{2,}|\.{2,})\s*(.*)$/;
    this.re_coord = /^\((.*?)\)\s*(.*)$/;
    this.re_cycle = /^(cycle)\s*(.*)$/;
    this.re_offset = /^\<(.*?)\>\s*(.*)$/;
    this.re_relative = /^\[(.*?)\]\s*(.*)$/;
    this.re_nonblanks = /^(\S+)\s*(.*)$/;
    this.re_action_label0 = /^\s*(")([^"]*)\"\s*(.*)$/;
    this.re_action_label1 = /^\s*(')([^']*)'\s*(.*)$/;
    this.re_action_label2 = /^\s*(\\\()(.*?)\\\)\s*(.*)$/;
    this.re_action_style = /^\s*\{(.*?)\}\s*(.*)$/;
    this.re_range = /^(\d+)\-(\d+)$/;
    this.re_scalar_func = /^([a-zA-Z]\w*)\(/;
    this.re_scientific_notation = /^(\d+[eE](?:\+|\-|)\d+)(.*)$/;
    this.re_float_number = /^(\d*\.\d+|\d*\.|\d+)(.*)$/;
    this.re_symbol_only = /^([A-Za-z][A-Za-z0-9]*)(.*)$/;
    this.re_e_suffix = /^([eE](?:\+|\-|)\d+)(.*)$/;
    /// initialize internals
    this.initInternals();
    this.initConfig();
    this.initSettings();
  }

  initInternals(){
    /// clipathid
    //this.my_clipath_id = 0;
    /// path
    this.my_paths = new Map();
    /// configuration parameters
    this.config = {}; 
    /// all translated commands in SVG or MP/MF
    this.commands = [];
    /// the last configured cartesian coord
    this.cartesians = {};
    /// the last configured barchar coord
    this.barcharts = {};
    /// all funcs defined by 'fn' command
    this.my_funcs = new Map();
    /// all consts defined by 'const' command
    this.my_consts = new Map();
    /// all nodes
    this.my_nodes = new Map();
  }

  initConfig(){
    this.config.width = 25;  // in grid
    this.config.height = 10; // in grid
    this.config.unit = 5;  // in mm
    this.config.fontsize = 12; // in pt
    this.config.labeldx = 0; // in grid
    this.config.labeldy = 0; // in grid
    this.config.dotsize = 5;  // in pt
    this.config.linesize = 0;  // default line size in pt
    this.config.fillcolor = '';  // default line color in name such as 'black', or '#888', or '#888888'
    this.config.barlength = 0.50; // in grid
  }

  initSettings() {
    this.def_refs = this.refs = 1;
    this.def_refx = this.refx = 0;
    this.def_refy = this.refy = 0;
  }

  to_diagram(ss,style) {
    this.initInternals();
    this.initConfig();
    this.initSettings();
    this.do_setup();
    var lines = this.trim_samp_body(ss);
    this.exec_body(lines);
    ///remove empty output lines
    var o = this.commands.filter(s => (s) ? true : false);
    return this.do_finalize(o.join('\n'),style);
  }

  ///*NOTE: this method is to execute an isolated program body.
  ///       the body could be the entire problem itself, but it can
  ///       also be a for-loop body, in which case the for-loop 
  ///       ensure to call it multiple times, each time the code
  ///       being executed are slightly different than before, because
  ///       of the replacement of one or loop variables with the actual
  ///       value

  exec_body(lines){
    let env = {};
    lines = this.join_backslashed_lines(lines);//also made a new copy of it
    while (lines.length) {
      var raw = lines.shift();//modify 'lines' variable
      var [lead, line] = this.trim_line(raw);
      if (line.length == 0) {
        continue;
      }
      if(lead.length > 0){
        continue;
      }
      var v;
      if ((v = this.re_foreach_loop.exec(line)) !== null) {
        this.commands.push(this.do_comment(line));
        var var_array = v[1].split(',').map(x => { let name = x.trim(); return { name }; });
        //var seq_array = v[2].split(',').map(x => x.trim());
        var seq_array = this.string_to_range(v[2]);
        var body = this.extract_loop_body(lines,lead);
        var body = this.trim_samp_body(body);
        this.exec_foreach_body(var_array, seq_array, body);
        continue;
      }
      ///only execute lines that do not start with spaces
      this.parse_line(line,env);
    }
  }

  exec_foreach_body(var_array,seq_array,body){
    var line;
    while(seq_array.length){
      ///populate x.seq
      var_array.forEach(x => {
        let seq = seq_array.shift();
        x.seq = seq;
      });
      ///generate a comment line
      let myline = var_array.map(x => `${x.name}='${x.seq}'`).join(',');
      this.commands.push(this.do_comment(myline));
      ///replace all \a \b in the body with the actual seq
      var newbody = body.map(line => {
        ///replace any occurrance of variable with 
        var_array.forEach(x => {
          ///if there are two variable it will run twice once trying 
          ///to replace one of the my_paths
          let {name,seq} = x;
          let re = new RegExp(`\\\\${name}`,'g');
          line = line.replace(re,seq);
        });
        return line;
      });
      this.exec_body(newbody);
    }
   
  }

  extract_loop_body(lines,lead0){
    var outlines=[];
    ///extract all lines from 'lines' until a line
    ///is encountered with an indentation less of 'lead0',
    ///in which case this line is left untouched; emtpy
    ///lines are ignore;     
    for (var n=0; lines.length; n++) {
      ///lookahead
      var [lead, line] = this.trim_line(lines[0]);
      ///remove empty lines
      if (line.length == 0) {
        lines.shift();//remove it from lines
        continue;
      }
      ///if the indentation is more than the parent
      if (lead.length > lead0.length) {
        var line = lines.shift();
        outlines.push(line);
        continue;
      }
      ///otherwise we get out
      break;
    }
    return outlines;
  }

  trim_line(line){
    var re_leading = /^(\s*)(.*)$/;
    var v;
    if((v=re_leading.exec(line))!==null){
      return [v[1],v[2]];
    }
    return ['',line];
  }

  get_float_prop(g, name, def_v, min=null, max=null) {
    let val;
    if(g && g.hasOwnProperty(name)){
      val = g[name];
    }else if(this.config.hasOwnProperty(name)){
      val = this.config[name];
    }
    return this.assertFloat(val,def_v,min,max);
  }

  assertInt(val, def_v, min, max) {
    if (!val) {
      return def_v;
    }
    val = parseInt(val);
    if (!Number.isFinite(val)) {
      return def_v;
    }
    if (val < min) {
      val = min;
    } else if (val > max) {
      val = max;
    }
    return val;
  }

  assertFloat(val, def_v, min=null, max=null) {
    val = parseFloat(val);
    if (!Number.isFinite(val)) {
      return def_v;
    }
    if (Number.isFinite(min)) {
      if (val < min) {
        val = min;
      }
    }
    if (Number.isFinite(max)) {
      if (val > max) {
        val = max;
      }
    }
    return val;
  }

  toAreaOp(v, def_v) {
    if (!v) {
      return def_v;
    }
    if (typeof v == 'string') {
      v = v.trim();
      if (!v) {
        return def_v;
      }
      if (v === 'filldraw') {
        return 0x11;
      }
      if (v === 'fill') {
        return 0x10;
      }
      if (v === 'draw') {
        return 0x10;
      }
    }
    return def_v;
  }

  toFloat(v, def_v) {
    if (!v) {
      return def_v;
    }
    if (typeof v == 'string') {
      v = v.trim();
      if (!v) {
        return def_v;
      }
    }
    return parseFloat(v);
  }

  toString(v, def_v) {
    if (!v) {
      return def_v;
    }
    if (typeof v == 'string') {
      v = v.trim();
      if (!v) {
        return def_v;
      }
      return v;
    }
    return '' + v;
  }

  fetch_path(a) {

    ///***NOTE: this function should return a path, not a point!

    /// if it is null then we return an empty path
    if (!a) {
      this.commands.push(this.do_comment(`ERR:empty variable name, assuming (0,0)`));
      return [[0, 0]];
    }
    if (this.my_paths.has(a)) {
      return this.my_paths.get(a);
    }
    return []; //by default resturns a path without any points in it
  }

  fetch_arg(s){
    let coords = this.readCoordsLine(s);
    let scalar = parseFloat(s);
    return {coords,scalar};
  }

  is_arg_coords(a){
    if(a && Array.isArray(a.coords) && a.coords.length){
      return true;
    }
    return false;
  }

  is_arg_scalar(a){
    if(a && Number.isFinite(a.scalar)){
      return true;
    }
    return false;
  }

  /// this is called inside readCoordsLine()
  exec_path_func(line, fun_str, args) {

    var ret_val = [];
    switch (fun_str) {

      case 'midpoint':

        var z0,z1,fraction;
        if(args.length == 1 && this.is_arg_coords(args[0])){
          var z0 = this.point(args[0].coords, 0);
          var z1 = this.point(args[0].coords, 1);
          var fraction = 0.5;
        } else if(args.length == 2 && this.is_arg_coords(args[0]) && this.is_arg_scalar(args[1])){
          var z0 = this.point(args[0].coords,0);
          var z1 = this.point(args[0].coords,1);
          var fraction = args[1].scalar;
        } else if(args.length == 2 && this.is_arg_coords(args[0]) && this.is_arg_coords(args[1])){
          var z0 = this.point(args[0].coords,0);
          var z1 = this.point(args[1].coords,0);
          var fraction = 0.5;
        } else if(args.length == 3){
          var z0 = this.point(args[0].coords, 0);
          var z1 = this.point(args[1].coords, 0);
          var fraction = args[2].scalar;
        }
        if (this.isvalidpt(z0) && this.isvalidpt(z1) && this.isvalidnum(fraction)) {
          var z0x = parseFloat(z0[0]);
          var z0y = parseFloat(z0[1]);
          var z1x = parseFloat(z1[0]);
          var z1y = parseFloat(z1[1]);
          if(this.isvalidnum(z0x,z0y,z1x,z1y)){
            var ptx = z0x + (z1x - z0x) * fraction;
            var pty = z0y + (z1y - z0y) * fraction;
            ret_val.push([ptx, pty]);///always returns a single point
          }
        }

        break;

      case 'perpoint':
        ///return a line with unit length of 1 that is perpendicular
        /// to a line that intersects at the first point of that line 
        if (args.length == 3 && 
        this.is_arg_coords(args[0]) && 
        this.is_arg_coords(args[1]) &&
        this.is_arg_scalar(args[2])) {
          var z0, z1, magni;
          var z0 = this.point(args[0].coords, 0);
          var z1 = this.point(args[1].coords, 0);
          var magni = args[2].scalar;
          if (this.isvalidpt(z0) && this.isvalidpt(z1) && this.isvalidnum(magni)) {
            var z0x = parseFloat(z0[0]);
            var z0y = parseFloat(z0[1]);
            var z1x = parseFloat(z1[0]);
            var z1y = parseFloat(z1[1]);
            if(this.isvalidnum(z0x,z0y,z1x,z1y)){
              var dy = z1y - z0y;
              var dx = z1x - z0x;
              var angle = Math.atan2(dy,dx);
              angle += this.deg_to_rad(90);
              var ptx = z0x + magni*Math.cos(angle);
              var pty = z0y + magni*Math.sin(angle);
              ret_val.push([ptx, pty]);///always return a single point
            }
          }
        } else if (args.length == 3 && 
        this.is_arg_coords(args[0]) &&
        this.is_arg_coords(args[1]) &&
        this.is_arg_coords(args[2])) {
          var z0 = this.point(args[0].coords, 0);
          var z1 = this.point(args[1].coords, 0);
          var z2 = this.point(args[2].coords, 0);
          var z0x = parseFloat(z0[0]);
          var z0y = parseFloat(z0[1]);
          var z1x = parseFloat(z1[0]);
          var z1y = parseFloat(z1[1]);
          var z2x = parseFloat(z2[0]);
          var z2y = parseFloat(z2[1]);
          if (this.isvalidnum(z0x, z0y, z1x, z1y, z2x, z2y)) {
            var vx = z1x - z0x;
            var vy = z1y - z0y;
            var x  = z2x - z0x;
            var y  = z2y - z0y;
            var factor = (vx*x + vy*y)/(vx*vx + vy*vy);
            var ptx = z0x + vx*factor;
            var pty = z0y + vy*factor;
            ret_val.push([ptx, pty]);///always return a single point
          }
        }

        break;

      case 'scatterpoints':

        if (args.length == 5) {
          var sx = args[0].scalar;
          var sy = args[1].scalar;
          var tx = args[2].scalar;
          var ty = args[3].scalar;
          var n  = args[4].scalar;
          if (Number.isFinite(sx) &&
            Number.isFinite(sy) &&
            Number.isFinite(tx) &&
            Number.isFinite(ty) &&
            Number.isFinite(n)) {

            if (n > N_Max_Array) {
              n = N_Max_Array;
            }
            var pt = [sx, sy, 0, '', ''];
            var dx = tx - sx;
            var dy = ty - sy;
            ret_val.push(pt);
            for (let i = 1; i < n; i++) {
              var frac = i / (n - 1);
              var px = sx + frac * dx;
              var py = sy + frac * dy;
              ret_val.push([px, py, 0, '', '']);
            }
          }
        }
        break;

      case 'shiftpoints':

        /// shiftpoints(a,0,-2)
        /// shiftpoints(a,2,-1)

        if (args.length == 3 &&
            this.is_arg_coords(args[0]) &&
            this.is_arg_scalar(args[1]) &&
            this.is_arg_scalar(args[2])) {
          var coords = args[0].coords;    
          var dx = args[1].scalar;      
          var dy = args[2].scalar;      
          for(let z of coords){
            var t = z.map(x => x);//make a copy
            t[0] += dx;
            t[1] += dy;        
            t[3] += dx;        
            t[4] += dy;        
            t[5] += dx;        
            t[6] += dy;        
            ret_val.push(t);
          }
        }
        break;

      case 'linelineintersect': {

        /// lineintersect(a,b) - 'a' for the first line and 'b' for the second line

        if (args.length == 4 && 
        this.is_arg_coords(args[0]) && 
        this.is_arg_coords(args[1]) &&
        this.is_arg_coords(args[2]) &&
        this.is_arg_coords(args[3])){
          let p0 = this.point(args[0].coords, 0);
          let p1 = this.point(args[1].coords, 0);
          let q0 = this.point(args[2].coords, 0);
          let q1 = this.point(args[3].coords, 0);
          let [x, y] = this.computeLineIntersection(p0, p1, q0, q1);
          ret_val.push([x, y]);
        }
        break;
      }

      case 'linecircleintersect': {

        /// circlelineintersect(a,c,radius)
        ///
        ///  a1 - symbol: the line point 1     
        ///  a2 - symbol: the line point 2     
        ///  c - symbol: circle center (one point)
        ///  radius - number: circle radius

        if (args.length == 4 &&  
        this.is_arg_coords(args[0]) &&
        this.is_arg_coords(args[1]) &&
        this.is_arg_coords(args[2]) &&
        this.is_arg_scalar(args[3])){
          let p0     = this.point(args[0].coords,0);
          let p1     = this.point(args[1].coords,0);
          let c      = this.point(args[2].coords,0);
          let radius = args[3].scalar;
          let [A, B, C] = this.computeStandardLineForm(p0, p1);
          let [x0, y0] = c;
          // translate C to new coords
          C = C - A * x0 - B * y0;
          let rsq = radius * radius;
          let [x1, y1, x2, y2] = this.computeCircleLineIntersection(rsq, A, B, C);
          if(Math.abs(B) < 1E-6){
            ///the intersecting line is perpendicular
            y1 = +y0 - radius;
            y2 = +y0 + radius;
            x1 = x0;
            x2 = x0;
          }else{
            x1 += +x0;
            x2 += +x0;
            y1 += +y0;
            y2 += +y0;
          }
          return [[x1, y1], [x2, y2]];///return a path of two points;
          ///note one or both might be Infinity of NaN
        }
        break;
      }

      case 'circlecircleintersect': {
        if(args.length==4 &&
          this.is_arg_coords(args[0]) &&
          this.is_arg_coords(args[1]) &&
          this.is_arg_scalar(args[2]) &&
          this.is_arg_scalar(args[3])) {
          let a = args[0].coords;
          let b = args[1].coords;
          let R = args[2].scalar;
          let r = args[3].scalar;
          let pt1 = this.point(a,0);
          let pt2 = this.point(b,0);
          let [x1,y1] = pt1;
          let [x2,y2] = pt2;
          let dx = x2-x1;
          let dy = y2-y1;
          let d = Math.sqrt(dx*dx + dy*dy);
          let x = (d*d - r*r + R*R)/(2*d);
          let y = Math.sqrt(R * R - x * x);
          if(!Number.isFinite(y)){
            return [];
          }else{
            let y = Math.sqrt(R*R - x*x);
            let theta = Math.atan2(dy,dx);
            let THETA = Math.atan2(y,x);
            let X1 = R*Math.cos(theta+THETA);
            let Y1 = R*Math.sin(theta+THETA);
            let X2 = R*Math.cos(theta-THETA);
            let Y2 = R*Math.sin(theta-THETA);
            return [[x1+X1,y1+Y1],[x1+X2,y1+Y2]];
          }
        }
        break;
      }

      case 'circlepoints': {

        /// &circlepoint(center,r,a1,a2,a3...)
        /// 'center' is a path, r, a1, a2, a3 are scalars
        if(args.length > 2 &&
        this.is_arg_coords(args[0]) &&
        this.is_arg_scalar(args[1])) {
          var coords0 = args[0].coords;            
          var r       = args[1].scalar; 
          let z0      = this.point(coords0,0);
          if(this.isvalidpt(z0)&&Number.isFinite(r)){
            let [x0,y0] = z0;
            for(let j=2; j < args.length; ++j){
              var a0 = args[j].scalar;
              if(Number.isFinite(a0)){
                let x1 = x0 + r * Math.cos(Math.PI/180*a0);
                let y1 = y0 + r * Math.sin(Math.PI/180*a0);
                ret_val.push([x1,y1]);
              }
            }
          }
        }
        break;
      }

      case 'circle': {
        ///&circle(center,radius)
        ///'center' is a path, radius is a scalar
        if(args.length == 2 &&
        this.is_arg_coords(args[0]) &&
        this.is_arg_scalar(args[1])) {
          var z = args[0].coords;
          var r = args[1].scalar; 
          let z0 = this.point(z,0);
          if(this.isvalidpt(z0)&&Number.isFinite(r)){
            ret_val.push([z0[0]+r,z0[1]]);
            ret_val.push([z0[0]-r,z0[1],'A','','','','',r,r,0,1,0]);
            ret_val.push([z0[0]+r,z0[1],'A','','','','',r,r,0,1,0]);
            ret_val.push([0,0,'cycle']);
          }
        }
        break;
      }

      case 'rectangle': {
        ///&circle(center,radius)
        ///'center' is a path, radius is a scalar
        if(args.length == 2 &&
        this.is_arg_coords(args[0]) &&
        this.is_arg_coords(args[1])) {
          var Z1 = args[0].coords;
          var Z2 = args[1].coords; 
          let z1 = this.point(Z1,0);
          let z2 = this.point(Z2,0);
          if(this.isvalidpt(z1)&&this.isvalidpt(z2)){
            ret_val.push([z1[0],z1[1]]);
            ret_val.push([z2[0],z1[1]]);
            ret_val.push([z2[0],z2[1]]);
            ret_val.push([z1[0],z2[1]]);
            ret_val.push([0,0,'cycle']);
          }
        }
        break;
      }

      case 'bbox': {
        ///&bbox{}
        ret_val.push([0,0]);
        ret_val.push([this.config.width,0]);
        ret_val.push([this.config.width,this.config.height]);
        ret_val.push([0,this.config.height]);
        ret_val.push([0,0,'cycle']);
        break;
      }

      default:
        break;

    }
    if (ret_val.length == 0) {
      return [[0, 0]];///a coordinate with a single point
    }
    return ret_val;
  }

  remove_first_dot(v) {

    if (typeof v == 'string') {
    }
    v = v.toString();
    if(v.startsWith('.')){
      v = v.slice(1);
    }
    return v;
  }

  iscyclept(pt) {
    if (Array.isArray(pt) && pt[2] == 'cycle') {
      return true;
    }
    return false;
  }

  isvalidnum(){
    for(let i=0; i < arguments.length; ++i){
      let my = arguments[i];
      if(!Number.isFinite(my)){
        return false;
      }
    }
    return true;
  }

  offset_and_scale_coords(coords,offsetx,offsety,scale){
    var newcoords = [];
    for(let i=0; i < coords.length; ++i){
      let pt = coords[i];
      let newpt = this.offset_and_scale_pt(pt,offsetx,offsety,scale);
      newcoords.push(newpt);
    }
    return newcoords;
  }

  offset_and_scale_pt(pt,offsetx,offsety,scale){
    var newpt = [];
    for (let i = 0; i < pt.length; ++i) {
      newpt.push(pt[i]);
    }
    newpt[0] *= scale;
    newpt[1] *= scale;
    newpt[3] *= scale;
    newpt[4] *= scale;
    newpt[5] *= scale;
    newpt[6] *= scale;
    //offset next
    newpt[0] += offsetx;
    newpt[1] += offsety;
    newpt[3] += offsetx;
    newpt[4] += offsety;
    newpt[5] += offsetx;
    newpt[6] += offsety;
    return newpt;
  }

  offset_pt(pt,offsetx,offsety) {
    var newpt = [];
    for(let i=0; i < pt.length; ++i){
      newpt.push(pt[i]);
    }
    newpt[0] += offsetx;
    newpt[1] += offsety;
    newpt[3] += offsetx;
    newpt[4] += offsety;
    newpt[5] += offsetx;
    newpt[6] += offsety;
    return newpt;
  }

  isvalidpt(pt) {
    if (Array.isArray(pt)) {
      if (typeof pt[2] === 'string') {
        if( pt[2] == 'cycle'|| pt[2] == 'nan') {
          return false;
        }
      }
      return true;
    }
    return false;
  }

  point(coords, i) {
    if (coords && Array.isArray(coords) && i < coords.length) {
      var pt = coords[i];
      return pt;
    } 
    return [0, 0, 'nan'];
  }

  readActionLabel(line) {
    var v;
    var ts=0;
    if((v=this.re_action_label0.exec(line))!==null) {
      var txt = v[2];
      var ts = 0;
      line = v[3];
    }else if((v=this.re_action_label1.exec(line))!==null){
      var txt=v[2];
      var ts=1;
      line=v[3];
    }else if((v=this.re_action_label2.exec(line))!==null){
      var txt = v[2];
      var ts = 2;
      line = v[3];    
    } else {
      var txt = '';
      var ts=0;
    }
    return [txt,ts,line];
  }

  readActionStyle(line) {
    var v;
    if ((v = this.re_action_style.exec(line)) !== null) {
      var g = this.string_to_style(v[1].trim());
      line = v[2];
    } else {
      var g = {};
    }
    return [g,line];
  }

  readCoordsLine(line,user) {
    /// $midpoint(a)
    /// $somepoint(a,0.2)
    /// a
    /// b
    /// last
    /// (1,2) (3,4) (5,6) ...
    /// (1,2) (3) (4) ...
    /// (1,2) 3 (4,5) ...
    /// (1,2) 3 (4,5) ...
    /// (1,2) 3 [up:3] [down:4] [lft:3] [rt:5] [ulft:3] [urt:3] [llft:3] [lrt:5] (9,10) ...
    /// <3,1> (1,2)
    /// (1,2) 3 [angledist:10,4] (9,10) ()
    /// * (1,2) (3,4)
    /// *a (1,2) (3,4)
    /// *a..(1,2) (3,4)
    /// <0,1> *a..(1,2) (3,4)
    /// <0,1> *a..(1,2) (3,4) cycle

    /// The <3,4> is for setting an offset, for which all future
    /// coord points will be based on. Thus for the following we are adding
    /// points that are: (3,4) and (4,5)
    ///   <3,3> (0,1) (1,2)

    /// Note that the entire line is going to be
    /// either a function, a variable, or a
    /// list of coordinates.

    /// ***IMPORTANT***:
    /// If a function is detected, then the entire
    /// line is assumed to be of only that function;
    /// if a variable is detected, then the entire line
    /// if of that variable; if a list of numbers (with parenthesized
    /// pairs, then the entire line will be scanned for all literal
    /// points until something non-number is detected and then the scan
    /// stops.

    /// not that for the literal number input, each individual
    /// coordinate is considered to be either in pairs, in which case
    /// the parentheses must be detected. Of within the parenthesis
    /// only a single number is detected and there is no comma, then
    /// only the x/coordinate will be initialized to this number,
    /// and the y/coordinate will be reset to zero. If a number without
    /// parenthesis is detected then only the x-coordinate will be set
    /// that number, and the its y/coordinate is left to zero.

    /// (1,2) (3,4) (5,6) ...
    /// (1,2) (3) (4) ...
    /// (1,2) a (4,5) ...
    /// (1,2) a (4,5) ()
    /// (1,2) -- a .. (4,5) -- (4,4) -- ()

    var coords = [];
    var offsetx = 0;
    var offsety = 0;
    var lastpt = [0, 0];
    var dx = 0;
    var dy = 0;
    var x = 0;
    var y = 0;
    var v;
    var n = 0;
    var x1 = 0;//First control point for cubic
    var y1 = 0;//First control point for cubic
    var x2 = 0;//Second control point for cubic
    var y2 = 0;//Second control point for cubic
    var x3 = 0;//First control point for quadratic
    var y3 = 0;//First control point for quadratic
    var lastjoin = '';///'hobby','','cubic','quadrilatic','arcpath'
    var hobby_p = [];
    while (line.length) {

      if ((v = this.re_pathfunc.exec(line)) !== null) {
        var raw = v[0];
        var d = v[1];
        var args = this.string_to_path_arg(v[2]);
        line = v[3];
        var ret_val = this.exec_path_func(raw, d, args);
        for (var i = 0; i < ret_val.length; ++i) {
          let pt = this.point(ret_val, i);
          pt[0] += +offsetx;
          pt[1] += +offsety;
          pt[3] += +offsetx;
          pt[4] += +offsety;
          pt[5] += +offsetx;
          pt[6] += +offsety;
          coords.push(pt);
          lastpt[0] = pt[0];
          lastpt[1] = pt[1];
        }
        continue;
      }

      if ((v = this.re_pathvar_range.exec(line)) !== null) {
        var d = v[1].trim();
        var range = v[2].trim();
        line = v[3];

        var symbol = d;
        if (symbol.length == 0) {
          var from = this.lastcoords;
        } else {
          var from = this.fetch_path(symbol);
        }
        var indices = range.split(',');
        var join = '';
        for (var s of indices) {
          if (this.re_range.test(s)) {
            var v = this.re_range.exec(s);
            var i1 = parseInt(v[1]);
            var i2 = parseInt(v[2]);
            if (Number.isFinite(i1) && Number.isFinite(i2)) {
              for (var i = i1; i1 <= i2 && i <= i2; ++i) {
                [x, y, join] = this.point(from, i);
                if (join !== 'cycle' && join !== 'nan') {
                  x += offsetx;
                  y += offsety;
                  coords.push([x, y]);
                  lastpt[0] = x;
                  lastpt[1] = y;
                }
              }
              for (var i = i1; i1 > i2 && i >= i2; --i) {
                [x, y, join] = this.point(from, i);
                if (join !== 'cycle' && join !== 'nan') {
                  x += offsetx;
                  y += offsety;
                  coords.push([x, y]);
                  lastpt[0] = x;
                  lastpt[1] = y;
                }
              }
            }
          } else {
            var i = parseInt(s);
            if (Number.isFinite(i)) {
              [x, y, join] = this.point(from, i);
              if (join !== 'cycle' && join !== 'nan') {
                x += offsetx;
                y += offsety;
                coords.push([x, y]);
                lastpt[0] = x;
                lastpt[1] = y;
              }
            }
          }
        }
        continue;

      } 

      if ((v = this.re_pathvar_single.exec(line)) !== null) {
        var symbol = v[1].trim();
        line = v[2];
        var from = this.fetch_path(symbol);
        for (var i = 0; i < from.length; ++i) {
          var pt = this.point(from, i);
          var pt = this.offset_pt(pt,offsetx,offsety);
          coords.push(pt);
          lastpt[0] = pt[0];
          lastpt[1] = pt[1];
        }
        continue;

      }

      if ((v = this.re_cycle.exec(line))!==null) {
        coords.push([0, 0, 'cycle']);
        line = v[2];
        lastjoin = '';
        //break;
        continue;
      }

      /// such as (0,0), or (0,pi)
      if ((v = this.re_coord.exec(line))!==null) {
        n++;
        var d = v[1].trim();
        line = v[2];
        d = d.split(',');
        d = d.map(x => x.trim());
        if (d.length < 2) {
          coords.push([0, 0, 'nan']);
          lastjoin = '';
          continue;
        }
        var d0 = d[0];
        var d1 = d[1];
        if (!d0) {
          x = lastpt[0];
        } else {
          if(this.is_var(d0)){
            x = this.fetch_var(d0);
          }else{
            x = parseFloat(d0);
          }
          x += offsetx;
        }
        if (!d1) {
          y = lastpt[1];
        } else {
          if(this.is_var(d1)){
            y = this.fetch_var(d1);
          }else{
            y = parseFloat(d1);
          }
          y += offsety;
        }
        if (Number.isFinite(x) && Number.isFinite(y)) {
          ///add in the offset; ***NOTE that offset should only
          ///be added for real coords, and not the relatives.
          if (lastjoin === 'hobby') {
            hobby_p.push([x, y]);
            var tension = 1;
            var knots = makeknots(hobby_p, tension, false);///nitrile-preview-mppath.js
            mp_make_choices(knots[0]);
            coords.push([x, y, '']);
            ///*NOTE: If hobby_p variable contains 2 pts, the knots variable will be a two-elem
            ///       array. If hobby_p is 3-elem array, then knots variable will be a three-elem
            ///       array. In this case the pt 1 and 2 is a curve, and pt 2 and 3 is another curve.
            ///       The control points for the first curve is 
            ///            (knots[0].rx_pt, knots[0].ry_pt), 
            ///            (knots[1].lx_pt, knots[1].ly_pt), 
            ///
            ///       The control points for the second curve is 
            ///            (knots[1].rx_pt, knots[1].ry_pt),     
            ///            (knots[2].lx_pt, knots[2].ly_pt),     
            ///
            for (var i = 1; i < knots.length; ++i) {
              var j = coords.length - knots.length + i;
              coords[j][2] = 'C';
              coords[j][3] = knots[i - 1].rx_pt;
              coords[j][4] = knots[i - 1].ry_pt;
              coords[j][5] = knots[i].lx_pt;
              coords[j][6] = knots[i].ly_pt;
            }
            lastjoin = '';///reset it to '' so that it needs another .. to make it 'hobby'
          } else {
            ///turn it off
            if(hobby_p.length){
              hobby_p = [];
            }
            lastjoin = '';
            coords.push([x, y, '']);
          }
          lastpt[0] = x;
          lastpt[1] = y;
        }
        continue;
      }

      if ((v = this.re_offset.exec(line)) !== null) {
        n++;
        /// <1,2>, or <1,>, or <,2>
        var d = v[1].trim();
        line = v[2];
        if (!d) {
          continue; ///d is an empty string
        }
        d = d.split(',');
        d = d.map(x => x.trim());
        if (d.length == 2) {
          dx = parseFloat(d[0]);
          dy = parseFloat(d[1]);
          if (Number.isFinite(dx)) { offsetx += dx; lastpt[0] += dx; }
          if (Number.isFinite(dy)) { offsety += dy; lastpt[1] += dy; }
        }
        continue;
      }

      if ((v = this.re_relative.exec(line)) !== null) {
        n++;
        /// [angledist:angle,dist]
        /// [turn:angle,dist]
        /// [flip:dx,dy] /// flip the point to the other side of the line of the last two points
        /// [l:dx,dy] /// line
        /// [h:dx] /// line
        /// [v:dy] /// line
        /// [c:dx1,dy1,dx2,dy2,dx,dy]
        /// [s:dx2,dy2,dx,dy]
        /// [a:rx,ry,angle,bigarcflag,sweepflag,dx,dy]
        /// [q:dx1,dy1,dx,dy]
        /// [t:dx,dy]
        var d = v[1].trim();
        line = v[2];
        d = d.split(':');
        d = d.map(x => x.trim());
        if (d.length == 2) {
          var key = d[0];
          var val = d[1];
          if (key === 'angledist') {
            var val = val.split(',');
            var val = val.map(x => x.trim());
            if (val.length == 2) {
              var angle = parseFloat(val[0]);
              var dist = parseFloat(val[1]);
              dx = dist * Math.cos(angle / 180 * Math.PI);
              dy = dist * Math.sin(angle / 180 * Math.PI);
              if (!Number.isFinite(dx)) { dx = 0; }
              if (!Number.isFinite(dy)) { dy = 0; }
              x = lastpt[0] + dx;
              y = lastpt[1] + dy;
              lastjoin = '';
              coords.push([x, y, '', x1, y1, x2, y2]);
              lastpt[0] = x;
              lastpt[1] = y;
            }
          }
          else if (key === 'turn') {
            var val = val.split(',');
            var val = val.map(x => x.trim());
            if (val.length == 2) {
              var angle = parseFloat(val[0]);
              var lastangle = this.computeLastAngleDegree(coords);
              angle += lastangle;
              var dist = parseFloat(val[1]);
              dx = dist * Math.cos(angle / 180 * Math.PI);
              dy = dist * Math.sin(angle / 180 * Math.PI);
              if (!Number.isFinite(dx)) { dx = 0; }
              if (!Number.isFinite(dy)) { dy = 0; }
              x = lastpt[0] + dx;
              y = lastpt[1] + dy;
              lastjoin = '';
              coords.push([x, y, '', x1, y1, x2, y2]);
              lastpt[0] = x;
              lastpt[1] = y;
            }
          }
          else if (key === 'flip') {
            var val = val.split(',');
            var val = val.map(x => x.trim());
            if (val.length == 2) {
              var tx = parseFloat(val[0]);
              var ty = parseFloat(val[1]);
              if (coords.length > 1 && Number.isFinite(tx) && Number.isFinite(ty)) {
                [dx, dy] = this.computeMirroredPointOffset(coords, tx, ty);
                if (Number.isFinite(dx) && Number.isFinite(dy)) {
                  x = tx + dx;
                  y = ty + dy;
                  lastjoin = '';
                  coords.push([x, y, '', x1, y1, x2, y2]);
                  lastpt[0] = x;
                  lastpt[1] = y;
                }
              }
            }
          }
          else if (key === 'l') {
            var val = val.split(',');
            var val = val.map(x => x.trim());
            if (val.length == 2) {
              dx = parseFloat(val[0]);
              dy = parseFloat(val[1]);
              if (Number.isFinite(dy) && Number.isFinite(dx)) {
                x = lastpt[0] + dx;
                y = lastpt[1] + dy;
                lastjoin = '';
                coords.push([x, y, '', x1, y1, x2, y2]);
                lastpt[0] = x;
                lastpt[1] = y;
              }
            }
          }
          else if (key === 'h') {
            var val = val.split(',');
            var val = val.map(x => x.trim());
            if (val.length == 1) {
              dx = parseFloat(val[0]);
              dy = 0;
              if (Number.isFinite(dy) && Number.isFinite(dx)) {
                x = lastpt[0] + dx;
                y = lastpt[1] + dy;
                lastjoin = '';
                coords.push([x, y, '', x1, y1, x2, y2]);
                lastpt[0] = x;
                lastpt[1] = y;
              }
            }
          }
          else if (key === 'v') {
            var val = val.split(',');
            var val = val.map(x => x.trim());
            if (val.length == 1) {
              dy = parseFloat(val[0]);
              dx = 0;
              if (Number.isFinite(dy) && Number.isFinite(dx)) {
                x = lastpt[0] + dx;
                y = lastpt[1] + dy;
                lastjoin = '';
                coords.push([x, y, '', x1, y1, x2, y2]);
                lastpt[0] = x;
                lastpt[1] = y;
              }
            }
          }
          else if (key === 'c') {
            var val = val.split(',');
            var val = val.map(x => x.trim());
            if (val.length == 6) {
              x1 = lastpt[0] + parseFloat(val[0]);
              y1 = lastpt[1] + parseFloat(val[1]);
              x2 = lastpt[0] + parseFloat(val[2]);
              y2 = lastpt[1] + parseFloat(val[3]);
              x = lastpt[0] + parseFloat(val[4]);
              y = lastpt[1] + parseFloat(val[5]);
              if (Number.isFinite(x1) &&
                Number.isFinite(y1) &&
                Number.isFinite(x2) &&
                Number.isFinite(y2) &&
                Number.isFinite(x) &&
                Number.isFinite(y)) {
                lastjoin = 'cubic';
                coords.push([x, y, 'C', x1, y1, x2, y2]);
                lastpt[0] = x;
                lastpt[1] = y;
              }
            }
          }
          else if (key === 's') {
            var val = val.split(',');
            var val = val.map(x => x.trim());
            if (val.length == 4) {
              if (lastjoin === 'quadrilatic') {
                [x1,y1] = this.MIRROR([x1,y1],lastpt);
              } else if (lastjoin === 'cubic') {
                [x1,y1] = this.MIRROR([x2,y2],lastpt);
              } else {
                [x1,y1] = lastpt;
              }
              x2 = lastpt[0] + parseFloat(val[0]);
              y2 = lastpt[1] + parseFloat(val[1]);
              x = lastpt[0] + parseFloat(val[2]);
              y = lastpt[1] + parseFloat(val[3]);
              if (Number.isFinite(x1) &&
                Number.isFinite(y1) &&
                Number.isFinite(x2) &&
                Number.isFinite(y2) &&
                Number.isFinite(x) &&
                Number.isFinite(y)) {
                lastjoin = 'cubic';
                coords.push([x, y, 'C', x1, y1, x2, y2]);
                lastpt[0] = x;
                lastpt[1] = y;
              }
            }
          }
          else if (key === 'a') {
          /// [a:rx,ry,angle,bigarcflag,sweepflag,dx,dy]
            var val = val.split(',');
            var val = val.map(x => x.trim());
            if (val.length == 7) {
              let X1 = lastpt[0];
              let Y1 = lastpt[1];
              let X2 = lastpt[0] + parseFloat(val[5]);
              let Y2 = lastpt[1] + parseFloat(val[6]);
              let Rx = parseFloat(val[0]);
              let Ry = parseFloat(val[1]);
              let Phi = parseFloat(val[2]);
              let bigarcflag = parseInt(val[3]);
              let sweepflag = parseInt(val[4]);
              if (Number.isFinite(X1) &&
                  Number.isFinite(Y1) &&
                  Number.isFinite(X2) &&
                  Number.isFinite(Y2) &&
                  Number.isFinite(Rx) &&
                  Number.isFinite(Ry) &&
                  Number.isFinite(Phi) &&
                  Number.isFinite(bigarcflag) &&
                  Number.isFinite(sweepflag)) {
                lastjoin = 'arcpath';
                coords.push([X2, Y2, 'A', '','','','', Rx,Ry,Phi,bigarcflag,sweepflag]);
                lastpt[0] = X2;
                lastpt[1] = Y2;
              }
            }
          }
          else if (key === 'q') {
            var val = val.split(',');
            var val = val.map(x => x.trim());
            if (val.length == 4) {
              x1 = lastpt[0] + parseFloat(val[0]);
              y1 = lastpt[1] + parseFloat(val[1]);
              x = lastpt[0] + parseFloat(val[2]);
              y = lastpt[1] + parseFloat(val[3]);
              if (Number.isFinite(x1) &&
                Number.isFinite(y1) &&
                Number.isFinite(x) &&
                Number.isFinite(y)) {
                ///NOTE: need to convert to cubic
                //let [C0,C1,C2,C3] = this.quadrilaticToCubic(lastpt,[x1,y1],[x,y]);
                coords.push([x, y, 'Q', x1, y1]);
                lastpt[0] = x;
                lastpt[1] = y;
                lastjoin = 'quadrilatic';
              }
            }
          }
          else if (key === 't') {
            var val = val.split(',');
            var val = val.map(x => x.trim());
            if (val.length == 2) {
              x = lastpt[0] + parseFloat(val[0]);
              y = lastpt[1] + parseFloat(val[1]);
              if (lastjoin === 'quadrilatic') {
                [x1,y1] = this.MIRROR([x1,y1],lastpt);
              } else if (lastjoin === 'cubic') {
                [x1,y1] = this.MIRROR([x2,y2],lastpt);
              } else {
                [x1,y1] = lastpt;
              }
              if (Number.isFinite(x1) &&
                Number.isFinite(y1) &&
                Number.isFinite(x) &&
                Number.isFinite(y)) {
                ///last control point for Q is saved as x1/y1, we need
                ///to mirror it again the lastpt
                ///NOTE: need to convert to cubic
                //let [C0,C1,C2,C3] = this.quadrilaticToCubic(lastpt,[x1,y1],[x,y]);
                coords.push([x, y, 'Q', x1, y1]);
                lastpt[0] = x;
                lastpt[1] = y;
                lastjoin = 'quadrilatic';
              }
            }
          }
        }
        continue;
      }

      /// (1,1) .. (2,3)
      if ((v = this.re_dashdot.exec(line)) !== null) {
        var d = v[1].trim();
        line = v[2];
        if (d === '..') {
          lastjoin = 'hobby';
          if (hobby_p.length === 0) {
            hobby_p.push([lastpt[0], lastpt[1]]);
          }
        } 
        continue;
      }

      ///***NOTE: it is important to get out of for-loop
      ///because we do not know how to skip to the next coord
      break;
    }

    ///NOTE: here we will call the latest addition which is to
    ///turn all continuous '..' MetaPost curve operation into
    ///..controls(x,y)and(x,y)..
    if(user && typeof user == 'object'){
      user.s = line;
    }
    return coords;
  }

  adjust_shape_coords(coords) {
    for(var j=0; j < coords.length; ++j){
      var join = coords[2];
      //for shapes we do scale-only
      coords[j][0] *= this.refs;
      coords[j][1] *= this.refs;
      coords[j][3] *= this.refs;
      coords[j][4] *= this.refs;
      coords[j][5] *= this.refs;
      coords[j][6] *= this.refs;
    }
    return coords;
  }

  read_shape_coords(line) {
    var coords = this.readCoordsLine(line);
    for(var j=0; j < coords.length; ++j){
      var join = coords[2];
      //for shapes we do scale-only
      coords[j][0] *= this.refs;
      coords[j][1] *= this.refs;
      coords[j][3] *= this.refs;
      coords[j][4] *= this.refs;
      coords[j][5] *= this.refs;
      coords[j][6] *= this.refs;
    }
    return coords;
  }

  read_action_coords(line) {
    var coords = this.readCoordsLine(line);
    for(var j=0; j < coords.length; ++j){
      var join = coords[2];
      //we do scales and also moves
      coords[j][0] *= this.refs;
      coords[j][1] *= this.refs;
      coords[j][3] *= this.refs;
      coords[j][4] *= this.refs;
      coords[j][5] *= this.refs;
      coords[j][6] *= this.refs;

      /// note that points [3,4,5,6] are control
      /// points and are absolute, 
      /// we must move them too    
      coords[j][0] += this.refx;
      coords[j][1] += this.refy;
      coords[j][3] += this.refx;
      coords[j][4] += this.refy;
      coords[j][5] += this.refx;
      coords[j][6] += this.refy;
    }
    return coords;
  }

  scalexy(x,y){
    x *= this.refs;
    y *= this.refs;
    x += this.refx;
    y += this.refy;
    return [x,y];
  }

  scaledist(r){
    return r*this.refs;
  }

  read_action_floats(line) {

    /// 5 5 0.5 0.5 (exp(1)) [1:3:10]
    var o = [];
    line = line.trimLeft();
    var m;
    var re_float_or_symbol = /^(\S+)\s*(.*)$/;
    var re_range_expr = /^\[(.*?)\]\s*(.*)$/;
    var v;
    while(line.length) {
      if(line.charCodeAt(0)==40){
        // (sqrt(2))
        line = line.slice(1);
        [v,line] = this.extract_next_expr(line);//v is float
        o.push(v);
      }
      else if((m=re_range_expr.exec(line))!==null){
        // [1:3:10]
        line = m[2];
        v = m[1];
        v = v.split(':');
        v = v.map(x => x.trim());
        var step = 0;
        if(v.length==2){
          var base = v[0];
          var limit = v[1];
          var step = 1;
        }else if(v.length==3){
          var base = v[0];
          var limit = v[2];
          var step = v[1];
        }
        step = Math.abs(step);
        var n = Math.floor((limit - base)/step);
        n = Math.abs(n);
        if(step >= this.MIN){   
          if(limit > base){
            for(var j=0; j <= n; ++j){
              o.push(parseFloat(+base + (j*step)));
            }
          }
          else if(limit < base){
            for (var j = 0; j <= n; ++j) {
              o.push(parseFloat(+base - (j*step)));
            }            
          }
        }
      }
      else if((m=re_float_or_symbol.exec(line))!==null){
        // 12, or A
        v = m[1];
        line = m[2];
        if((m=this.re_symbol_only.exec(v))!==null){
          if(this.my_consts.has(v)){
            v = this.my_consts.get(v);
          }else{
            v = 0;///if this symbol is not defined we assume a zero
          }
        }else{
          v = parseFloat(v);
        }
        o.push(v);
      }
      else{
        break;
      }
      line = line.trimLeft();
    }
    o = o.filter( x => Number.isFinite(x) );
    return o;
  }

  computeAngleDegree(px, py, tx, ty) {
    var dx1 = tx - px;
    var dy1 = ty - py;
    var ang1 = Math.atan2(dy1, dx1) / Math.PI * 180;
    if (ang1 < 0) { ang1 += 360; }
    return ang1;
  }

  computeLastAngleDegree(coords) {
    var n = coords.length;
    if (n < 2) {
      return 0;
    }
    var sx = coords[n - 2][0];
    var sy = coords[n - 2][1];
    var px = coords[n - 1][0];
    var py = coords[n - 1][1];
    return this.computeAngleDegree(sx, sy, px, py);
  }

  computeMirroredPointOffset(coords, tx, ty) {
    /// This function is to compute the offset to a new point that is the
    /// mirror reflection of the current point (tx,ty) off the line formed
    /// by the last two points in the coords.
    var n = coords.length;
    if (n < 2) {
      return [tx, ty];
    }
    var sx = coords[n - 2][0];
    var sy = coords[n - 2][1];
    var px = coords[n - 1][0];
    var py = coords[n - 1][1];
    px -= sx;
    py -= sy;
    tx -= sx;
    ty -= sy;
    ///console.log('computeMirroredPointOffset: adjusted: tx=',tx,' ty=',ty);
    var magni = Math.sqrt(px * px + py * py);
    px /= magni;///unit vector
    py /= magni;///unit vector
    ///console.log('computeMirroredPointOffset: unit: px=',px,' py=',py);
    var dotprod = px * tx + py * ty;
    ///console.log('computeMirroredPointOffset: dotprod=',dotprod);
    var nx = dotprod * px;
    var ny = dotprod * py;
    ///console.log('computeMirroredPointOffset: nx=',nx,' ny=',ny);
    var dx = nx - tx;
    var dy = ny - ty;
    dx *= 2;
    dy *= 2;
    ///console.log('computeMirroredPointOffset: adjusted: dx=',dx,' dy=',dy);

    return [dx, dy];

  }

  computeLineIntersection(p0, p1, p2, p3) {
    /// this is to compute the intersection of two lines p0--p1 and p2--p3
    let [A1, B1, C1] = this.computeStandardLineForm(p0, p1);
    let [A2, B2, C2] = this.computeStandardLineForm(p2, p3);
    let y = (A1 * C2 - A2 * C1) / (A1 * B2 - A2 * B1);
    let x = (C1 * B2 - C2 * B1) / (A1 * B2 - A2 * B1);
    return [x, y];
  }

  computeStandardLineForm(p1, p2) {
    let [x1, y1] = p1;
    let [x2, y2] = p2;
    let A = y2 - y1;
    let B = x1 - x2;
    let C = A * x1 + B * y1;
    ///console.log('A=',A);
    ///console.log('B=',B);
    ///console.log('C=',C);
    return [A, B, C];
  }

  computeCircleLineIntersection(rsq, A, B, C) {
    ///return an array of four points: x1,y1,x2,y2
    let something = (A * A + B * B) * (B * B * rsq - C * C) + A * A * C * C;
    let x1 = (A * C + Math.sqrt(something)) / (A * A + B * B);
    let y1 = (C - A * x1) / B;
    let x2 = (A * C - Math.sqrt(something)) / (A * A + B * B);
    let y2 = (C - A * x2) / B;
    return [x1, y1, x2, y2];
  }

  assertColor(val, def_val) {
    ///such as 'red', 'rgb(200,100,123)'
    var re_colorrgb = /^rgb\((\d+)\,(\d+)\,(\d+)\)$/;
    var re_colorname = /^([A-Za-z]+)$/;
    var v = null;
    if (!val) {
      return def_val;
    }
    if ((v = re_colorrgb.exec(val)) !== null) {
      return [v[1],v[2],v[3]];
    } else if ((v = re_colorname.exec(val)) !== null) {
      return val;
    } else {
      return def_val;
    }
  }

  assertUnit(val) {
    var v = parseFloat(val);
    if (Number.isFinite(v)) {
      if (v < 1) {
        v = 1;
      }
      return v;
    } else {
      return this.def_unit;
    }
  }

  assertLength(val, def_val) {
    if (!val) {
      return def_val;
    }
    var re = /^([\d\.]+)(px|pt|mm|cm|in|)$/
    var v;
    if ((v = re.exec(val)) !== null) {
      var num = parseFloat(v[1]);
      if (!Number.isFinite(num)) {
        num = 0;
      }
      var unit = v[2];
      if (unit === '') {
        return num;
      }
      else if (unit === 'px') {
        return num;///SVG unit where 1px = 0.75pt
      }
      else if (unit==='pt'){
        return num*1.3333;
      }
      else if (unit==='mm'){
        return num*3.78;
      }
      else if (unit==='cm'){
        return num*37.8;
      }
      else if (unit==='in'){
        return num*96.0;
      }
      else {
        return num;
      }
    } else {
      return def_val;
    }
  }

  to360(val) {
    if (val < 0) {
      val += 360;
    } else if (val > 360) {
      val -= 360;
    }
    return val;
  }

  coords_to_string(coords) {
    ///***NOTE: returns [str,bad_vars]
    ///***NOTE: i.e: (1,2)..(2,3)--cycle
    /// pt[0]: [1,2,'','','']
    /// pt[1]: [2,3,'..','','']
    /// pt[2]: ['cycle','','--','','']
    var o = [];
    var iscycle = 0;
    for (var i in coords) {
      var pt = coords[i];
      var x = pt[0];/// cannot do fix here because x could be a string
      var y = pt[1];/// cannot do fix here because x could be a string
      var join = pt[2];
      ///In case we have a CUBIC BEZIER curve, then pt1 and pt2 are the control points
      if (join == 'C') {
        var p1x = pt[3];/// CUBIC BEZIER curve controlpoint 1x
        var p1y = pt[4];/// CUBIC BEZIER curve controlpoint 1y
        var p2x = pt[5];/// CUBIC BEZIER curve controlpoint 2x
        var p2y = pt[6];/// CUBIC BEZIER curve controlpoint 2y
        o.push(`[C:${this.fix(p1x)},${this.fix(p1y)},${this.fix(p2x)},${this.fix(p2y)},${this.fix(x)},${this.fix(y)}]`);
      }
      else if (join == 'Q') {
        var p1x = pt[3];/// CUBIC BEZIER curve controlpoint 1x
        var p1y = pt[4];/// CUBIC BEZIER curve controlpoint 1y
        o.push(`[Q:${this.fix(p1x)},${this.fix(p1y)},${this.fix(x)},${this.fix(y)}]`);
      }
      else if (join == 'A') {
        var i3 = pt[7];/// Rx
        var i4 = pt[8];/// Ry
        var i5 = pt[9];/// angle
        var i6 = pt[10];/// bigarcflag
        var i7 = pt[11];/// sweepflag
        o.push(`[A:${this.fix(i3)},${this.fix(i4)},${this.fix(i5)},${this.fix(i6)},${this.fix(i7)},${this.fix(x)},${this.fix(y)}]`);
      }
      else if (join == 'cycle') {
        iscycle = 1;
        o.push(`cycle`);
        break;
      }
      else if (join == 'nan') {
        o.push(`()`);
      }
      else {
        o.push(`(${this.fix(x)},${this.fix(y)})`);
      }
    }
    return o.join(' ');
  }

  quadrilatic_bezier_to_cubic(P0,P1,P2) {
    var C0=[0,0];
    var C1=[0,0];
    var C2=[0,0];
    var C3=[0,0];
    C0 = this.PT(P0);
    C1 = this.AT(this.ST(1/3,P0), this.ST(2/3,P1));
    C2 = this.AT(this.ST(2/3,P1), this.ST(1/3,P2));
    C3 = this.PT(P2);
    return [C0,C1,C2,C3];
  }

  // return a two-element vector given a point (which could be more than one element)
  PT(v){
    return [v[0],v[1]];
  }
  // scale vector v by scalar
  ST(scalar,v){
    return [parseFloat(scalar)*parseFloat(v[0]),
            parseFloat(scalar)*parseFloat(v[1])];
  }
  // add two vectors v and w
  AT(v,w){
    return [parseFloat(v[0])+parseFloat(w[0]),
            parseFloat(v[1])+parseFloat(w[1])];
  }
  MIRROR(p,c){
    ///c is the mirror
    ///p is the point on one side of the mirror
    ///RETURN; the mirror point of 'p' with respect to 'c'
    var dx = c[0] - p[0];
    var dy = c[1] - p[1];
    var x = c[0] + dx;
    var y = c[1] + dy;
    return [x,y];
  }

  def_pic(para) {
    /// ```diagramdef
    /// apple
    /// drawline
    var n = 0;
    var name = '';
    var o = [];
    for( var s of para ) {
      s = s.trim();
      if (s.length === 0) {
        continue;
      }
      n++;
      if (n===1) {
        name = s;
        continue;
      }
      o.push(s);
    }
    global_pics[name] = o;
  }
  line_replace_env(line,env){
    /// replace env variable before everything else
    let flag = 0;
    for (let env_name in env) {
      if (env.hasOwnProperty(env_name)) {
        let env_val = env[env_name];
        let re = new RegExp(`\\\\${env_name}`, 'g');
        line = line.replace(re, env_val);
        flag = 1;
      }
    }
    return [line,flag];
  }
  parse_line(line,env={}) {
    ///do the comment before trimming the lnie
    this.commands.push(this.do_comment(line));
    ///trim the line---because all the RE are based
    ///on no leading spaces
    ///line = line.trimLeft();
    var coords = [];
    var v;
    /// scan for env variable setting
    var re_env = /^\$\{([A-Za-z][A-Za-z0-9]*)\}\s*=\s*(.*)$/;
    if((v=re_env.exec(line))!==null){
      let env_name = v[1];
      let env_expr = v[2];
      [env_expr] = this.line_replace_env(env_expr,env);
      let [quan] = this.extract_next_expr(env_expr, {});
      env[env_name] = quan;
      return false;
    }
    /// replace env variable before everything else
    var [line,flag] = this.line_replace_env(line,env);
    if(flag){
      this.commands.push(this.do_comment(line));
    }
    /// normal commands
    if ((v = this.re_commentline.exec(line)) !== null) {
      return false;
    }
    if ((v = this.re_path_command.exec(line)) !== null) {
      var symbol = v[1];
      line = v[2];
      ///NOTE: must call readCoordsLine() because it does not movept by refs/refx/refy
      var coords = this.readCoordsLine(line);
      ///NOTE: for "[a,b,c]"
      var re = /^\[(.*)\]$/;
      if((v=re.exec(symbol))!==null){
        var segs = v[1].split(',');
        var segs = segs.map(x => x.trim());
        var seg = '';
        for (var i = 0; i < segs.length; ++i) {
          var seg = segs[i];
          if (this.re_word.test(seg)) {
            var pt = this.point(coords, i);
            if(this.isvalidpt(pt)){
              this.my_paths.set(seg,[pt]);
            } else {
              this.my_paths.set(seg,[]);
            }
            this.commands.push(this.do_comment(`saved ${seg}=${this.coords_to_string(this.my_paths.get(seg))}`));
          }
        } 
        ///last variable gets all the remaining pts
        if(this.re_word.test(seg)){
          for (var j=i; j < coords.length; ++j) {
            var pt = this.point(coords, j);
            if(this.isvalidpt(pt)){
              this.my_paths.get(seg).push(pt);
            }
          }
          this.commands.push(this.do_comment(`saved ${seg}=${this.coords_to_string(this.my_paths.get(seg))}`));
        }
      } else if (this.re_word.test(symbol)) {
        this.my_paths.set(symbol, coords);
        this.commands.push(this.do_comment(`saved ${symbol}=${this.coords_to_string(this.my_paths.get(symbol))}`));
      } else {
        this.commands.push(this.do_comment(`${symbol} is not a valid variable`));
      }
      return false;
    }
    ///
    /// config
    ///
    if ((v = this.re_viewport_command.exec(line)) !== null) {
      this.config.width = this.assertInt(v[1], 25, 1, this.MAX);
      this.config.height = this.assertInt(v[2], 10, 1, this.MAX);
      this.commands.push(this.do_comment(`width: ${this.config.width} height: ${this.config.height}`));
      this.do_setup();
      return false;
    }
    if ((v = this.re_config_command.exec(line)) !== null) {
      var key = v[1];
      var val = v[2];
      var num = parseFloat(val);
      if(Number.isFinite(num)){
        this.config[key] = num;
      }else{
        this.config[key] = val;
      }
      this.commands.push(this.do_comment(`config: ${key} ${val}`));
      this.do_setup();
      return false;
    }
    /// 
    /// set/reset
    ///
    if ((v = this.re_reset_command.exec(line)) !== null) {
      this.initSettings();
      this.commands.push(this.do_reset());
      return false;
    }
    if ((v = this.re_set_command.exec(line)) !== null) {
      var key = v[1];
      var val = v[2].trim();
      if (key === 'refx') {
        ///
        /// /3 - from left
        /// 3/ - from right
        ///
        if (val[0] === '/') { /// '/3'
          val = val.slice(1);
          val = this.assertFloat(val, this.def_refx, 0, this.config.width);
        } else if (val[val.length - 1] === '/') { /// '3/'
          val = val.slice(0, val.length - 1);
          val = this.config.width - this.assertFloat(val, this.def_refx, 0, this.config.width);
        } else {
          val = this.assertFloat(val, this.def_refx, 0, this.config.width);
        }
        this.refx = val;
      } ///such as 12.5
      else if (key === 'refy') {
        ///
        /// /3 - from top
        /// 3/ - from bottom
        ///
        ///if it is "/3" then it specifies a distance from the top side of the diagram
        if (val[0] === '/') { /// '/3'
          val = val.slice(1);
          val = this.config.height - this.assertFloat(val, this.def_refy, 0, this.config.height);
        } else if (val[val.length - 1] === '/') { /// '3/'
          val = val.slice(0, val.length - 1);
          val = this.assertFloat(val, this.def_refy, 0, this.config.height);
        } else {
          val = this.assertFloat(val, this.def_refy, 0, this.config.height);
        }
        this.refy = val;
      } ///such as 12.5
      else if (key === 'refs')      { this.refs      = this.assertFloat(val, this.def_refs, this.MIN, this.MAX); } ///such as 1
      return false;
    }
    if ((v = this.re_fn_command.exec(line)) !== null) {
      var f = {};
      f.name = v[1];
      f.args = v[2].split(',');
      f.expr = v[3];
      this.my_funcs.set(f.name,f);
      return false;
    }
    if ((v = this.re_var_command.exec(line)) !== null) {
      let name = v[1];
      let [quan] = this.extract_next_expr(v[2],{});
      this.my_consts.set(name,quan);
      return false;
    }
    ///NOTE: pic
    if ((v = this.re_pic_command.exec(line)) !== null) {
      let name = v[1];
      //let pic = global_pics[name];
      let pic;
      let notes = this.translator.parser.block.parser.notes;
      if(notes) {
        pic = notes.get(name);
      }
      if (pic) {
        this.exec_body(pic);
      } else {
        this.commands.push(this.do_comment(`ERR:pic does not exist: ${name}`));
      }
      return false;
    }
    ///
    ///NOTE: *label* command
    ///
    if ((v = this.re_label_command.exec(line)) !== null) {
      var opt = this.remove_first_dot(v[1]);
      var line = v[2];
      var [txt,ts,line] = this.readActionLabel(line);
      var [g,line] = this.readActionStyle(line);
      var coords = this.read_action_coords(line);
      this.commands.push(this.do_label(opt,txt,ts,g,coords));///own method
      return false;
    }
    ///
    ///NOTE: the *shape* command
    ///
    if ((v = this.re_shape_command.exec(line)) !== null) {
      var opt = this.remove_first_dot(v[1]);
      var line = v[2];
      var [txt,ts,line] = this.readActionLabel(line);
      var [g,line] = this.readActionStyle(line);
      var coords = this.read_action_coords(line);
      var opts = opt.split('.');
      var cmd = opts[0];
      var subcmd = opts[1];
      switch(cmd){
        case 'rect':
          var mypath = `(0,0)--(1,0)--(1,1)--(0,1)--cycle;`;
          break;
      
        case 'rhombus': 
          var mypath = `(0,0.5)--(0.5,1)--(1,0.5)--(0.5,0)--cycle`;
          break;

        case 'trapezoid': 
          var mypath = `(0,0)--(1,0)--(0.6,1)--(0.2,1)--cycle;`;
          break;

        case 'parallelgram':
          var sl = this.assertFloat(g.sl,0.3,0,1);
          var sw = (1-sl);
          var mypath = `(0,0) [h:${sw}] [l:${sl},1] [h:${-sw}] [l:-${sl},-1] cycle`;
          break;

        case 'apple': 
          var mypath = '(.5,.7)..(.25,.85)..(0,.4)..(.5,0)..(1.0,.5)..(.8,.9)..(.5,.7)--(.5,.7)..(.6,1.0)..(.3,1.1)--(.3,1.1)..(.4,1.0)..(.5,.7)--cycle';
          break;

        case 'rrect': 
          var mypath = `(0.2,0) [h:0.6] [c:0.2,0,0.2,0,0.2,0.2] [v:0.6] [c:0,0.2,0,0.2,-0.2,0.2] [h:-0.6] [c:-0.2,0,-0.2,0,-0.2,-0.2] [v:-0.6] [c:0,-0.2,0,-0.2,0.2,-0.2] cycle`;
          break;

        case 'basket': 
          var mypath = '(0.3,0)--(2.6,0)..(2.8,1)..(3,2)--(3,2)..(1.5,1.5)..(0,2)--(0,2)..(0.2,1)..(0.3,0)--cycle';
          break;

        case 'crate': 
          var mypath = '(4,2)--(0,2)--(0,0)--(4,0)--(4,2)--(0,2)--(1,3)--(5,3)--(4,2)--(4,0)--(5,1)--(5,3)--(4,2)--cycle';
          break;

        case 'tree':
          var mypath = '(0,0)--(-0.4,0)--(-0.2,0.8)--(-1,0.4)--(-0.35,1.1)--(-0.8,1.1)--(-0.2,1.5)--(-0.7,1.5)--(0,2)--(0.7,1.5)--(0.2,1.5)--(0.8,1.1)--(0.35,1.1)--(1,0.4)--(0.2,0.8)--(0.4,0)--cycle';
          break;

        case 'balloon':
          var mypath = '(0.0, 1)..(0.5, 1.5)..(0.2, 2)..(-0.3, 1.5)..(0, 1) cycle (0, 1)..(-0.05, 0.66)..(0.15, 0.33)..(0, 0)';
          break;

        case 'radical':
          var radicallength = this.assertFloat(g.radicallength,4,this.MIN,this.MAX);
          var mypath = `(${radicallength},0)--(0,0)--(0,-2)--(-0.25,-1.5)--(-0.5,-1.75)`;
          break;

        case 'protractor':
          var mypaths = [];
          mypaths.push('(-3.5, 0)--(-0.1,0)..(0,0.1)..(0.1,0)--(3.5, 0)..(0, 3.5)..(-3.5, 0)--cycle ');
          mypaths.push('(-2.5100, 0.8500)--(2.5100, 0.8500)..(0, 2.65)..(-2.5100, 0.8500)--cycle ');
          mypaths.push('(3.4468,  0.6078)-- (3.0529,  0.5383) ()');
          mypaths.push('(3.2889,  1.1971)-- (2.9130,  1.0603) ()');
          mypaths.push('(3.0311,  1.7500)-- (2.6847,  1.5500) ()');
          mypaths.push('(2.6812,  2.2498)-- (2.3747,  1.9926) ()');
          mypaths.push('(2.2498,  2.6812)-- (1.9926,  2.3747) ()');
          mypaths.push('(1.7500,  3.0311)-- (1.5500,  2.6847) ()');
          mypaths.push('(1.1971,  3.2889)-- (1.0603,  2.9130) ()');
          mypaths.push('(0.6078,  3.4468)-- (0.5383,  3.0529) ()');
          mypaths.push('(0.0000,  3.5000)-- (0.0000,  3.1000) ()');
          mypaths.push('(-3.4468, 0.6078)-- (-3.0529, 0.5383) ()');
          mypaths.push('(-3.2889, 1.1971)-- (-2.9130, 1.0603) ()');
          mypaths.push('(-3.0311, 1.7500)-- (-2.6847, 1.5500) ()');
          mypaths.push('(-2.6812, 2.2498)-- (-2.3747, 1.9926) ()');
          mypaths.push('(-2.2498, 2.6812)-- (-1.9926, 2.3747) ()');
          mypaths.push('(-1.7500, 3.0311)-- (-1.5500, 2.6847) ()');
          mypaths.push('(-1.1971, 3.2889)-- (-1.0603, 2.9130) ()');
          mypaths.push('(-0.6078, 3.4468)-- (-0.5383, 3.0529) ()');
          mypaths.push('(0.0000,  0.1000)-- (0.0000,  0.8500) ()');
          var mypath = mypaths.join(' ');
          break;

        case 'updnprotractor':
          var mypaths = [];
          mypaths.push('(-3.5, 0)--(-0.1,0)..(0,-0.1)..(0.1,0)--(3.5, 0)..(0,-3.5)..(-3.5, 0)--cycle ');
          mypaths.push('(-2.5100,-0.8500)--(2.5100,-0.8500)..(0,-2.65)..(-2.5100,-0.8500)--cycle ');
          mypaths.push('( 3.4468, -0.6078)-- ( 3.0529, -0.5383) ()');
          mypaths.push('( 3.2889, -1.1971)-- ( 2.9130, -1.0603) ()');
          mypaths.push('( 3.0311, -1.7500)-- ( 2.6847, -1.5500) ()');
          mypaths.push('( 2.6812, -2.2498)-- ( 2.3747, -1.9926) ()');
          mypaths.push('( 2.2498, -2.6812)-- ( 1.9926, -2.3747) ()');
          mypaths.push('( 1.7500, -3.0311)-- ( 1.5500, -2.6847) ()');
          mypaths.push('( 1.1971, -3.2889)-- ( 1.0603, -2.9130) ()');
          mypaths.push('( 0.6078, -3.4468)-- ( 0.5383, -3.0529) ()');
          mypaths.push('( 0.0000, -3.5000)-- ( 0.0000, -3.1000) ()');
          mypaths.push('(-3.4468, -0.6078)-- (-3.0529, -0.5383) ()');
          mypaths.push('(-3.2889, -1.1971)-- (-2.9130, -1.0603) ()');
          mypaths.push('(-3.0311, -1.7500)-- (-2.6847, -1.5500) ()');
          mypaths.push('(-2.6812, -2.2498)-- (-2.3747, -1.9926) ()');
          mypaths.push('(-2.2498, -2.6812)-- (-1.9926, -2.3747) ()');
          mypaths.push('(-1.7500, -3.0311)-- (-1.5500, -2.6847) ()');
          mypaths.push('(-1.1971, -3.2889)-- (-1.0603, -2.9130) ()');
          mypaths.push('(-0.6078, -3.4468)-- (-0.5383, -3.0529) ()');
          mypaths.push('( 0.0000, -0.1000)-- ( 0.0000, -0.8500) ()');
          var mypath = mypaths.join(' ');
          break;

        default:
          var mypath = '';
          break;
      }
      if(mypath){
        this.commands.push(this.to_shape(mypath,g,coords));///own method
      }else{
        ///is 'cmd' a known path?
        if(this.my_paths.has(cmd)){
          let p = this.my_paths.get(cmd);
          this.commands.push(this.to_shape_of_path(p,g,coords));//own method
        }
      }
      return false;
    }

    ///
    ///NOTE: all *draw* commands, dealing directly with a path
    ///
    if ((v = this.re_drawcontrolpoints_command.exec(line)) !== null) {
      var opt = this.remove_first_dot(v[1]);
      var line = v[2];
      var [txt,ts,line] = this.readActionLabel(line);
      var [g,line] = this.readActionStyle(line);
      var coords = this.read_action_coords(line);
      this.commands.push(this.do_drawcontrolpoints(opt,txt,ts,g,coords));//not own method
      return false;
    }
    if ((v = this.re_drawanglearc_command.exec(line)) !== null) {
      var opt = this.remove_first_dot(v[1]);
      var line = v[2];
      var [txt,ts,line] = this.readActionLabel(line);
      var [g,line] = this.readActionStyle(line);
      var coords = this.read_action_coords(line);
      this.commands.push(this.do_drawanglearc(opt,txt,ts,g,coords));//own method
      return false;
    }
    if ((v = this.re_draw_command.exec(line)) !== null) {
      var opt = this.remove_first_dot(v[1]);
      var line = v[2];
      var [txt,ts,line] = this.readActionLabel(line);
      var [g,line] = this.readActionStyle(line);
      var coords = this.read_action_coords(line);
      this.commands.push(this.p_path(coords,g));              
      return false;
    }
    if ((v = this.re_drawarrow_command.exec(line)) !== null) {
      var opt = this.remove_first_dot(v[1]);
      var line = v[2];
      var [txt,ts,line] = this.readActionLabel(line);
      var [g,line] = this.readActionStyle(line);
      var coords = this.read_action_coords(line);
      g.arrow=1;
      this.commands.push(this.p_path(coords,g));
      return false;
    }
    if ((v = this.re_drawrevarrow_command.exec(line)) !== null) {
      var opt = this.remove_first_dot(v[1]);
      var line = v[2];
      var [txt,ts,line] = this.readActionLabel(line);
      var [g,line] = this.readActionStyle(line);
      var coords = this.read_action_coords(line);
      g.revarrow=1;
      this.commands.push(this.p_path(coords,g));
      return false;
    }
    if ((v = this.re_drawdblarrow_command.exec(line)) !== null) {
      var opt = this.remove_first_dot(v[1]);
      var line = v[2];
      var [txt,ts,line] = this.readActionLabel(line);
      var [g,line] = this.readActionStyle(line);
      var coords = this.read_action_coords(line);
      g.dblarrow=1;
      this.commands.push(this.p_path(coords,g));
      return false;
    }
    ///
    ///NOTE: path command
    ///
    if ((v = this.re_fill_command.exec(line)) !== null) {
      var opt = this.remove_first_dot(v[1]);
      var line = v[2];
      var [txt, ts, line] = this.readActionLabel(line);
      var [g, line] = this.readActionStyle(line);
      var coords = this.read_action_coords(line);
      this.commands.push(this.p_fill(coords, g));
      return false;
    }
    if ((v = this.re_fillclipath_command.exec(line)) !== null) {
      var opt = this.remove_first_dot(v[1]);
      var line = v[2];
      var [txt, ts, line] = this.readActionLabel(line);
      var [g, line] = this.readActionStyle(line);
      var coords = this.read_action_coords(line);
      this.commands.push(this.p_fillclipath(coords, g));
      return false;
    }
    ///
    ///NOTE: Following are *primitive* commands, multiple objects
    /// will be drawn on each one of the points on the path
    ///
    if ((v = this.re_ellipse_command.exec(line)) !== null) {
      var opt = this.remove_first_dot(v[1]);
      var line = v[2];
      var [txt,ts,line] = this.readActionLabel(line);
      var [g,line] = this.readActionStyle(line);
      var coords = this.read_action_coords(line);
      this.commands.push(this.do_ellipse(opt,txt,ts,g,coords));///own method
      return false;
    }
    ///
    ///NOTE: Following are *primitive* commands, multiple objects
    /// will be drawn on each one of the points on the path
    ///
    if ((v = this.re_circle_command.exec(line)) !== null) {
      var opt = this.remove_first_dot(v[1]);
      var line = v[2];
      var [txt,ts,line] = this.readActionLabel(line);
      var [g,line] = this.readActionStyle(line);
      var coords = this.read_action_coords(line);
      this.commands.push(this.do_circle(opt,txt,ts,g,coords));///own method
      return false;
    }
    ///
    ///NOTE: Following are *primitive* commands, multiple objects
    /// will be drawn on each one of the points on the path
    ///
    if ((v = this.re_rect_command.exec(line)) !== null) {
      var opt = this.remove_first_dot(v[1]);
      var line = v[2];
      var [txt,ts,line] = this.readActionLabel(line);
      var [g,line] = this.readActionStyle(line);
      var coords = this.read_action_coords(line);
      this.commands.push(this.do_rect(opt,txt,ts,g,coords));///own method
      return false;
    }
    ///
    ///NOTE: node and edge
    ///
    if ((v = this.re_node_command.exec(line)) !== null) {
      var opt = this.remove_first_dot(v[1]);
      var opts = this.remove_first_dot(v[1]).split('.');
      var line = v[2];
      var [txt,ts,line] = this.readActionLabel(line);
      var [g,line] = this.readActionStyle(line);
      var coords = this.read_action_coords(line);
      this.commands.push(this.do_node(opts,txt,ts,g,coords));///own method
      return false;
    }
    if ((v = this.re_edge_command.exec(line)) !== null) {
      var opt = this.remove_first_dot(v[1]);
      var opts = this.remove_first_dot(v[1]).split('.');
      var line = v[2];
      var [txt,ts,line] = this.readActionLabel(line);
      var [g,line] = this.readActionStyle(line);
      var coords = this.read_action_coords(line);
      this.commands.push(this.do_edge(opts,txt,ts,g,coords));///own method
      return false;
    }
    ///
    ///NOTE: Following commands are *dot* commands
    ///
    if ((v = this.re_dot_command.exec(line)) !== null) {
      var opt = this.remove_first_dot(v[1]);
      var opts = this.remove_first_dot(v[1]).split('.');
      var line = v[2];
      var [txt,ts,line] = this.readActionLabel(line);
      var [g,line] = this.readActionStyle(line);
      var coords = this.read_action_coords(line);
      for (var i = 0; i < coords.length; i++) {
        var z0 = this.point(coords, i);
        if (!this.isvalidpt(z0)) continue;
        var x = z0[0];
        var y = z0[1];
        if(opts[0]=='hbar'){
          let barlength = this.to_barlength_length(g)/2;
          this.commands.push(this.p_line(x-barlength,y,x+barlength,y,g));
        }else if(opts[0]=='vbar'){
          let barlength = this.to_barlength_length(g)/2;
          this.commands.push(this.p_line(x,y-barlength,x,y+barlength,g));
        }else if(opts[0]=='lhbar'){
          let barlength = this.to_barlength_length(g)/2;
          this.commands.push(this.p_line(x - barlength, y, x, y, g));
        }else if(opts[0]=='rhbar'){
          let barlength = this.to_barlength_length(g)/2;
          this.commands.push(this.p_line(x, y, x + barlength, y, g));
        }else if(opts[0]=='tvbar'){
          let barlength = this.to_barlength_length(g)/2;
          this.commands.push(this.p_line(x, y, x, y + barlength, g));
        }else if(opts[0]=='bvbar'){
          let barlength = this.to_barlength_length(g)/2;
          this.commands.push(this.p_line(x, y - barlength, x, y, g));
        }else if(opts[0]=='square'){
          this.commands.push(this.p_dot_square(x,y,g));
        }else{
          this.commands.push(this.p_dot_circle(x,y,g));
        }
      }
      return false;
    }
    ///
    /// The box command   
    ///
    if ((v = this.re_box_command.exec(line)) !== null) {
      var opt = this.remove_first_dot(v[1]);
      var line = v[2];
      var [txt,ts,line] = this.readActionLabel(line);
      var [g,line] = this.readActionStyle(line);
      var coords = this.read_action_coords(line);
      this.commands.push(this.do_box(opt,txt,ts,g,coords));///own method
      return false;
    }
    ///
    /// Scalar commands   
    ///
    if ((v = this.re_cartesian_command.exec(line)) !== null) {
      var opt = this.remove_first_dot(v[1]);
      var line = v[2];
      var [txt,ts,line] = this.readActionLabel(line);
      var [g,line] = this.readActionStyle(line);
      var floats = this.read_action_floats(line);
      this.commands.push(this.do_cartesian(opt,txt,ts,g,floats));///own method
      return false;
    }
    if ((v = this.re_barchart_command.exec(line)) !== null) {
      var opt = this.remove_first_dot(v[1]);
      var line = v[2];
      var [txt,ts,line] = this.readActionLabel(line);
      var [g,line] = this.readActionStyle(line);
      var floats = this.read_action_floats(line);
      this.commands.push(this.do_barchart(opt,txt,ts,g,floats));///own method
      return false;
    }
    if(line.length>0){
      this.commands.push(this.do_comment(`unrecognized: ${line}`));
    }
    return false;
  }

  toLinecap(s) {
    s = s || 'butt';
    if (s === 'butt'||
        s === 'round'||
        s === 'square') {
      return s;
    }
    return 'butt';
  }

  toLinejoin(s) {
    s = s || 'miter';
    if (s === 'miter'||
        s === 'bevel'||
        s === 'round') {
      return s;
    }
    return 'miter';
  }

  toLinedashed(s) {
    s = s || '';
    if (s === ''||
        s === 'evenly'||
        s === 'withdots') {
      return s;
    }
    return '';
  }

  shiftcoords(coords,dx,dy) {
    var s = [];
    for( let [x,y,join,x1,y1,x2,y2] of coords ) {
      if (join=='cycle'||join=='nan') {
        s.push([x,y,join,x1,y1,x2,y2]);
      } else {
        x += dx;
        y += dy;
        x1 += dx;
        y1 += dy;
        x2 += dx;
        y2 += dy;
        s.push([x,y,join,x1,y1,x2,y2]);
      }
    }
    return s;
  }

  /// extract the expression of a+1,b+1
  /// until we have just gone past the comma, in which
  /// case the comma will be discarded and the value of the expression 'a+1'
  /// is caluclated based on the variable stored with the 'g' 
  extract_next_expr(s,g,z=0){
    /// such as x+1+y,...
    /// such as x+1)...
    var s0 = s;
    s = s.trimLeft();
    var op = '';
    var arg1 = 0;
    /// check to see if it is a comma, a left parenthis, or right 
    /// parenthesis
    var c = s.charAt(0);
    if (c === ',' || c === ')') {
      s = s.slice(1);
      return [c, s, c];
    }
    while(s.length){
      /// if the s starts with a comma or right-paren,
      /// then keep it in the s and return the current
      /// processed value
      var c = s.charAt(0);
      if(c === ',' || c === ')') {
        break;
      }

      /// a scalar is defined as a function, a comma, a left 
      /// parenthesis, a right parenthesis, a plus, minus, 
      /// multiplication, or division sign 
      var [a,s,phrase] = this.extract_next_scalar(s,g,z+1);
      ///'a' is string such as '*', '+', ')', or ','
      if (typeof a === 'number') {
        /// assume a is 'arg2 and run the operator
        var arg2 = a;
        arg1 = this.exec_operator(op,arg1,arg2);
        /// it is important to clear op here
        op = ''; 
      }else{
        /// otherwise assume a is an operator
        op = a; 
      } 
    }
    var phrase = s0.substr(0,s0.length-s.length);
    //console.log('extract_next_expr', arg1, s, phrase);

    return [arg1,s,phrase];
  }

  extract_next_scalar(s,g,z=0) {
    var s0 = s;
    s = s.trimLeft();
    if (s.length===0) {
      return ['','',''];
    }
    var v;
    if (s.charAt(0)==='('){
      var myval = 0;
      s = s.slice(1);
      while(s.length){
        var [a,s] = this.extract_next_expr(s,g,z+1);
        if(a === ')'){
          break;
        }else if(a === ','){
          continue;
        }else if(typeof a === 'number'){
          myval = a;
          continue;
        }
        continue;
      }
      var phrase = s0.substr(0,s0.length - s.length);
      //console.log('extract_next_scalar','paren',myval,s,g,phrase);
      return [myval,s,phrase];
    }
    if ((v=this.re_scalar_func.exec(s))!==null) {
      var func_name = v[1];
      s = s.slice(v[0].length);
      var args = [];
      while(s.length){
        /// the 's' would have looked like: 'x+1, y+1, z)', we will 
        /// call extract_next_expr which will extract one of them until the comma or a right parentheiss
        /// and return its numerical value. If the returned 'a' is not a numerical value we will assume
        /// that we have exhausted all arguments of this func
        var [a,s] = this.extract_next_expr(s,g,z+1);//extract until we see a comma or a right parenthesis
        if (typeof a === 'number') {
          args.push(a);
          continue;
        }
        if(a === ','){
          continue;
        }
        if(a === ')'){
          break;
        }
        continue;
      }
      var num = this.exec_scalar_func(func_name,args,z+1);
      var phrase = s0.substr(0,s0.length - s.length);
      //console.log('extract_next_scalar', 'scalar_func', num, s, g, phrase);
      return [num,s,phrase];
    } 
    /// here we need to check to see if it is a variable, such 
    /// as 'x', 'y', 'x1', 'xx1', etc. And we also need
    /// to check to see if it is an operator, such as '+', '-', 
    /// '*', '/', etc.
    if((v=this.re_symbol_only.exec(s))!==null){
      var var_name = v[1];
      s = v[2];
      if(g && g.hasOwnProperty(var_name)){
        var num = g[var_name];
      }else if(this.my_consts.has(var_name)){
        var num = this.my_consts.get(var_name);      
      }else{
        var num = NaN;
      }
      var phrase = s0.substr(0,s0.length - s.length);
      //console.log('extract_next_scalar', 'var_symbol', num, s, g, phrase);
      return [num,s,phrase];
    }
    /// if this is a float
    if((v=this.re_float_number.exec(s))!==null){
      var num = v[1];
      s = v[2];
      if((v=this.re_e_suffix.exec(s))!==null){
        var suffix=v[1];
        s = v[2];
        num = `${num}${suffix}`;
      }
      num = parseFloat(num);
      var phrase = s0.substr(0,s0.length - s.length);
      //console.log('extract_next_scalar', 'float_number', num, s, g, phrase);
      return [num,s,phrase];
    }
    /// extract the next character which must be an operator
    var op = s.charAt(0);
    s = s.slice(1);
    var phrase = s0.substr(0,s0.length - s.length);
    //console.log('extract_next_scalar', op, s, g, phrase);
    return [op,s,phrase];
  }

  /*
  Math.log() return the natural logarithm that is base e
  Math.log10 - return base 10 log
  The Math.log1p() function returns the natural logarithm (base e) of 1 + a number, that is
    Math.log1p(x) = ln(1+x), assuming x > -1
  The Math.log2() function returns the base 2 logarithm
  The constant Math.LN10 is the natural logarithm of 10, which is approx. 2.302
  */

  exec_scalar_func(func_name,func_args,z=0) {
    switch(func_name) {
      case 'log':
        return Math.log(func_args[0]);
        break;
      case 'log10':
        return Math.log10(func_args[0]);
        break;
      case 'log1p':
        return Math.log1p(func_args[0]);
        break;
      case 'log2':
        return Math.log2(func_args[0]);
        break;
      case 'exp':
        return Math.exp(func_args[0]);
        break;
      case 'pow':
        return Math.pow(func_args[0],func_args[1]);
        break;
      case 'rad':
        return func_args[0]/180*Math.PI;
        break;
      case 'deg':
        return func_args[0]/Math.PI*180;
        break;
      case 'cos':
        return Math.cos(func_args[0]);
        break;
      case 'sin':
        return Math.sin(func_args[0]);
        break;
      case 'sqrt':
        return Math.sqrt(func_args[0]);
        break;
      case 'atan2':
        return Math.atan2(func_args[0],func_args[1]);
        break;
      default:
        break;
    }
    if (this.my_funcs.has(func_name)) {
      var f = this.my_funcs.get(func_name);
      var g = {};
      /// place into 'g' so that each property is the name of the argument
      /// such as 'x', 'y', and the value of that property is the number
      /// in the same order of 'func_args' that is passed in
      f.args.forEach((x,i) => {
        g[x] = func_args[i];
      });
      var myexpr = `${f.expr}`;
      //console.log('james myexpr',myexpr)
      //the myexpr is a string such as  '(4*x+0.5+3)'
      //and the 'g' variable contains a list of its arguments and its assigned values
      var [ret_val] = this.extract_next_expr(myexpr,g);
      return ret_val;
    }
    return NaN;
  }

  exec_operator(op,arg1,arg2,z=0) {
    switch(op) {
      case '*':
        return parseFloat(arg1)*parseFloat(arg2);
        break;
      case '+':
        return parseFloat(arg1)+parseFloat(arg2);
        break;
      case '-':
        return parseFloat(arg1)-parseFloat(arg2);
        break;
      case '/':
        return parseFloat(arg1)/parseFloat(arg2);
        break;
      default:
        /// if the operator is not recognized simply returns the latest operand
        return arg2;
        break;
    }
  }

  do_barchart(opt,txt,ts,g,floats) {
    var o = [];
    var id = 0;
    if (!this.barcharts[id]) {
      this.barcharts[id] = {};
      var A = this.barcharts[id];
      A.xorigin = 0;
      A.yorigin = 0;
      A.xwidth = 10;
      A.ywidth = 10;
      A.xrange = 100;
      A.yrange = 100;
    }
    var A = this.barcharts[id];
    var opts = opt.split('.');
    var cmd = opts[0];
    var subcmd = opts[1];
    switch( cmd ) {
      case 'setup'://BARCHART
        A.xorigin = this.assertFloat(floats[0],A.xorigin);
        A.yorigin = this.assertFloat(floats[1],A.yorigin);
        A.xwidth = this.assertFloat(floats[2],A.xwidth);
        A.ywidth = this.assertFloat(floats[3],A.ywidth);
        A.xrange = this.assertFloat(floats[4],A.xrange);
        A.yrange = this.assertFloat(floats[5],A.yrange);
        break;

      case 'bbox'://BARCHART
        var x1 = A.xorigin; 
        var y1 = A.yorigin;
        var x2 = A.xorigin + A.xwidth;
        var y2 = A.yorigin + A.ywidth;
        var mypath = `((${x1},${y1})--(${x2},${y1})--(${x2},${y2})--(${x1},${y2})--cycle`;
        var coords = this.read_action_coords(mypath);
        o.push(this.p_path(coords,g));
        break;

      case 'vbar'://BARCHART
        for( var j=0; j < floats.length; j+=1 ) {
          var num = floats[j];
          if (Number.isFinite(num)){
            ///zero height bars are ignored
            if(num > 0){
              var x = A.xorigin + j*A.xwidth/A.xrange;
              var y = A.yorigin;
              var w = A.xwidth/A.xrange;
              var h = num*A.ywidth/A.yrange;
              w = this.scaledist(w);
              h = this.scaledist(h);
              [x,y] = this.scalexy(x,y);
              o.push(this.p_rect(x,y,w,h,g));
            }
          }
        }
        break;

      case 'ytick'://BARCHART
        for( var j=0; j < floats.length; j+=1 ) {
          var num = floats[j];
          if (Number.isFinite(num)){
            var x = A.xorigin;
            var y = A.yorigin + num*A.ywidth/A.yrange;
            [x,y] = this.scalexy(x,y);
            if(Number.isFinite(x)&&Number.isFinite(y)){
              o.push(this.p_label(x,y,`${num}`,ts,'lft',g));
              o.push(this.p_hbar(x,y,g));
            }
          }
        }
        break;

      case 'xlabel'://BARCHART
        for( var j=0,i=0; j < floats.length; j+=1,i++ ) {
          var num = floats[j];
          if (Number.isFinite(num)){
            var x = A.xorigin + num*A.xwidth/A.xrange
            var y = A.yorigin;
            [x,y] = this.scalexy(x,y);
            if(Number.isFinite(x)&&Number.isFinite(y)){
              var label = this.fetch_label_at(txt,j);
              o.push(this.p_label(x,y,label,ts,'bot',g));
            }
          }
        }
        break;

      default:
        break;
    }
    
    return o.join('\n');
  }

  do_cartesian(opt,txt,ts,g,floats) {
    var o = [];
    var id = 0;
    if (!this.cartesians[id]) {
      this.cartesians[id] = {};
      var A = this.cartesians[id];
      A.xorigin = 0;
      A.yorigin = 0;
      A.grid = 1;
    }
    var A = this.cartesians[id];
    var ss = opt.split('.');
    var cmd = ss[0];
    var cmdopt = ss[1]||'';
    switch( cmd ) {
      case 'setup'://CARTESIAN
        A.xorigin = this.assertFloat(floats[0],A.xorigin);    
        A.yorigin = this.assertFloat(floats[1],A.yorigin);    
        A.grid = this.assertFloat(floats[2],A.grid);  
        break;
       
      case 'xaxis'://DIAGRAM
        var x1 = this.assertFloat(floats[0],0);
        var x2 = this.assertFloat(floats[1],0);
        x1 /= A.grid;
        x2 /= A.grid;
        x1 += A.xorigin;
        x2 += A.xorigin;
        var y1 = A.yorigin;
        var y2 = A.yorigin;
        var mypath = `(${x1},${y1})--(${x2},${y2})`;
        var coords = this.read_action_coords(mypath);
        g.dblarrow=1;
        o.push(this.p_path(coords,g));
        break;

      case 'yaxis'://DIAGRAM
        var y1 = this.assertFloat(floats[0],0);
        var y2 = this.assertFloat(floats[1],0);
        y1 /= A.grid;
        y2 /= A.grid;
        y1 += A.yorigin;
        y2 += A.yorigin;
        var x1 = A.xorigin;
        var x2 = A.xorigin;
        var mypath = `(${x1},${y1})--(${x2},${y2})`;
        var coords = this.read_action_coords(mypath);
        g.dblarrow=1;
        o.push(this.p_path(coords,g));
        break;

      case 'xtick'://CARTESIAN
        for (var j=0; j < floats.length; ++j) {
          var num = floats[j];
          var x = A.xorigin + num/A.grid;
          var y = A.yorigin;
          [x,y] = this.scalexy(x,y);
          o.push(this.p_vbar(x,y,g));
          if(Number.isFinite(x)&&Number.isFinite(y)){
            o.push(this.p_label(x,y,`${num}`,ts,'bot',g));
          }
        }
        break;

      case 'ytick'://CARTESIAN
        for (var j=0; j < floats.length; ++j) {
          var num = floats[j];
          var x = A.xorigin;
          var y = A.yorigin + num/A.grid;
          [x,y] = this.scalexy(x,y);
          o.push(this.p_hbar(x,y,g));
          if(Number.isFinite(x)&&Number.isFinite(y)){
            o.push(this.p_label(x,y,`${num}`,ts,'lft',g));
          }
        }
        break;

      case 'ellipse'://CARTESIAN
        /// x,y,rx,ry,angle
        var x     = this.assertFloat(floats[0],0);
        var y     = this.assertFloat(floats[1],0);
        var Rx    = this.assertFloat(floats[2],2);
        var Ry    = this.assertFloat(floats[3],1);
        var angle = this.assertFloat(floats[4],0);
        Rx /= A.grid;
        Ry /= A.grid;
        x /= A.grid;
        y /= A.grid;
        x += A.xorigin;
        y += A.yorigin;
        [x,y] = this.scalexy(x,y);
        Rx = this.scaledist(Rx);
        Ry = this.scaledist(Ry);
        o.push(this.p_ellipse(x,y,Rx,Ry,angle,g));
        break;

      case 'yplot'://CARTESIAN
        var f = g.f;
        for(var x of floats){
          var y = this.exec_scalar_func(f,[x]);
          x /= A.grid;
          y /= A.grid;
          x += A.xorigin;
          y += A.yorigin;
          [x,y] = this.scalexy(x,y);
          if(Number.isFinite(x)&&Number.isFinite(y)){
            o.push(this.p_dot_circle(x,y,g));
          }
        }
        break;

      case 'xplot'://CARTESIAN
        var f = g.f;
        for (var y of floats) {
          var x = this.exec_scalar_func(f, [y]);
          x /= A.grid;
          y /= A.grid;
          x += A.xorigin;
          y += A.yorigin;
          [x,y] = this.scalexy(x,y);
          if (Number.isFinite(x) && Number.isFinite(y)) {
            o.push(this.p_dot_circle(x, y, g));
          }
        }
        break;

      case 'dot'://CARTESIAN
        for( var j=0; j < floats.length; j+=2 ) {
          var x = floats[j];
          var y = floats[j+1];
          x /= A.grid;
          y /= A.grid;
          x += A.xorigin;
          y += A.yorigin;
          [x,y] = this.scalexy(x,y);
          if(Number.isFinite(x)&&Number.isFinite(y)){
            o.push(this.p_dot_circle(x,y,g));
          }
        }
        break;

      case 'line'://CARTESIAN
        var coords = [];
        for( var j=0; j < floats.length; j+=2 ) {
          var x = floats[j];
          var y = floats[j+1];
          x /= A.grid;
          y /= A.grid;
          x += A.xorigin;
          y += A.yorigin;
          [x,y] = this.scalexy(x,y);
          coords.push([x,y]);
        }
        o.push(this.p_path(coords,g));
        break;

      case 'label'://CARTESIAN
        for( var j=0,i=0; j < floats.length; j+=2,i++ ) {
          var x = floats[j];
          var y = floats[j+1];
          x /= A.grid;
          y /= A.grid;
          x += A.xorigin;
          y += A.yorigin;
          [x,y] = this.scalexy(x,y);
          if(Number.isFinite(x)&&Number.isFinite(y)){
            var label = this.fetch_label_at(txt,i);
            o.push(this.p_label(x,y,label,ts,cmdopt,g));
          }
        }
        break;

      case 'arc'://CARTESIAN
        /// cartesian arc x y r a1 a2
        var x     = this.assertFloat(floats[0],0);
        var y     = this.assertFloat(floats[1],0);
        var r     = this.assertFloat(floats[2],1);
        var a1    = this.assertFloat(floats[3],0);
        var a2    = this.assertFloat(floats[4],45);
        x /= A.grid;
        y /= A.grid;
        x += A.xorigin;
        y += A.yorigin;
        r /= A.grid;
        [x,y] = this.scalexy(x,y);
        r = this.scaledist(r);
        o.push(this.p_arc(x,y,r,a1,a2,g));
        break;

      default:
        break;
    }
    
    return o.join('\n');
  }

  do_label(opt,txt,ts,g,coords){
    ///NOTE: that the 'opt' has already been checked and converted to valid '.rt','.lft'
    ///values. However, it might contain '.ctr'. 
    var o = [];
    for (var i = 0; i < coords.length; ++i){
      var z0 = this.point(coords, i);
      if (!this.isvalidpt(z0)) continue;
      var x = z0[0];
      var y = z0[1];
      var t = this.fetch_label_at(txt,i);
      o.push(this.p_label(x,y,t,ts,opt,g));
    }
    return o.join('\n');
  }

  to_shape(mypath,g,coords){
    ///the w and h are not significant here, will be
    ///removed in the future, each shape is only
    ///shown in its native size, and will be scaled
    ///using the [sx:] and [sy:] factors of 'g'
    var o = [];
    var p = this.read_shape_coords(mypath);
    for (var i = 0; i < coords.length; i++) {
      var z0 = this.point(coords, i);
      if(!this.isvalidpt(z0)) continue;
      var x = z0[0];
      var y = z0[1];
      o.push(this.p_shape(x,y,p,g));
    }
    return o.join('\n');
  }
  to_shape_of_path(p,g,coords){
    ///the w and h are not significant here, will be
    ///removed in the future, each shape is only
    ///shown in its native size, and will be scaled
    ///using the [sx:] and [sy:] factors of 'g'
    var o = [];
    var p = this.adjust_shape_coords(p);
    for (var i = 0; i < coords.length; i++) {
      var z0 = this.point(coords, i);
      if(!this.isvalidpt(z0)) continue;
      var x = z0[0];
      var y = z0[1];
      o.push(this.p_shape(x,y,p,g));
    }
    return o.join('\n');
  }

  do_drawanglearc(opt,txt,ts,g,coords){   
    var o = [];
    var r1 = this.assertFloat(g.r1,0.75,0,this.MAX);
    var r2 = this.assertFloat(g.r2,1.50,0,this.MAX);
    for(var j=0; j < coords.length-2; ++j){
      // 'z0' is the vertex, 'z1' is the start, and 'z2' is the stop 
      var z1 = this.point(coords, j+0);
      var z0 = this.point(coords, j+1);
      var z2 = this.point(coords, j+2);
      //var label = ss[j];
      var label = this.fetch_label_at(txt,j);
      // check for validity of all three points
      if(!this.isvalidpt(z0)) continue;
      if(!this.isvalidpt(z1)) continue;
      if(!this.isvalidpt(z2)) continue;
      // start drawing anglearc
      var x0 = z0[0];
      var y0 = z0[1];
      var dx1 = z1[0] - z0[0];
      var dy1 = z1[1] - z0[1];
      var dx2 = z2[0] - z0[0];
      var dy2 = z2[1] - z0[1];
      var ang1 = Math.atan2(dy1, dx1) / Math.PI * 180;
      var ang2 = Math.atan2(dy2, dx2) / Math.PI * 180;
      if (ang1 < 0) { ang1 += 360; }
      if (ang2 < 0) { ang2 += 360; }
      if (ang2 < ang1) { ang2 += 360; }
      var angledelta = ang2 - ang1;
      if (opt==='sq') {
        o.push(this.p_arc_sq(x0,y0,r1,ang1,ang2,g));
      } else {
        o.push(this.p_arc(x0,y0,r1,ang1,ang2,g));
      }
      if (label) {
        var ang = ang1+angledelta/2;
        if (ang > 360) {
          ang -= 360;
        }
        var labelx = x0 + (r2) * Math.cos(ang / 180 * Math.PI);
        var labely = y0 + (r2) * Math.sin(ang / 180 * Math.PI);
        o.push(this.p_label(labelx,labely,label,ts,'ctr',g));
      }
    }
    return o.join('\n');
  }

  do_node(opts,txt,ts,g,coords){
    var o = [];
    var name = opts[0];
    var r = this.get_float_prop(g,"r",1);
    var r = this.scaledist(r);
    for( var pt of coords ){
      if(!this.isvalidpt(pt)) continue;
      var v = {pt,r,g,txt,ts}
      name = name||'';
      o.push(this.p_circle(pt[0],pt[1],r,g));
      if(txt){
        ///NOTE: the drawing of label must come *after* the circle
        ///because if the circle is filled then the label is not
        ///obscured
        o.push(this.p_label(pt[0],pt[1],txt,ts,'ctr',g));
      }
      if(name){
        this.my_nodes.set(name,v);
      }
    }
    return o.join('\n');
  }

  do_edge(opts,txt,ts,g,coords){
    var o = [];
    var name1 = opts[0];
    var name2 = opts[1];
    if(this.my_nodes.has(name1)&&this.my_nodes.has(name2)){
      var node1 = this.my_nodes.get(name1);
      var node2 = this.my_nodes.get(name2);
      var dir = this.assertFloat(g.dir,0);
      let [p0,p1,p2] = this.dir_to_qbezier(dir, 
        node1.pt[0],node1.pt[1],node1.r, 
        node2.pt[0],node2.pt[1],node2.r);        
      if(dir){
        o.push(this.p_qbezier_line(p0[0],p0[1], p1[0],p1[1], p2[0],p2[1],g));
      }else{
        o.push(this.p_line(p0[0],p0[1],p2[0],p2[1],g));
      }
      o.push(this.p_label(p1[0],p1[1],txt,ts,'ctr',g));
    }
    return o.join('\n');
  }

  dir_to_qbezier(dir, x1,y1,r1, x2,y2,r2){
    var p0 = [x1,y1];
    var p2 = [x2,y2];
    // 
    var dx = +x2-x1;
    var dy = +y2-y1;
    // half distance between to end points
    var half_dist = Math.sqrt(dx*dx + dy*dy)/2;
    // convert dir to radians
    dir *= Math.PI/180;
    //magnitude of the vector [U,V]
    var D = Math.tan(Math.abs(dir))*half_dist;
    // compute the unit-vector [u,v] that is perpendicular to [x1,y1]--[x2,y2]
    var u, v;
    if(Math.abs(dx) < this.MIN){ dx = 0; }
    if(Math.abs(dy) < this.MIN){ dy = 0; }
    if(dx==0 && dy==0){
      u = 0;
      v = 0;
    }else if(dy==0){
      u = 0;
      if(dx>0){
        v = 1 * D;
      }else{
        v = -1 * D;
      }
    }else if(dx==0){
      v = 0;
      if(dy>0){
        u = -1 * D;
      }else{
        u = 1 * D;
      }
    }else{
      var M = dx/dy;
      var M_sq = M*M;
      var M_sq_plus_1 = M_sq + 1;
      u = D/Math.sqrt(M_sq_plus_1); 
      if(dy>0){
        u = -u;
      }
      v = dx*u/(-dy);
    }
    if(dir > 0){
      var U = (x1+x2)/2 + u;
      var V = (y1+y2)/2 + v;
    }else{
      var U = (x1+x2)/2 - u;
      var V = (y1+y2)/2 - v;
    }
    var p1 = [U,V];
    //re-compute p0 starting point 
    var ang1 = Math.atan2(dy,dx);
    ang1 += dir;
    p0[0] += r1 * Math.cos(ang1);
    p0[1] += r1 * Math.sin(ang1);
    //re-compute p2 starting point
    var ang2 = Math.PI + Math.atan2(dy,dx);
    ang2 -= dir;
    p2[0] += r2 * Math.cos(ang2);
    p2[1] += r2 * Math.sin(ang2);
    //console.log('dir=',dir,'ang1=',ang1,'ang2=',ang2);
    //console.log('qbezier=',p0,p1,p2);
    return [p0,p1,p2];
  }

  do_box(opt,txt,ts,g,coords){
    var o = [];
    var w = this.get_float_prop(g,"w",2);
    var h = this.get_float_prop(g,"h",2);
    w = this.scaledist(w);
    h = this.scaledist(h);
    for (var j = 0; j < coords.length; j++) {
      var z0 = this.point(coords, j);
      if (!this.isvalidpt(z0)) continue;
      var x = z0[0];
      var y = z0[1];
      o.push(this.p_rect(x,y,w,h,g));
      if (txt) {
        var labelx = x + w/2;
        var labely = y + h/2;
        var txt_ss = txt.split('\\\\');
        var n = txt_ss.length;
        var multi = this.to_multiline(n,labelx,labely,'ctr');
        multi.forEach(([txt_x,txt_y],i) => {
          let txt_s = txt_ss[i];
          o.push(this.p_label(txt_x,txt_y,txt_s,ts,'ctr',g));
          ///always draw label centered in the box
        })
      }
    }
    return o.join('\n');
  }

  do_ellipse(opt, txt, ts, g, coords) {
    var o = [];
    var opts = opt.split('.');
    var Rx = this.assertFloat(g.rx, 1);
    var Ry = this.assertFloat(g.ry, 1);
    var a = this.assertFloat(g.a, 0);
    Rx = this.scaledist(Rx);
    Ry = this.scaledist(Ry);
    for (var i = 0; i < coords.length; i++) {
      var z0 = this.point(coords, i);
      if (!this.isvalidpt(z0)) continue;
      var x = (z0[0]);
      var y = (z0[1]);
      if (opts[0] == '') {
        //fullcircle
        o.push(this.p_ellipse(x,y,Rx,Ry,a,g));
      }
    }
    return o.join('\n');
  }

  do_circle(opt, txt, ts, g, coords) {
    var o = [];
    var opts = opt.split('.');
    var radius = this.get_float_prop(g, "r", 1);
    var angle1 = this.assertFloat(g.a1, 0);
    var angle2 = this.assertFloat(g.a2, 45);
    radius = this.scaledist(radius);
    for (var i = 0; i < coords.length; i++) {
      var z0 = this.point(coords, i);
      if (!this.isvalidpt(z0)) continue;
      var x = (z0[0]);
      var y = (z0[1]);
      if (opts[0] == '') {
        //fullcircle
        o.push(this.p_circle(x,y,radius,g));
      }
      else if (opts[0] == 'pie') {
        //pie
        o.push(this.p_pie(x,y,radius,angle1,angle2,g));
      }
      else if (opts[0] == 'chord'){
        //chord
        o.push(this.p_chord(x,y,radius,angle1,angle2,g));
      }
      else if (opts[0] == 'arc'){
        //arc
        o.push(this.p_arc(x,y,radius,angle1,angle2,g));
      }
      else if (opts[0] == 'cseg') {
        //cseg
        o.push(this.p_cseg(x,y,radius,angle1,angle2,g));
      }
    }
    return o.join('\n');
  }

  do_rect(opt, txt, ts, g, coords) {
    var o = [];
    var opts = opt.split('.');
    var w = this.get_float_prop(g, "w", 1);
    var h = this.get_float_prop(g, "h", 1);
    w = this.scaledist(w);
    h = this.scaledist(h);
    for (var i = 0; i < coords.length; i++) {
      var z0 = this.point(coords, i);
      if (!this.isvalidpt(z0)) continue;
      var x = (z0[0]);
      var y = (z0[1]);
      if (opts[0] == '') {
        //fullcircle
        o.push(this.p_rect(x,y,w,h,g));
      }
    }
    return o.join('\n');
  }

  is_var(x){
    return this.my_consts.has(x);
  }

  fetch_var(x){
    return this.my_consts.get(x);
  }

  fetch_label_at(txt,n) {
    const del='\\\\';
    var start_i=0;
    var i = -1;
    var i=txt.indexOf(del,start_i);
    //console.log('i=',i);
    for(let j=0; j<n; ++j){
      if(i >= 0){
        start_i = i + del.length;
        //console.log('start_i=',start_i);
      } else {
        break;
      }
      i = txt.indexOf(del,start_i);
      //console.log('i=',i);
    }
    //console.log('start_i=',start_i,'i=',i);
    if(i<0){
      return txt.slice(start_i).trim();
    }else{
      return txt.slice(start_i,i).trim();
    }
  }

  move_label_away(x,y,ta,labeldx,labeldy){
    /// x,y,dx,dy are in grid units
    ///where positive dy goes up and positive dx goes east
    if (ta==='lrt') {
      var dx = +labeldx;
      var dy = -labeldy;
    } else if (ta==='bot') {
      var dx = 0;
      var dy = -labeldy;
    } else if (ta==='llft') {
      var dx = -labeldx;
      var dy = -labeldy;
    } else if (ta==='urt') {
      var dx = +labeldx;
      var dy = +labeldy;
    } else if (ta==='top') {
      var dx = 0;
      var dy = +labeldy;
    } else if (ta==='ulft') {
      var dx = -labeldx;
      var dy = +labeldy;
    } else if (ta==='rt') {
      var dx = +labeldx;
      var dy = 0;
    } else if (ta==='lft') {
      var dx = -labeldx;
      var dy = 0;
    } else if (ta==='ctr') {
      var dx = 0;
      var dy = 0;
    } else {
      //treat it as 'urt'
      var dx = +labeldx;
      var dy = +labeldy;
    }
    x += dx;
    y += dy;
    return [x,y];
  }
  to_dia(lines){

  }
  to_multiline(n,x,y,ta){
    var multi = [];
    let multidy = this.config.multidy||1;
    multidy = parseFloat(multidy);
    if(!Number.isFinite(multidy)){
      multidy = 1;
    }
    if(ta=='ctr'||ta=='lft'||ta=='rt'){
      var dy = -(n-1)*(0.5*multidy);
    }else if(ta=='top'||ta=='ulft'||ta=='urt'){
      var dy = (n-1)*multidy;
    }else{
      var dy = -(n-1)*multidy;
    }
    for(let j=0; j < n; ++j){
      multi.push([x,y+j*multidy]);
    }
    multi = multi.map(([x,y]) => {
      y += dy;
      return [x,y];
    })
    return multi;
  }
  deg_to_rad(x){
    return (x * Math.PI / 180);
  }
  string_to_path_arg(s){
    var v;
    var d = [];
    var user = {};
    s = s.trimLeft();
    while(s.length){
      var coords = this.readCoordsLine(s,user);
      if(coords.length){
        d.push({coords});
        s = user.s;
        if (s.charAt(0) == ',') {
          s = s.slice(1).trimLeft();
          continue;
        }
        break;
      }else{
        let i = s.indexOf(',');
        if(i > 0){
          let a = s.slice(0,i);
          a = parseFloat(a);
          if(Number.isFinite(a)){
            let scalar = a;
            d.push({scalar});
          }
          s = s.slice(i+1);
          continue;
        }
        if(s.length){
          let a = s;
          a = parseFloat(a);
          if(Number.isFinite(a)){
            let scalar = a;
            d.push({scalar});
          }
        }
        break;
      }
    }
    return d;
  }
  string_to_range(s){
    // [1:3:10]
    // [1:10]
    // [1,2,3,4,5]
    var base;
    var limit;
    var step;
    var ss = [];
    var is_colon = 0;
    var v;
    if ((v=this.re_range_two.exec(s))!==null) {
      var base = v[1];
      var limit = v[2];
      var step = 1;
      is_colon = 1;
    } else if ((v = this.re_range_three.exec(s)) !== null) {
      var base = v[1];
      var step = v[2];
      var limit = v[3];
      is_colon = 1;
    } else {
      var ss = s.split(',');
      ss = ss.map(x => x.trim());
      //ss = ss.map(x => parseFloat(x));
      //ss = ss.filter(x => Number.isFinite(x));
    }
    if(is_colon){
      var d = [];
      step = Math.abs(step);
      var n = Math.floor((limit - base) / step);
      n = Math.abs(n);
      if (step >= this.MIN) {
        if (limit > base) {
          for (var j = 0; j <= n; ++j) {
            d.push(parseFloat(+base + (j * step)));
            if(d.length > this.MAX){
              break;
            }
          }
        }
        else if (limit < base) {
          for (var j = 0; j <= n; ++j) {
            d.push(parseFloat(+base - (j * step)));
            if(d.length > this.MAX){
              break;
            }
          }
        }
      }
      return d;
    }
    return ss;
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
}

module.exports = { NitrilePreviewDiagram };
























