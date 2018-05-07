# FUMIPOS

Auther: Fumipo Theta
Current version: 2.0

## 概要
d3.js (v3) を用いたsvgベースのインタラクティブな散布図作成アプリケーション. 

## 構成
```
/jslib
	jquery
	jquery-ui
	d3.js
	
/multiCrystallization
	/js
		multiCrystalization_v3.1.js

/fumipos
	/css
		fumipos_plot.css
	/data
	/js
		fumiposAPI.v2.js
	
	fumipos_multiple_plot.html
	form_abundance.html
	form_Binary.html
	form_legend.html
	form_main_file.html
	form_simulate.html
	form_symbol.html
	fumipos_footer.html
```

## 技術
- プロットデータフォーマットはcsvとし, それをオブジェクトに変換している.
- d3.jsを通じてデータをsvg要素にバインドしている.
- 設定ファイルを用意することで自動的にプロットできるモードも備えている.