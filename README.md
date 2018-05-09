# Demo for ember host-app/engine/addon dependency conflicts

Unfortunately, it's easy to run into host-app/engine/addon dependency conflicts and  [ember-cli-dependency-lint](https://github.com/salsify/ember-cli-dependency-lint) is a tool that can help you discover them.

## Motivation

An ember engine defines its dependencies via npm the same as its host application, but an engine has a unique build process. At engine build time it's possible for different conflicting versions of an addon to appear in the dependency tree of the host application, or that one version might unpredictably win at the cost of another. Both of these scenarios may cause unexpected behavior at runtime.

**Eager engines**

Eagerly loaded engine dependencies are built into the host application's `/dist/vendor.js` file and deduplicated along side its own dependencies. You can be sure there will be only one version of an addon here, but possibly unsure as to which one.

**Lazy engines**

Lazily loaded engine dependencies are a bit more complicated. They are built into `/dist/engines-dist/${ENGINE_NAME}/engine-vendor.js` where no deduplication occurs with the host application's dependencies. It's possible that an addon built here already exists in the host app's `/dist/vendor.js` file. In that case, which version of an addon gets executed depends on when that addon's module was `required` at runtime.

## Demo

![Screenshot](/host-app/public/screenshot.png?raw=true "Optional Title")

In this demo a host app and its multiple engines each declare a dependency on a unique version of `conflictable-addon`, the versions of which are 1.0.0, 1.1.0, 1.2.0, 1.3.0 & 1.4.0.

Conflictable-addon's only job is to expose a helper called `{{addon-version}}` that returns a string with the current version of the addon. For example: "using conflictable-addon v1.2.0"

This demo builds without error.

## Installation

```
cd demo-external-engine
npm install

cd demo-external-engine-two
npm install

cd host-app/lib/demo-in-repo-engine
npm install

cd host-app/lib/demo-in-repo-engine-two
npm install

cd host-app/lib/demo-in-repo-lazy-engine
npm install

cd host-app
npm install

ember serve
```

## Discoveries

### Conflict #1

Our host-app depends on **conflictable-addon v1.0.0**, but **v1.2.0** is what gets bundled into `/dist/vendor.js`. Why? Well, eager engine dependencies are deduped along side the dependencies of their host application. In this case we load two in-repo eager engines called **demo-in-repo-engine** and **demo-in-repo-engine-two**, which each depend on **v1.1.0** and **v1.2.0** of conflictable-addon respectively.

The last eager in-repo engine's **conflictable-addon** dependency specified in `package.json` is the one that will get bundled into `/dist/vendor.js`. We currently observe the result of ...

```
  "ember-addon": {
    "paths": [
      "lib/demo-in-repo-engine",
      "lib/demo-in-repo-engine-two",
      "lib/demo-in-repo-lazy-engine"
    ]
  }
```

... but if we modify `package.json` so that **demo-in-repo-engine** is last like so ...

```
  "ember-addon": {
    "paths": [
      "lib/demo-in-repo-engine-two",
      "lib/demo-in-repo-engine",
      "lib/demo-in-repo-lazy-engine"
    ]
  }
```

... then **v1.1.0** is what will be bundled into `/dist/vendor.js`.

### Conflict #2

Because lazy engine dependencies are built separately and not deduped with dependencies in the host-app it's possible that there will be duplication between assets built into `/dist/vendor.js` and `/dist/engines-dist/${ENGINE_NAME}/engine-vendor.js`.

Our host-app declares a dependency on **conflictable-addon v1.0.0**. Setting aside what we learned about eager engines in **Conflict #1** above, **v1.3.0** is what's bundled into `/dist/engines-dist/demo-in-repo-lazy-engine/engine-vendor.js` because that's what **demo-in-repo-lazy-engine** specifically depends on.

Fire up http://localhost:4200/ and our demo lets us know we're "using conflictable-addon v1.2.0". Navigate to http://localhost:4200/demo-in-repo-lazy-engine and it still thinks we're using **v1.2.0**. However, do a full refresh of your browser while on http://localhost:4200/demo-in-repo-lazy-engine and you'll see it's now "using conflictable-addon v1.3.0".

The first time we call  **conflictable-addon's** `{{addon-version}}` helper whichever version of the module is defined currently will be cached and used for subsequent requests for that module.

### Conflict #3

External engines, those not in-repo, behave differently as well. In our demo both **demo-external-engine** and **demo-external-engine-two** depend on **conflictable-addon v1.4.0** which is nowhere in the final build.

## Ember dependency lint

[Ember dependency lint](https://github.com/salsify/ember-cli-dependency-lint) is currently the best tool for finding these dependency conflicts. You can check for conflicts manually via command-line or make use of its generated tests for detecting conflicts every time you run your test suite.

## Example output

Running dependency-lint inside our demo app, we can see the thoroughness of its reports.

Example output from command-line:

```
➜  host-app git:(master) ✗ ember dependency-lint
conflictable-addon
Allowed: (any single version)
Found: 1.4.0, 1.0.0, 1.1.0, 1.2.0, 1.3.0
host-app
├── conflictable-addon@1.0.0
├─┬ demo-external-engine
│ └── conflictable-addon@1.4.0
├─┬ demo-external-engine-two
│ └── conflictable-addon@1.4.0
├─┬ demo-in-repo-engine
│ └── conflictable-addon@1.1.0
├─┬ demo-in-repo-engine-two
│ └── conflictable-addon@1.2.0
└─┬ demo-in-repo-lazy-engine
  └── conflictable-addon@1.3.0

➜  host-app git:(master) ✗
```

Example output from test cases:

```
not ok 15 Chrome 66.0 - DependencyLint: conflictable-addon
    ---
        actual: >
            false
        expected: >
            true
        stack: >
                at Object.<anonymous> (http://localhost:7357/assets/tests.js:44:12)
                at runTest (http://localhost:7357/assets/test-support.js:4199:30)
                at Test.run (http://localhost:7357/assets/test-support.js:4185:6)
                at http://localhost:7357/assets/test-support.js:4397:12
                at advanceTaskQueue (http://localhost:7357/assets/test-support.js:3798:6)
                at advance (http://localhost:7357/assets/test-support.js:3779:4)
        message: >
            Expected only one version of conflictable-addon, but found
            host-app
            ├── conflictable-addon@1.0.0
            ├─┬ demo-external-engine
            │ └── conflictable-addon@1.4.0
            ├─┬ demo-external-engine-two
            │ └── conflictable-addon@1.4.0
            ├─┬ demo-in-repo-engine
            │ └── conflictable-addon@1.1.0
            ├─┬ demo-in-repo-engine-two
            │ └── conflictable-addon@1.2.0
            └─┬ demo-in-repo-lazy-engine
              └── conflictable-addon@1.3.0

        Log: |
    ...
```
