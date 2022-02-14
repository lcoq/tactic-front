# Tactic-front

This README outlines the details of collaborating on this Ember application.
A short introduction of this app could easily go here.

## Setup

Notice the Ember server starts on port `4200`.

### Package issues

There are some issues with packages which rely on some package versions that are using ES6 features :

- `ember-cli-moment-shim` which rely on `broccoli-stew ^1.0.0`, but needs to be manually fixed to `=1.0.0`
- `ember-cli/node_modules/broccoli-concat` => `fast-sourcemap-concat": "=1.0.1"`

After global `npm i`, update each `package.json` file in `node_modules` for packages above by fixing the required version.
As an example :

```
$ cd node_modules/ember-cli-moment-shim
$ # replace version in package.json
$ npm i
```

### Node Sass issue

If you have the following error:

> Error: Node Sass does not yet support your current environment: Linux 64-bit with Unsupported runtime (83)

You may have to rebuild or install it through one of the following command :

```
$ npm i node-sass@4.14.1
$ npm rebuild node-sass --unsafe-perm node-sass
```

You may also have to rebuild or install it in nested npm packages if the errors does not come directly from `node_modules/node-sass` package.

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](http://git-scm.com/)
* [Node.js](http://nodejs.org/) (with NPM)
* [Bower](http://bower.io/)
* [Ember CLI](http://ember-cli.com/)
* [PhantomJS](http://phantomjs.org/)

## Installation

* `git clone <repository-url>` this repository
* `cd tactic-front`
* `npm install`
* `bower install`

## Running / Development

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).

### Code Generators

Make use of the many generators for code, try `ember help generate` for more details

### Running Tests

* `ember test`
* `ember test --server`

### Building

* `ember build` (development)
* `ember build --environment production` (production)

### Deploying

Specify what it takes to deploy your app.

## Further Reading / Useful Links

* [ember.js](http://emberjs.com/)
* [ember-cli](http://ember-cli.com/)
* Development Browser Extensions
  * [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  * [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)

