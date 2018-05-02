# Demo for ember engine/addon dependency conflicts

```
cd demo-external-engine
npm install
npm link

cd demo-external-engine-two
npm install
npm link

cd host-app/lib/demo-in-repo-engine
npm install

cd host-app/lib/demo-in-repo-engine-two
npm install

cd host-app/lib/demo-in-repo-lazy-engine
npm install

cd host-app
npm link demo-external-engine
npm link demo-external-engine-two
npm install

ember s
```

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
