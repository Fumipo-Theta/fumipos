# FUMIPOS

## Developer's guide

```
\- app
    \- uiState
        - data (DataframeEntries)
        - refData (DataframeEntries)
        - symbol
        - styleClass
    \- emitter
    \- TopMenu
    \- GraphAppender
        \- GraphManager
            \- Graph
                .initialize(uiState)
                .update(uiState)
```

### Graph class

Override some instance methods

* replot
