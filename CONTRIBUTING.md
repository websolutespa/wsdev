# 🔵 WsDev Contributing Guide

We're really excited that you're interested in contributing to WsDev! Before submitting your contribution, please read through the following guide. 

## Repo Setup

To develop locally, fork the WsDev repository and clone it in your local machine. The WsDev repo is a monorepo that use [Turborepo](https://turbo.build/) and npm workspaces. 
The package manager used to install and link dependencies must be [npm](https://www.npmjs.com/).

## Using this repository

### Install dependencies

```sh
npm install
```

### Develop

To develop `Liquid` app and `ws-vite` plugin run the following command:

```sh
npm run dev:liquid
```

To develop `Twig` app and `ws-vite` plugin run:

```sh
npm run dev:twig
```

To develop `ws-cli` plugin run:

```sh
cd packages/ws-cli
npm run dev create
```

in alternative you can run watch and open the cli on a secondary terminal:

```sh
npm run watch
```

```sh
npm run cli
```

### Build

To build all apps and packages run:

```sh
npm run build
```

To build `Liquid` app with `ws-vite` plugin run:

```sh
npm run build:liquid
```

To build `Twig` app with `ws-vite` plugin run:

```sh
npm run build:twig
```

### Changeset

Before committing a change to `ws-vite` or `ws-cli`, 
you should run the following command and submit a changeset:

```sh
npm run changeset
```
### ❗ Versioning & Changelogs

Before publishing a change to `ws-vite` or `ws-cli`, 
you should run the version command to update the version of the packages and update the changelogs:

```sh
npm run changeset:version
```

### ❗ Publishing

In order to publish the `ws-cli` and `ws-vite` libraries you should run the following commands:

```sh
npm run package:compile
npm run package:publish
npm run package:tags
```
