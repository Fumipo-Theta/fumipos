# FUMIPOS

Auther: Fumipo-Theta
Current version: 3.0

[FUMIPOS app page](https://fumipo-theta.github.io/fumipos/)

## Abstruct

Webブラウザ上で動作するインタラクティブな散布図作成アプリケーション.
散布図間で対応するデータを強調表示し, 多次元データの理解を助ける.

![Overview of the application](image/2019-07-19-14-59-12.png)

![Highlighiting corresponding points](image/2019-07-19-14-54-58.png)

x軸とy軸の指定にはそれぞれ数式を用いることができる. 数式の中に表データの列名を用いると, 表データの各行に数式が適用されプロットされる.

![Plot settings](image/2019-07-19-14-56-54.png)

上図の例では, x軸には表の`SiO2`列の値が用いられる. そしてy軸には表の各行の`FeO`列と`MgO`列の値から `FeO / MgO × 40.32 / 71.84` が計算されてプロットされる.
