# manypkg

> **Note**: This is some ideas, it doesn't actually exist yet

`manypkg` is a CLI to make working in multi-package repos easier based on some of my experiences working in multi-package repos, conversations with other people and lots of learnings from `bolt` and `bolt-check`.

## Install

```
yarn add @manypkg/cli
```

## Usage

### In the root of a multi-package repo

```
yarn m init
```

```
yarn m check-repo
```

```
yarn m <pkgName> <scriptName>
```

```
yarn m <binaryFromNodeModulesName>
```

```
yarn m add <pkgName> <depDescriptor>
```

### In a package

```
yarn m <scriptName>
```

```
yarn m <binaryFromNodeModulesName>
```

```
yarn m add <depDescriptor>
```
