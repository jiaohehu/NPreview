Test linejoin

Following tests the linejoin settings

``` diagram

set fontsize 9pt
viewport  24 30
set linesize 2pt

set refx 3
set refy /3
set linejoin miter
drawline [h:4] (0,0) [angledist:10,4]
label.ctr {miter} (2,-1)

set refy /9
set linejoin miter
drawline [h:4] (0,0) [angledist:45,3]
label.ctr {miter} (2,-1)

set refy /15
set linejoin miter
drawline [h:4] (0,0) [angledist:90,3]
label.ctr {miter} (2,-1)

set refy /21
set linejoin miter
drawline [h:4] (0,0) [angledist:120,3]
label.ctr {miter} (2,-1)

set refy /27
set linejoin miter
drawline [h:4] (0,0) [angledist:180,1]
label.ctr {miter} (2,-1)

% ******* round ************

set refx 10
set refy /3
set linejoin round
drawline [h:4] (0,0) [angledist:10,4]
label.ctr {round} (2,-1)

set refy /9
set linejoin round
drawline [h:4] (0,0) [angledist:45,3]
label.ctr {round} (2,-1)

set refy /15
set linejoin round
drawline [h:4] (0,0) [angledist:90,3]
label.ctr {round} (2,-1)

set refy /21
set linejoin round
drawline [h:4] (0,0) [angledist:120,3]
label.ctr {round} (2,-1)

set refy /27
set linejoin round
drawline [h:4] (0,0) [angledist:180,1]
label.ctr {round} (2,-1)

% ******* bevel ************

set refx 17
set refy /3
set linejoin bevel
drawline [h:4] (0,0) [angledist:10,4]
label.ctr {bevel} (2,-1)

set refy /9
set linejoin bevel
drawline [h:4] (0,0) [angledist:45,3]
label.ctr {bevel} (2,-1)

set refy /15
set linejoin bevel
drawline [h:4] (0,0) [angledist:90,3]
label.ctr {bevel} (2,-1)

set refy /21
set linejoin bevel
drawline [h:4] (0,0) [angledist:120,3]
label.ctr {bevel} (2,-1)

set refy /27
set linejoin bevel
drawline [h:4] (0,0) [angledist:180,1]
label.ctr {bevel} (2,-1)

```


