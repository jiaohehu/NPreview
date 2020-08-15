

@ Diagram 

  viewport  25 12
  set refx 3
  set refy /3
  set linesize 2pt
  draw {linesize:2} (0,0) [h:4]
  set linesize
  path all = (0,0) [angledist:10,4]
  draw &all
  path a = &somepoints(all,0)
  path b = (1,0)
  path c = &somepoints(all,1)
  set angle-arc-radius 2
  %drawanglearc &a &b &c
  drawanglearc &b &a &c
  label.ctr "10°" (2,-1)

  set refx 10
  set refy /3
  set linesize 2pt
  draw {linesize:2} (0,0) [h:4]
  set linesize
  path all = (0,0) [angledist:20,4]
  draw &all
  path a = &somepoints(all,0)
  path b = (1,0)
  path c = &somepoints(all,1)
  set angle-arc-radius 1.5
  %drawanglearc &a &b &c
  drawanglearc &b &a &c
  label.ctr "20°" (2,-1)

  set angle-arc-radius

  set refx 17
  set refy /3
  set linesize 2pt
  draw {linesize:2} (0,0) [h:4]
  set linesize
  path all = (0,0) [angledist:45,3]
  draw &all
  path a = &somepoints(all,0)
  path b = (1,0)
  path c = &somepoints(all,1)
  %drawanglearc &a &b &c
  drawanglearc &b &a &c
  label.ctr "45°" (2,-1)

  set refx 3
  set refy /9
  set linesize 2pt
  draw {linesize:2} (0,0) [h:4]
  set linesize
  path all = (0,0) [angledist:90,3]
  draw &all
  path a = &somepoints(all,0)
  path b = (1,0)
  path c = &somepoints(all,1)
  %drawanglearc.sq &a &b &c
  drawanglearc.sq &b &a &c
  label.ctr "90°" (2,-1)

  set refx 10
  set refy /9
  set linesize 2pt
  draw {linesize:2} (0,0) [h:4]
  set linesize
  path all = (0,0) [angledist:120,3]
  draw &all
  path a = &somepoints(all,0)
  path b = (1,0)
  path c = &somepoints(all,1)
  %drawanglearc &a &b &c
  drawanglearc &b &a &c
  label.ctr "120°" (2,-1)

  set refx 17
  set refy /9
  set linesize 2pt
  draw {linesize:2} (0,0) [h:4]
  set linesize
  draw (0,0) [angledist:180,1]
  label.ctr "180°" (2,-1)
  %drawanglearc (0,0) (1,0) (-1,0)
  drawanglearc (1,0) (0,0) (-1,0)

