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

  ~~~longtable{n:5;fr:1 2 2 6 4}
  (&) No.
  (&) Name
  (&) Symbol
  (&) Quantity
  (&) Equivalents
  ---
  (&) 1
  (&) hertz
  (&) Hz
  (&) frequency
  (&) 1/s
  ---
  (&) 2
  (&) radian
  (&) rad
  (&) angle
  (&) m/m
  ---
  (&) 3
  (&) steradian
  (&) sr
  (&) solid angle
  (&) m²/m²
  ---
  (&) 4
  (&) newton
  (&) N
  (&) force, weight
  (&) kg·m/s²
  ---
  (&) 5
  (&) pascal
  (&) Pa
  (&) pressure, stress
  (&) N/m²
  ---
  (&) 6
  (&) joule
  (&) J
  (&) energy, work, heat
  (&) m·N
  ---
  (&) 7
  (&) watt
  (&) W
  (&) power, radiant flux
  (&) J/s, V·A
  ---
  (&) 8
  (&) coulomb
  (&) C
  (&) electric charge or quantity of electricity
  (&) s·A, F·V
  ---
  (&) 9
  (&) volt
  (&) V
  (&) voltage, electrical potential difference, electromotive force
  (&) W/A, J/C
  ---
  (&) 10
  (&) farad
  (&) F
  (&) capacitance
  (&) C/V, s/Ω
  ---
  (&) 11
  (&) ohm
  (&) Ω
  (&) electrical resistance, impedance, reactance
  (&) 1/S, V/A
  ---
  (&) 12
  (&) siemens
  (&) S
  (&) electrical conductance
  (&) 1/Ω, A/V
  ---
  (&) 13
  (&) weber
  (&) Wb
  (&) magnetic flux
  (&) J/A, T·m²
  ---
  (&) 14
  (&) tesla
  (&) T
  (&) magnetic induction, magnetic flux density
  (&) V·s/m², Wb/m², N/(A·m)
  ---
  (&) 15
  (&) henry
  (&) H
  (&) inductance
  (&) V·s/A, Ω·s, Wb/A
  ---
  (&) 16
  (&) degree Celsuis
  (&) ℃
  (&) temperature relative to 273.15 K
  (&) K
  ---
  (&) 17
  (&) lumen
  (&) lm
  (&) luminous flux
  (&) cd·sr
  ---
  (&) 18
  (&) lux
  (&) lx
  (&) illuminance
  (&) lm/m²
  ---
  (&) 19
  (&) becquerel
  (&) Bq
  (&) radioactivity
  (&) 1/s
  ---
  (&) 20
  (&) gray
  (&) Gy
  (&) absorbed dose (of ionizing radiation)
  (&) J/kg
  ---
  (&) 21
  (&) sievert
  (&) Sv
  (&) equivalent dose (of ionizing radiation)
  (&) J/kg
  ---
  (&) 22
  (&) katal
  (&) kat
  (&) catalytic activity
  (&) mol/s
  ~~~



