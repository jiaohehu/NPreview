Test Listing

%!latex.twocolumns=1

"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
culpa qui officia deserunt mollit anim id est laborum."

Please see listing $(#mylisting) for more information.

@@ $(#mylisting)
  Source code of PNG.TCL.
  ```listing
  ### "PNG.tcl"

  package provide PNG 1.0 
  package require Tcl 8.6 
  namespace eval PNG {

    namespace ensemble create -subcommands write
    #
    # Write a PNG file to disk.
    #
    # filename - Output file name.
    # palette  - Ordered list of RGB color values in hex 
    #            notation. List length must be <= 256.
    # image    - Image data as a list of scanlines each
    #            of which is a list of palette index
    #            values for the pixels in the scanline.
    #
    proc write { filename palette image } { 
      set fid [open ${filename} w]
      fconfigure ${fid} -translation binary
      set width [llength [lindex ${image} 0]] 
      set height [llength ${image}]
      puts -nonewline ${fid} [binary format c8 {137 80 78 71 13 10 26 10}]
      set data {}
      append data [binary format I ${width}]
      append data [binary format I ${height}]
      ### bit depth 8, color type 3
      ### (each pixel is a palette index)
      append data [binary format c5 {8 3 0 0 0}] 
      Chunk ${fid} "IHDR" ${data}
      set data {}
      set unique-colors \
        [lsort -dictionary -unique ${image}]
      set palette-size 0
      foreach color ${palette} {
        append data [binary format H6 ${color}]
        incr palette-size
      }   
      if { ${palette-size} < 256 } { 
        set fill [binary format H6 000000]
        append data [string repeat ${fill} [expr {256-${palette-size}}]]
      }   
    }
  }
  ```

"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
culpa qui officia deserunt mollit anim id est laborum."

