# Controlled actions [![Build Status](https://travis-ci.org/renancaraujo/controlled-actions.svg?branch=master)](https://travis-ci.org/renancaraujo/controlled-actions)

Controlled actions is a pack of helper classes that help you to control async routines that can be called multiple times. It is a wrapper over the Promise API.

### Installing

```
npm i -S controlled-actions
```
or
```
yarn add controlled-actions
```

### Basic usage example

In this example, `FetchImages` is an abstraction of an API call through an [axios endpoint](https://github.com/renancaraujo/axios-endpoints) and an update on a local store.

```javascript
// FetchImages.js
import { ActionFirst } from "controlled-actions"
import localStore from "./localStore"
import { imageEndpoint } from "./endpoints"

const FetchImages = new ActionFirst(
  async ({resolve, reject }) => {
    const images = await imageEndpoint.get()
    localStore.updateImages(images)
    resolve(images)
  }
)

// Somewhere_else.js
...
async componentDidMount(){
 const images = await FetchImages.execute()
 //by this line, local store is updated
}
```

## Concept

Controlled actions includes the following classes:

`Action, ActionFirst, ActionForceFirst` and `ActionLast `

Each one of those deals with concurrent calls in a different way. Let's see how they work:

#### `Action`

Starting with the simplest: `Action`. Action is wrapper around a simple asynchronous routine, here is a example:

```javascript
import { Action } from "controlled-actions"

const BringMePie = new Action(async ({resolve, reject })=>{
  const pie = await fetchPie()
  resolve(pie)
})
```

And somewhere else:

```javascript
const myPie = await BringMePie.execute();
// Number of times fetchPie has been called: 1
```

You can pass as a parameter, a payload or in this case, a `flavor`:

```javascript
import { Action } from "controlled-actions"

const BringMePie = new Action(
  async ({resolve, reject, payload: flavor })=>{
    const pie = await fetchPie(flavor)
    resolve(pie)
  }
)

const myPie = await BringMePie.execute("apple pie");
// Number of times fetchPie has been called: 1
// myPie is a "apple pie"

```

**"I can do that just with JS Promises"**.
Action alone can be considered pretty useless, but if you consider the ones who extend it, it can be a good way to standardize the application when you need special runtime features, as provided by `ActionFirst, ActionForceFirst` and `ActionLast`

#### `ActionFirst`

If you execute an ActionFirst when another call, with an equal payload that has not been resolved yet, it will hang on the ongoing Promise. 

```javascript
import { ActionFirst } from "controlled-actions"

const BringMePie = new ActionFirst(
  async ({resolve, reject, payload: flavor })=>{
    const pie = await fetchPie(flavor)
    resolve(pie)
  }
)

const myPiePromise = BringMePie.execute("apple pie");
const myPiePromise2 = BringMePie.execute("apple pie"); //Called before myPiePromise resolves

const myPie = await myPiePromise
const myPie2 = await myPiePromise2
// Number of times fetchPie has been called: 1
// Both myPie and myPie2 is the same "apple pie"

```
Pay attention to how many times fetchPie has been called.

If it is called with different payloads, it will execute concurrently:

```javascript
const myPiePromise = BringMePie.execute("apple pie");
const myPiePromise2 = BringMePie.execute("lime pie"); // Called before myPiePromise resolves, 
                                                      // but with different payloads

const myPie = await myPiePromise
const myPie2 = await myPiePromise2
// Number of times fetchPie has been called: 2
// myPie is a "apple pie"
// myPie1 is a "lime pie"
```

### `ActionForceFirst`

`ActionForceFirst` works just like `ActionFirst`. Except it does not evaluates equal payloads.

```javascript
import { ActionForceFirst } from "controlled-actions"

const BringMePie = new ActionForceFirst(
  async ({resolve, reject, payload: flavor })=>{
    const pie = await fetchPie(flavor)
    resolve(pie)
  }
)

const myPiePromise = BringMePie.execute("apple pie");
const myPiePromise2 = BringMePie.execute("lime pie"); // Called before myPiePromise resolves, 
                                                      // but with different payloads
const myPie = await myPiePromise
const myPie2 = await myPiePromise2
// Number of times fetchPie has been called: 1
// Both myPie and myPie2 is the same "apple pie"
```

### `ActionLast`

As the name suggests, `ActionLast` 's executions always resolves to the last call's response. 

```javascript
import { ActionLast } from "controlled-actions"

const BringMePie = new ActionLast(
  async ({resolve, reject, payload: flavor })=>{
    const pie = await fetchPie(flavor)
    resolve(pie)
  }
)

const myPiePromise = BringMePie.execute("apple pie");
const myPiePromise2 = BringMePie.execute("lime pie"); //Called before myPiePromise resolves
const myPiePromise3 = BringMePie.execute("avocado pie"); //Called before myPiePromise 1 and 2 resolves

const myPie = await myPiePromise
const myPie2 = await myPiePromise2
const myPie3 = await myPiePromise3
// Number of times fetchPie has been called: 3
// myPie, myPie2 and myPie3 is the same "avocado pie"
```

## Why

When studying the flux spec, I started to implement it.
I imagined "actions" as simple async functions that perform some async routine and distribute consequences (such as application state changes or in place ). 

In this scenario, Actions could be executed by everything that can dispatch some routine, API Calls, for instance. 

The first problems happened when we had multiple components that called the same endpoint with the same params. Those components could dispatch Action executions at the same time. In order to prevent multiple backend calls with the same payload, I've created something like `ActionFirst`. As time passed, new types of concurrency treatment appeared, then has born `controlled-actions`.

Since it is based only in the JS Promises API, it can be used anywhere it is supported. Node or the browser. Using React or any other UI Library.

## API Reference

### [Action](/src/Action.js)
```javascript
import { Action } from "controlled-actions"
```
Concurrent actions.


##### Constructor:
```javascript
new Action<PayloadType, ResolveType>(actionRoutine)
```
###### `actionRoutine`:
```javascript
({
  resolve: ResolveType => void,
  reject, 
  payload: PayloadType 
}) => void | Promise<void>
```
A function that receives `resolve` and `reject` functions (similar to a Promise) and a payload. It is the routine performed by the action.

##### Methods:

###### `execute : PayloadType => Promise<ResolveType>`

Calls an execution of the action. 


### [ActionFirst](/src/ActionFirst.js)
```javascript
import { ActionFirst } from "controlled-actions"
```
Actions whose executions hang on equal ongoing calls. Extends `Action`.

Constructors and methods have the same signatures than the `Actions`'s.



### [ActionForceFirst](/src/ActionForceFirst.js)
```javascript
import { ActionForceFirst } from "controlled-actions"
```
Actions whose executions hang on ongoing calls. Extends `ActionFirst`.

Constructors and methods have the same signatures than the `Actions`'s.

### [ActionLast](/src/ActionLast.js)
```javascript
import { ActionLast } from "controlled-actions"
```
Actions whose executions hang on ongoing calls. Extends `Action`.

Constructors and methods have the same signatures than the `Actions`'s.


