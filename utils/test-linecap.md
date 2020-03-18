Test linejoin

Following tests the linejoin settings

``` diagram

set fontsize 9pt
viewport  24 30
set linesize 2pt
set linejoin miter

set refx 3
set refy /3
set linecap butt
set linesize
drawline (0,0) [angledist:10,4]
set linesize 2pt
drawline [h:4] (0,0) 
label.ctr {butt} (2,-1)

set refy /9
set linecap butt
set linesize
drawline (0,0) [angledist:45,3]
set linesize 2pt
drawline [h:4] (0,0) 
label.ctr {butt} (2,-1)

set refy /15
set linecap butt
set linesize
drawline (0,0) [angledist:90,3]
set linesize 2pt
drawline [h:4] (0,0) 
label.ctr {butt} (2,-1)

set refy /21
set linecap butt
set linesize
drawline (0,0) [angledist:120,3]
set linesize 2pt
drawline [h:4] (0,0) 
label.ctr {butt} (2,-1)

set refy /27
set linecap butt
set linesize
drawline (0,0) [angledist:180,1]
set linesize 2pt
drawline [h:4] (0,0) 
label.ctr {butt} (2,-1)

% ******* round ************

set refx 10
set refy /3
set linecap round
set linesize
drawline (0,0) [angledist:10,4]
set linesize 2pt
drawline [h:4] (0,0) 
label.ctr {round} (2,-1)

set refy /9
set linecap round
set linesize
drawline (0,0) [angledist:45,3]
set linesize 2pt
drawline [h:4] (0,0) 
label.ctr {round} (2,-1)

set refy /15
set linecap round
set linesize
drawline (0,0) [angledist:90,3]
set linesize 2pt
drawline [h:4] (0,0) 
label.ctr {round} (2,-1)

set refy /21
set linecap round
set linesize
drawline (0,0) [angledist:120,3]
set linesize 2pt
drawline [h:4] (0,0) 
label.ctr {round} (2,-1)

set refy /27
set linecap round
set linesize
drawline (0,0) [angledist:180,1]
set linesize 2pt
drawline [h:4] (0,0) 
label.ctr {round} (2,-1)

% ******* square ************

set refx 17
set refy /3
set linecap square
set linesize
drawline (0,0) [angledist:10,4]
set linesize 2pt
drawline [h:4] (0,0) 
label.ctr {square} (2,-1)

set refy /9
set linecap square
set linesize
drawline (0,0) [angledist:45,3]
set linesize 2pt
drawline [h:4] (0,0) 
label.ctr {square} (2,-1)

set refy /15
set linecap square
set linesize
drawline (0,0) [angledist:90,3]
set linesize 2pt
drawline [h:4] (0,0) 
label.ctr {square} (2,-1)

set refy /21
set linecap square
set linesize
drawline (0,0) [angledist:120,3]
set linesize 2pt
drawline [h:4] (0,0) 
label.ctr {square} (2,-1)

set refy /27
set linecap square
set linesize
drawline (0,0) [angledist:180,1]
set linesize 2pt
drawline [h:4] (0,0) 
label.ctr {square} (2,-1)

```


