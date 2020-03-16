Test equation

This is `math` block with alignequalsign

.alignequalsign 1
```math

x = \operatorname{min}_{a,b,c}
  \frac{1}{2}\mathbf{w}^{T}\mathbf{w} + C \sum_{i=1}^{l}\xi_{i}

y =  y_{i}\left(\mathbf{w}^{T}\phi(x_{i})+b\right)
```

This is `math` block without alignequalsign


```math

x = \operatorname{min}_{a,b,c}
  \frac{1}{2}\mathbf{w}^{T}\mathbf{w} + C \sum_{i=1}^{l}\xi_{i}

y =  y_{i}\left(\mathbf{w}^{T}\phi(x_{i})+b\right)
```



This is `equation` block

```equation

 \operatorname{min}_{a,b,c}
  \frac{1}{2}\mathbf{w}^{T}\mathbf{w} + C \sum_{i=1}^{l}\xi_{i}

  y_{i}\left(\mathbf{w}^{T}\phi(x_{i})+b\right)
```

This is `subequations` block

```subequations

 \operatorname{min}_{a,b,c}
  \frac{1}{2}\mathbf{w}^{T}\mathbf{w} + C \sum_{i=1}^{l}\xi_{i}

  y_{i}\left(\mathbf{w}^{T}\phi(x_{i})+b\right)
```

This is `equations` block with .alignequalsign option set

.alignequalsign 1
```equations

 x = \operatorname{min}_{a,b,c}
  \frac{1}{2}\mathbf{w}^{T}\mathbf{w} + C \sum_{i=1}^{l}\xi_{i}

 y = y_{i}\left(\mathbf{w}^{T}\phi(x_{i})+b\right)
```

This is `equations` block without .alignequalsign option

```equations

x  = \operatorname{min}_{a,b,c}
  \frac{1}{2}\mathbf{w}^{T}\mathbf{w} + C \sum_{i=1}^{l}\xi_{i}

y =  y_{i}\left(\mathbf{w}^{T}\phi(x_{i})+b\right)
```

This is `multline` block


```multline*

x  = \operatorname{min}_{a,b,c}\\
  \frac{1}{2}\mathbf{w}^{T}\mathbf{w} + C \sum_{i=1}^{l}\xi_{i}\\
y =  y_{i}\left(\mathbf{w}^{T}\phi(x_{i})+b\right)
```

This is another multiline*

```multline*
\operatorname{min}_{a,b,c}\\
  \frac{1}{2}\mathbf{w}^{T}\mathbf{w} + 
  \frac{1}{2}\mathbf{w}^{T}\mathbf{w} + 
  C \sum_{i=1}^{l}\xi_{i}\\
y =  y_{i}\left(\mathbf{w}^{T}\phi(x_{i})+b\right)\\

\operatorname{min}_{a,b,c}\\
  \frac{1}{2}\mathbf{w}^{T}\mathbf{w} + C \sum_{i=1}^{l}\xi_{i}\\
y =  y_{i}\left(\mathbf{w}^{T}\phi(x_{i})+b\right)\\


```
