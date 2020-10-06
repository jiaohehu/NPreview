---
title: test-float.md
---


# Equations

@ Equation

  ```math
  P( \mathcal{A} ) &= \frac { P( \mathcal{A} \mathcal{B} ) }{ P( \mathcal{B} ) } \\
       &= \frac {  n_{\mathcal{A} \mathcal{B}} / n } {  n_{\mathcal{B}} / n }  \\
       &= \frac {  n_{\mathcal{A} \mathcal{B}} }{  n_{\mathcal{B}} } \\
  ```

@ Equation

  ```math
  P( \mathcal{B} ) = \frac {  n_{\mathcal{B}} }{ n }
  ```

@ Equation

  ```math
  P( \mathcal{A} \mathcal{B} ) = \frac {  n_{\mathcal{A} \mathcal{B}} }{ n }
  ```


# Figures

@ Figure &ref{fig:a} 
  These are pictures of GIMP Logos.

  ~~~{n:3}     
  &&img{src:image-gimp.jpg} One 
  &&img{src:image-gimp.jpg} Two 
  &&img{src:image-gimp.jpg} Three
  &&img{src:image-gimp.jpg} Five
  ~~~



# Table


@ Table &ref{utf8encoding}
  UTF-8 encoding table

  ```tabulate{border:1}
  Bits |Min      |Max       |Byte-1   |Byte-2   |Byte-3
  -----|---------|----------|---------|---------|---------
  7    |U+0000   |U+007F    |0xxxxxxx |         |
  11   |U+0080   |U+07FF    |110xxxxx |10xxxxxx |
  16   |U+0800   |U+FFFF    |1110xxxx |10xxxxxx |10xxxxxx
  -----|---------|----------|---------|---------|---------
  ```



# Longtable

@ Table &ref{tbl:some-si-derived-units}
  Twenty-two SI derived units.

  ~~~longtable{border:1;n:5;fr:1 2 2 6 4}
  > No.
  > Name
  > Symbol
  > Quantity
  > Equivalents

  > 1
  > hertz
  > Hz
  > frequency
  > 1/s

  > 2
  > radian
  > rad
  > angle
  > m/m

  > 3
  > steradian
  > sr
  > solid angle
  > m²/m²

  > 4
  > newton
  > N
  > force, weight
  > kg·m/s²

  > 5
  > pascal
  > Pa
  > pressure, stress
  > N/m²

  > 6
  > joule
  > J
  > energy, work, heat
  > m·N

  > 7
  > watt
  > W
  > power, radiant flux
  > J/s, V·A

  > 8
  > coulomb
  > C
  > electric charge or quantity of electricity
  > s·A, F·V

  > 9
  > volt
  > V
  > voltage, electrical potential difference, electromotive force
  > W/A, J/C

  > 10
  > farad
  > F
  > capacitance
  > C/V, s/Ω

  > 11
  > ohm
  > Ω
  > electrical resistance, impedance, reactance
  > 1/S, V/A

  > 12
  > siemens
  > S
  > electrical conductance
  > 1/Ω, A/V

  > 13
  > weber
  > Wb
  > magnetic flux
  > J/A, T·m²

  > 14
  > tesla
  > T
  > magnetic induction, magnetic flux density
  > V·s/m², Wb/m², N/(A·m)

  > 15
  > henry
  > H
  > inductance
  > V·s/A, Ω·s, Wb/A

  > 16
  > degree Celsuis
  > ℃
  > temperature relative to 273.15 K
  > K

  > 17
  > lumen
  > lm
  > luminous flux
  > cd·sr

  > 18
  > lux
  > lx
  > illuminance
  > lm/m²

  > 19
  > becquerel
  > Bq
  > radioactivity
  > 1/s

  > 20
  > gray
  > Gy
  > absorbed dose (of ionizing radiation)
  > J/kg

  > 21
  > sievert
  > Sv
  > equivalent dose (of ionizing radiation)
  > J/kg

  > 22
  > katal
  > kat
  > catalytic activity
  > mol/s
  ~~~


# Listing

@ Listing &ref{lst:one-variable-ex-1}
  Octave program for Example 1

  # define fx and g1x
  fx = @(x) poisspdf(x, n*p);
  g1x = @(x) 5;
  # define root x1
  x1 = @(y) y/5;
  # define fy
  fy = @(y) fx(x1(y))/abs(g1x(x1(y)));
  # define n and p
  n = 1000
  p = 0.05
  # define input range
  x = linspace(0,n,n+1);
  y = x;
  # generate plot
  figure;
  hold on;
  plot(x, arrayfun(fx,x));
  plot(y, arrayfun(fy,y), "1");
  hold off;
  print -dpng "-S640,480" plot.png



# Vocabulary

@ Vocabulary

  * 芸術・げいじゅつ      the arts;
  * 美術・びじゅつ        the arts; the fine arts;
  * 鑑賞・かんしょう      the appreciation (of art,
                          music, poetry, etc.);
  * 劇場・げきじょう      a theatre; a playhouse;
  * 文学・ぶんがく        literature
  * 絵画・かいが          painting; picture;
  * 演劇・えんげき        drama; theatre; theater play;
  * 絵画館・かいがかん    art or picture gallery;
  * 詩・し                poetry;
  * 漫画・まんが          cartoon; comic; comic strip;
  * 芝居・しばい          a play; a drama; an acting in a theatre
  * 美術館・びじゅつかん  an art gallery
  * 歌・うた              a song;
  * 写真・しゃしん        a photo
  * 映画館・えいがかん    a movie theatre
  * 博物館・はくぶつかん  a museum;
  * 物語・ものがたり　    a tale; a story; a legend;
  * 音楽・おんがく        the music
  * 展覧会・てんらんかい  an exhibition;
  * 小説・しょうせつ      a novel; a short story;
  * 演奏・えんそう        a musical performance;
  * コンサート            a concert;
  * 評論・ひょうろん      a criticism; a critique;


