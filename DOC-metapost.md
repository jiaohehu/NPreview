# Metapost

    
    \documentclass{article}
    \usepackage{graphicx}
    \usepackage{luamplib}
    \begin{document}
    \begin{mplibcode}
    transform pagecoords;
    %%%pagecoords:=identity scaled 4mm shifted (0mm,0mm);
    myscale:=\mpdim{\linewidth}/25;
    pagecoords:=identity scaled (\mpdim{\linewidth}/25) shifted (0mm,0mm);
    beginfig (1)
        %%fill ((0,0)--(2,0)--(2,1)--(1,1)--(1,2)--(0,2)--cycle) transformed pagecoords withcolor green;
        %%draw ((2,0)..(2,1)..(1,1)..(1,2)..(0,2)) transformed pagecoords;

        %%% draw grid lines
        for i=0 upto 10:
          draw (0,i) transformed pagecoords --- (25,i) transformed pagecoords withcolor .8white;
        endfor
        for i=0 upto 25:
          draw (i,0) transformed pagecoords --- (i,10) transformed pagecoords withcolor .8white;
        endfor

        %%% draw a circle
        draw fullcircle shifted(12,5) transformed pagecoords;

        %%% draw a line the length of the pagewidth
        %draw origin--(\mpdim{\linewidth},0) withpen pencircle;
        draw origin---(25,0) transformed pagecoords withpen pencircle ;

        %%% fill a circle
        fill fullcircle shifted(14,5) transformed pagecoords withcolor .8[red,white];

        %%% draw a square, unitsquare without shifted occupy the area that is ((0,0),(1,1))
        draw unitsquare shifted(12,3) transformed pagecoords;

        %%% fill a square, unitsquare without shifted occupy the area that is ((0,0),(1,1))
        fill unitsquare shifted(14,3) transformed pagecoords withcolor .8[red,white];

        %%% fill a rectangle that is 2-by-1
        fill unitsquare xscaled(2) shifted(17,3) transformed pagecoords withcolor .8[red,white];
        draw unitsquare xscaled(2) shifted(17,3) transformed pagecoords ;

        %%drawarrow ((0,0)--(2,2)) transformed pagecoords;
        %% label suffix => lft | rt | top | bot | ulft | urt | llft | lrt
        %%label.lrt (btex $z_0$ etex, (1,1) transformed pagecoords) ; %% the lower right z0
        %%label.llft (btex $z_1$ etex, (1,1) transformed pagecoords) ; %% the lower left z1
        %%label.urt (btex $z_2$ etex, (1,1) transformed pagecoords) ; %% the upper right z2
        %%label.ulft (btex $z_3$ etex, (1,1) transformed pagecoords); %% the upper left z3
        %%label.top (btex $z_4$ etex, (1,1) transformed pagecoords); %% the top z4
        %%label.bot (btex $z_5$ etex, (1,1) transformed pagecoords); %% the bottom z5
    endfig;
    \end{mplibcode}
    \end{document}


