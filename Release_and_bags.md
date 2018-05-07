## Release notes

### Future

  - fumiposAPI
    - Layering data sets, which are passed to plot methods as array: [dataframe0,dataframe1,...]
  - DOM 
    - Multiple reading data set files, append, remove them
    - Toggle data set layer in each diagram

### 2017.7.14

  - fumiposAPI.v4
    -  Method for get extent of data sets are extended

### 2017.7.12

  - fumiposAPI.v4
    - Prepare for layering multiple data sets
      - Class of elements "circle" and "path" are extended as "circle.Binary.L${l}D{id}.~" and "path.Abundance.L${l}D{id}.~. Variable l indicates index of data set. 
      - Layer plot for multiple data sets
  - DOM 
    - Multiple read files >> store array [df0, df1,...]


  - fumiposAPI.v3
    - All known bags are fixed
      - All hide, all show button works
      - Changing data sets and operand files works
      - Abundance diagrams can be saved as png file

## Bag reports
