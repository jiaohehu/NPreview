Test linecap

Following tests the linecap settings

``` diagram

set fontsize 9pt
viewport  24 12

set refx 3
set refy /3
set linesize 2pt
drawline (0,0) [h:4]
set linesize
drawline (0,0) [angledist:10,4]
a := $somepoints(*,0)
b := (1,0)
c := $somepoints(*,1)
set angle-arc-radius 2
drawanglearc *a *b *c
label.ctr {10-degree} (2,-1)

set refx 10
set refy /3
set linesize 2pt
drawline (0,0) [h:4]
set linesize
drawline (0,0) [angledist:20,4]
a := $somepoints(*,0)
b := (1,0)
c := $somepoints(*,1)
set angle-arc-radius 1.5
drawanglearc *a *b *c
label.ctr {20-degree} (2,-1)

set angle-arc-radius

set refx 17
set refy /3
set linesize 2pt
drawline (0,0) [h:4]
set linesize
drawline (0,0) [angledist:45,3]
a := $somepoints(*,0)
b := (1,0)
c := $somepoints(*,1)
drawanglearc *a *b *c
label.ctr {45-degree} (2,-1)


set refx 3
set refy /9
set linesize 2pt
drawline (0,0) [h:4]
set linesize
drawline (0,0) [angledist:90,3]
a := $somepoints(*,0)
b := (1,0)
c := $somepoints(*,1)
drawanglearc *a *b *c
label.ctr {90-degree} (2,-1)

set refx 10
set refy /9
set linesize 2pt
drawline (0,0) [h:4]
set linesize
drawline (0,0) [angledist:120,3]
a := $somepoints(*,0)
b := (1,0)
c := $somepoints(*,1)
drawanglearc *a *b *c
label.ctr {120-degree} (2,-1)


set refx 17
set refy /9
set linesize 2pt
drawline (0,0) [h:4]
set linesize
drawline (0,0) [angledist:180,1]
label.ctr {180-degree} (2,-1)
drawanglearc (0,0) (1,0) (-1,0)

```


