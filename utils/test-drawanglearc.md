Test drawanglearc

This test drawanglearc

``` diagram
viewport 32 30
set font-size 7pt

% 90-degree angle
drawline (28,4)--(31,4)
a/b := *
drawline (28,4)--(28,7)
/c := *
drawanglearc.sq *a *b *c

% 45-degree angle
drawline <0,-4> (28,4)--(31,4)
a/b := *
drawline <0,-4> (28,4)--(31,7)
/c := *
drawanglearc *a *b *c

% 90-degree angle
drawline (18,4)--(21,4)
a/b := *
drawline (18,4)--(18,7)
/c := *
drawanglearc.sq {``\theta``} *a *b *c

% 45-degree angle
drawline <0,-4> (18,4)--(21,4)
a/b := *
drawline <0,-4> (18,4)--(21,7)
/c := *
drawanglearc {``\theta``} *a *b *c

```
