(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.funcTools = factory();
  }
}(this, function () {
  const Y = f => {
    return (
      x => f(y => x(x)(y))
    )(
      x => f(y => x(x)(y))
    )
  }

  const recursive = base => a => n => base(n, a);

  const recursiveExtender = custom => templateFunc => f => templateFunc(custom(f));


  const memoize = cache => f => {
    return arg => {
      if (!(arg in cache)) {

        cache[arg] = f(arg);
      }
      return cache[arg];
    }
  };

  const trace = f => arg => {
    console.log(`called with argument ${arg}`);
    return f(arg)
  };

  const compose = (...fs) => x => fs.reduceRight((acc, f) => f(acc), x);
  const pip = (...fs) => x => fs.reduce((acc, f) => f(acc), x);

  const G = {
    take: n => function* (g) {
      for (let i = 0; i < n; i++) {
        let x = g.next();
        if (x.done) return;
        yield x.value;
      }
    },

    nest: f => function* (x) {
      let y = x;
      while (true) {
        yield y;
        y = f(y);
      }
    }
  };




  const take = n => [...Array(n)]

  const fold = f => x => (acc, e) => acc.length === 0 ? [f(x, e)] : [...acc, f(acc[acc.length - 1], e)];

  const range = (ini, fin, step = 1) => [...Array(Math.ceil((fin - ini) / step))].map((_, i) => ini + step * i);

  const spread = (...objs) => [...objs].reduce((a, b) => Object.assign(a, b), {});

  const transduce = (compose => {
    const mapping = f => reducer => (acc, e) => reducer(acc, f(e));
    const filtering = f => reducer => (acc, e) =>
      !f(e)
        ? acc
        : reducer(acc, e);
    const folding = f => x => reducer => (acc, e) =>
      acc.length === 0
        ? reducer(acc, f(x, e))
        : reducer(acc, f(acc[acc.length - 1], e));
    const taking = n => reducer => (acc, e) =>
      acc.length < n
        ? reducer(acc, e)
        : reducer(acc, undefined);
    const concatReducer = (acc, e) =>
      e || e === 0
        ? [...acc, e]
        : [...acc];

    const _intoArray = ts => xs => xs.reduce(ts(concatReducer), []);
    const intoArray = (...fs) => xs => xs.reduce(compose(...fs)(concatReducer), []);


    return {
      mapping,
      filtering,
      folding,
      taking,
      intoArray,
      _intoArray
    }
  })(compose)

  const statefullTransducer = (({ mapping, filtering }, compose) => {
    const indexing = ini => mapping(e => [ini++, e])

    const slicing = (m, n) => compose(
      indexing(0),
      filtering(([i, e]) => m <= i && i < n),
      mapping(([i, e]) => e)
    );

    return {
      indexing,
      slicing
    }
  })(transduce, compose)


  const zipWith = f => xs => ys =>
    xs.length < ys.length ? xs.map((e, i) => f(e, ys[i])) : ys.map((e, i) => f(xs[i], e));

  const zip = xs => ys =>
    xs.length < ys.length ? xs.map((e, i) => [e, ys[i]]) : ys.map((e, i) => [xs[i], e]);

  const zips = (...arr) =>
    transduce._intoArray(
      transduce.mapping(i => arr.map(a => a[i]))
    )(range(0, Math.min(...arr.map(a => a.length))));

  const Dataframe = (({
    intoArray, mapping, _intoArray
  }, zips, spread) => {

    const toDataframe = entries => {
      //console.log(entries);
      const keys = Object.keys(entries[0]);
      return spread(...keys.map(k => ({ [k]: _intoArray(mapping(e => e[k]))(entries) })))
    }

    const toEntries = df => {
      const keys = Object.keys(df);
      return _intoArray(
        mapping(
          values => _intoArray(
            mapping(([k, v]) => ({ [k]: v }))
          )(zips(keys, values))
            .reduce((a, b) => Object.assign(a, b), {})
        )
      )(zips(...Object.values(df)))
    }


    const _intoDataframe = ts => df => toDataframe(
      _intoArray(ts)(toEntries(df))
    )

    const intoDataframe = (...fs) => df => toDataframe(
      intoArray(...fs)(toEntries(df))
    )

    const mapEntries = f => mapping(e => Object.assign(e, f(e)))

    const table = df => console.table(toEntries(df))
    return {
      toDataframe,
      intoDataframe,
      _intoDataframe,
      mapEntries,
      toEntries,
      table
    }
  })(transduce, zips, spread);



  const tee = f => a => {
    f(a);
    return a;
  }

  return {
    Y,
    recursive,
    recursiveExtender,
    memoize,
    trace,
    compose,
    pip,
    G,
    zipWith,
    zip,
    zips,
    fold,
    range,
    spread,
    take,
    transduce,
    statefullTransducer,
    Dataframe,
    tee
  };
}))