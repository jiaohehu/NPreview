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

## Scaling in ConTEXT

For ConTEXT you can scale the entire drawing

    \scale[width=\textwidth]{
      \startMPcode
        draw (0,0)--(100,0)--(100,100)--(0,100)--(0,0);
      \stopMPcode
    }

Or you can just scale the units:

    \showframe
    \starttext
    \startMPcode
        pickup pencircle scaled .5bp ; % defaultpen
        numeric u ; u := (\the\textwidth - .5bp)/1400 ;
        for i = 0 upto 13:
            label(decimal i, ((i + .5) * 100u, 50u)) ;
            draw unitsquare scaled (100u) xshifted (i*100u) ;
        endfor ;
    \stopMPcode
    \stoptext

## Processing with mpost program

You can run the program 'mpost' to process a 'myfile.mp' file such as the
following:

    outputtemplate := "%j-%c.svg";
    outputformat   := "svg";
    beginfig (1);
      % draw a line
      draw (1cm,2cm) -- (3cm,5cm);
    endfig;
    end.

The command line will look like:

    mpost myfile.mp

This will produce a file named 'myfile-1.svg'. The '1' corresponds to the
`beginfig(1)` in the MP file. The top two lines specifies that it should
generate a SVG output instead. And the first line changes the output file
naming so that the output file will be saved as `myfile-1.svg`. 

Without these two lines the output is a PS file, and the PS file is saved
under the name of `myfile.1`.


