# Feasibility of statically checking JavaScript code compatibility with target runtime environments

## Questions

### Will this program work there?

(similar: where will this program work?)

It's important to know if it'll work in your targeted browsers/runtimes, and useful to be able to check that quickly and automatically.

Language features are only part of the answer; other features such as APIs and CSS must also be considered. For those, see [eslint-plugin-compat](https://github.com/amilajack/eslint-plugin-compat), [doiuse](https://github.com/anandthakker/doiuse), and polyfills.

### Will this code work there language-wise?

This can be answered with reasonable confidence, but it's not possible to be definitive.

Because JavaScript is untyped, usage of some features isn't directly detectable through static analysis. Some of them (prototype methods) can however be reliably detected if we accept some risk of false detections: the expression `foo.description` may or may not be an usage of the ES2019 feature `Symbol.prototype.description` - it depends on whether or not the value of `foo` is a `Symbol` at runtime.

The more risk of false detections we take, the more definitive our "yes" answer becomes, and the less definitive our "no" answer becomes. And vice versa.

Given a "no" answer, you can always stop using the unsupported features or introduce transpilation. In the case of non-syntax features, you also have the option of polyfilling them.

### How could this code be made more widely compatible?

It'd be useful to know if some compromise on features would allow older runtime versions to be supported.

Once all features used are detected, it's an algorithm against the compatibility data to come up with some suggestions.

## Classes of language features

| Class             | Example                | Static detectability          | Polyfillable |
| ----------------- | ---------------------- | ----------------------------- | ------------ |
| Syntax-related    | `{ ...obj }`           | Reliable                      | No           |
| Built-in objects  | `Set`                  | Reliable in practice          | Yes          |
| Static methods    | `Object.fromEntries`   | Reliable in practice          | Yes          |
| Prototype members | `Array.prototype.flat` | Reliable with false positives | Yes          |
| Others            | Stable array `sort()`  | No                            |

"Reliable in practice" is because it's poor practice to define custom types with the same names as built-ins.

Note that features may belong to multiple classes; see the ES2020 built-in `BigInt` which has literal syntax.

## Compatibility data sources

The best source of language feature compatibility data is MDN's [mdn-browser-compat-data](https://github.com/mdn/browser-compat-data).

It's the data behind the [compatibility tables](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax#Browser_compatibility) in the MDN JavaScript reference. It's also used by [caniuse.com](https://caniuse.com) to supplement its own dataset when it comes to language features. Coverage extends to 15 browsers (including mobile variants) and Node.js. Taking an example ES2018 feature (object rest/spread), it had data for all but the most obscure 4 of those.

Another widely known data source is [kangax/compat-table](https://github.com/kangax/compat-table). Coverage is much lower; fewer browsers are included, and for our example ES2018 feature it only had data for 5 browsers (all of them desktop). It does however include various transpilers and non-browser runtimes.

### Joining mdn-browser-compat-data to browserslist

The major browsers are in both; their desktop variants by the same names, and the mobile ones by differing names. More obscure browsers are missing from one or both. Electron information is indirectly available in the MDN data through the presence of Chrome data.
