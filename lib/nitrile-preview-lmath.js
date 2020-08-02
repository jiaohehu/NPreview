'use babel';

const { NitrilePreviewTokenizer } = require('./nitrile-preview-tokenizer');

class NitrilePreviewLmath extends NitrilePreviewTokenizer {

  constructor (translator) {
    super(translator);
  }

  to_lmath (str,dstyle) {
    this.iseq = 0;
    this.isdmath = dstyle;
    this.isdstyle = dstyle;
    var l = this.toTokens(str);
    var g = this.toGroups(l);
    var g = this.toCleanup(g);
    var g = this.toCommands(g);
    var g = this.toSubsup(g);
    var {s} = this.toInnerSvg(g);
    return s;
  }

  to_lmath_array (str) {
    this.iseq = 1;
    this.isdmath = 1;
    this.isdstyle = 1;
    var l = this.toTokens(str);
    var g = this.toGroups(l);
    var g = this.toCleanup(g);
    var g = this.toCommands(g);
    var g = this.toSubsup(g);
    var d = this.split_math_group(g);
    d = d.map(x => {
      var pp = this.split_math_align(x);
      var pp = pp.map(p => this.toInnerSvg(p));
      var pp = pp.map(p => p.s);
      while(pp.length > 2){
        var p1 = pp.pop();
        var p2 = pp.pop();
        var p = `${p2} ${p1}`;
        pp.push(p);
      }
      return pp;
    });
    return d;
  }

  toInnerSvg (v, compact=false) {

    /// 'v': is an element, such as '\alpha', '1', '+', or a group,
    /// such as: '\\brace',     [Array], '', '', ...
    /// or:      '\\leftright', [Array], '[', ']', ...
    /// or:      '\\beginend',  [Array], 'pmatrix', 'pmatrix', ...
    ///
    /// The return value of this function is an array of seven elements:
    ///           var [w_,h_,mid_,s_,g_,q_,id_] = this.toInnerSvg(...)
    ///  w_    this is a number expressing the width of the SVG in terms of pt
    ///  h_    this is a number expressing the height of the SVG in terms of pt
    ///  mid_  this is a number expresses vertically shift has to be in order to
    //         align this element with neighboring elements in a row.
    ///        It is a number expressing the distance from the top, in the unit of pt
    ///  s_    this is a string expressing a SVG element such as "<text> ... </text>"
    ///        or "<line />", or "<svg> ... </svg>"
    ///  g_    this is usually the same as the op= attribute of the element
    ///        that gives hint about whether it needs to add gaps before
    ///        and/or after this element
    ///  q_    this is a flag of 0/1 indicating whether a gap is forced after
    ///        this element, such as after a summation symbol.
    ///  id_   this is a string that is set to be the same as the id= attribute
    //         of the symbol; this is useful to let us know what symbol we are current
    //         laying out so we can space it accordingly. So far the only usage is
    //         when an open-parenthesis symbol is detected and the previous symbol is \log or
    //         like, the gap between the previous symbol and this open-parenthesis is
    //         suppressed; otherwise the gap is preserved;

    var x = 0;
    var y = 0;
    var w = 0;
    var h = 12;
    var mid = 6;
    var s = '';
    if (v === undefined || v === null) {
      s = '\\text{?`}';///this could happen when a superscript is missing such as a^
      ///in which case we will just output a^{} to keep latex happy
      return {s};
    } else if (v === '') {
      var s = '{}';
      return {s};
    } else if (v === '\\displaystyle') {
      this.isdstyle = 1;
      return {s};
    } else if (Array.isArray(v)) {
      var cmdname = v[0];
      switch (cmdname) {

        case '\\beginend': 

          var name = v[2];
          if (name == 'cases' || 'matrix' || name == 'pmatrix' || name == 'bmatrix' || name == 'Bmatrix' || name == 'vmatrix' || name == 'Vmatrix' ) {
            this.isinmatrix = true;
            var o = [];
            var p = this.splitArray(v[1]);
            var nrow = p.length;
            var ncol = p.map(d => d.length).reduce((cur,acc) => Math.max(cur,acc));
            for (let i=0; i < nrow; ++i) {
              var ss = [];
              for (let j=0; j < ncol; ++j) {
                let pv = p[i][j];
                if (pv) {
                  var {s: s1} = this.toInnerSvg(['\\brace',pv,'','',''],compact);
                  ss.push(s1);
                }
              }
              ss = ss.join(' & ');
              ss = `${ss} \\\\`;
              o.push(ss);
            }
            var s = o.join(' ');
            this.isinmatrix = false;
            ///now we need to add some fences for
            ///    matrix
            ///    pmatrix
            ///    bmatrix
            ///    Bmatrix
            ///    vmatrix
            ///    Vmatrix
            var fence1 = '';
            var fence2 = '';
            if (name == 'pmatrix') {
              fence1 = '(';
              fence2 = ')';
            } else if (name == 'bmatrix') {
              fence1 = '[';
              fence2 = ']';
            } else if (name == 'Bmatrix') {
              fence1 = '\\{';
              fence2 = '\\}';
            } else if (name == 'vmatrix') {
              fence1 = '\\vert';
              fence2 = '\\vert';
            } else if (name == 'Vmatrix') {
              fence1 = '\\Vert';
              fence2 = '\\Vert';
            } else {
              fence1 = '';
              fence2 = '';
            }
            o = [];
            if(1){
              o.push(`\\begin{${name}}`);
              o.push(s);
              o.push(`\\end{${name}}`);
              var s = o.join(' ');
              return {s};
            }
          } else {
            /// this is when the name is not one of the 'cases', 'matrix', 'pmatrix', etc,
            /// this should not happend because if so we have not taken care of this case yet,
            /// For now to make it not-break we just treate it as a normal brace, which should
            /// not have been its intended behavior but it atleast does not break
            /// the code turn it into a \\brace command
            console.log(`unhandled: ${name}`);
            return this.toInnerSvg(['\\brace',v[1],'','',v[4]],compact);
          }
          break;

        case '':
          var g = v[1];
          var results = g.map( x => this.toInnerSvg(x,compact) );
          var ss = results.map( x => x.s );
          var s = ss.join(' ');
          return {s};
          break;

        case '\\pipe':
        case '\\math':
        case '\\brace':
        case '\\leftright':

          this.bracelevel += 1;
          var g = v[1];
          var results = g.map( x => this.toInnerSvg(x,compact) );
          var s = '';
          var o = [];
          if (v[0] === '\\pipe') {
            this.bracelevel -= 1;
            var ss = results.map( x => x.s );
            var s = ss.join(' ');
            return {s};
          } else if (v[0] === '\\math') {
            this.bracelevel -= 1;
            var ss = results.map( x => x.s );
            var s = ss.join(' ');
            if(this.isdmath){
              var s = `\\[${s}\\]`;
            }else{
              var s = `\\(${s}\\)`;
            }
            return {s};
          } else if (v[0] === '\\brace') {
            this.bracelevel -= 1;
            var ss = results.map( x => x.s );
            var s = ss.join(' ');
            var s = `{${s}}`;
            return {s};
          } else {
            this.bracelevel -= 1;
            var ss = results.map( x => x.s );
            var s = ss.join(' ');
            var fence1 = v[2];
            var fence2 = v[3];
            /// corrections
            if (fence1 === '\\\{') fence1 = '\\lbrace';
            if (fence1 === '\\\}') fence1 = '\\rbrace';
            if (fence2 === '\\\{') fence2 = '\\lbrace';
            if (fence2 === '\\\}') fence2 = '\\rbrace';
            /// corrections
            if (fence1 === '[') fence1 = '\\lbrack';
            if (fence1 === ']') fence1 = '\\rbrack';
            if (fence2 === '[') fence2 = '\\lbrack';
            if (fence2 === ']') fence2 = '\\rbrack';
            /// corrections
            if (fence1 === '\\lparen') fence1 = '(';
            if (fence1 === '\\rparen') fence1 = ')';
            if (fence2 === '\\lparen') fence2 = '(';
            if (fence2 === '\\rparen') fence2 = ')';
            /// corrections
            if (fence1 === '.') fence1 = '.';
            if (fence2 === '.') fence2 = '.';
            s =  `\\left${fence1} ${s} \\right${fence2}`;
            return {s};
          }
          break;

        case '\\sub':
          /// 2 arguments, 0 option
          var {s: s1} = this.toInnerSvg(v[1],compact);
          var {s: s2} = this.toInnerSvg(v[2],compact);
          var s =          `${s1}_${s2}`;
          return {s};
          break;

        case '\\sup':
          /// 2 arguments, 0 option
          var {s: s1} = this.toInnerSvg(v[1],compact);
          var {s: s2} = this.toInnerSvg(v[2],compact);
          var s =          `${s1}^${s2}`;
          return {s};
          break;

        case '\\subsup':
          /// 3 arguments, 0 option
          var {s: s1} = this.toInnerSvg(v[1],compact);
          var {s: s2} = this.toInnerSvg(v[2],compact);
          var {s: s3} = this.toInnerSvg(v[3],compact);
          var s =          `${s1}_${s2}^${s3}`;
          return {s};
          break;

      }

      ///take care of math commands such as when its "verbatim" member
      /// is set to "1" in "math.json"
      ///
      var math_cmd_info = this.findMathCommandInfo(cmdname);
      if (math_cmd_info) {///is a math command
        if(math_cmd_info.verbatim){
          /// get the 'str'
          var v1 = v[1];
          var str = '';
          if (v1 === undefined){
            str = '\\text{?`}';
          }
          else if (Array.isArray(v1)) {
            if (v1[0] === '\\brace') {
              str = v1[4];
            } else {
              str = v1.toString();//this should not have happened
            }
          } 
          else {
            str = '' + v1;/// ensure this is text
          }
          var s = `${cmdname}{${str}}`;
          return { s };
        }
      }

      //take care of general math commands such as \sqrt, \binom, 
      /// where there is a .count member and a .option member
      var math_cmd_info = this.findMathCommandInfo(cmdname);
      if(math_cmd_info){///is a math command
        var a_opt = '';
        var a_args = [];
        var k = math_cmd_info.option;
        var n = math_cmd_info.count;
        k = k||0;
        n = n||0;
        if(k){
          a_opt = v[1];
        }
        for(var i=0; i < n; ++i){
          a_args.push(v[1+k+i]);
        }
        s = v[0];
        if(a_opt){
          s += `[${a_opt}]`;
        }
        for(var i=0; i < n; ++i){
          let {s: s1} = this.toInnerSvg(a_args[i],compact);
          s += ' '; // add space, this will take care of the case
                    // of \sqrt m, here, where s1 is 'm'
          s += s1;
        }
        return {s};
      } 

      // just output the command name---this should have have happened,
      // this command name should have been part of the math command
      s = v[0];
      return {s};

    } else {

      // SINGLE ELEMENT      

      var m;

      // if it is double-backslash
      // we replace it with a space
      
      if(v == '\\\\'){
        var s = '';
        return {s};
      }

      // if it is an ampersand
      // we replace it with '\&'
    
      if(v == '&'){
        var s = '\\&';
        return {s};
      }
    
      // if it is a dollar sign
      // we replace it with '\$'
    
      if(v == '$'){
        var s = '\\$';
        return {s};
      }

      // if it is a apostrophy then replace it with '\prime'
    
      if(v == "\'"){
        var s = '\\prime';
        return {s};
      }
      if(v == "\'\'"){
        var s = '\\prime\\prime';
        return {s};
      }
      if(v == "\'\'\'"){
        var s = '\\prime\\prime\\prime';
        return {s};
      }
    
      // check to see if it is a predefined \mathcal, \mathit, etc.
  
      if(this.is_mathvariant_expr(v)){
        var s = v;
        return {s};
      }

      var used = new Set();
      var [id,width,op,latex] = this.findIdByElement(v,used);

      if(id){

        // DEFINED element 

        if(latex){
          v = latex;
        }
        var s = v;
        return {s};

      } else if ((m=this.re_loglikename.exec(v))!==null){

        // such as \P

        //v = m[1];
        //var s = `\\;\\text{${v}}`;//we add \; to add some space
        var s = v;
        return {s};

      } else {

        // such as '*'

        var s = `\\text{${v}}`;
        return {s};

      }
    }
  }

}

module.exports = { NitrilePreviewLmath }
