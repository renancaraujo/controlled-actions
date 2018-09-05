# Controlled actions
[![Build Status](https://travis-ci.org/renancaraujo/controlled-actions.svg?branch=master)](https://travis-ci.org/renancaraujo/controlled-actions)
[![npm](https://img.shields.io/npm/v/controlled-actions.svg)](https://www.npmjs.com/package/controlled-actions)

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
  async () => {
    const images = await imageEndpoint.get()
    localStore.updateImages(images) // this can be a store, like a reducer or a mobx-observable's action
    return images
  }
)

// Somewhere_else.js
...
async componentDidMount(){
 const images = await FetchImages.execute()
 //by this line, local store is updated
}
```

###### Without async/await

If you dont want to use async/await, you can use controlled-actions by simply returning an Promise or a value. Afterall, the return will be evalued as a `Promise.resolve(returnedValue)`
See the above example:

```javascript
// FetchImages.js
import { ActionFirst } from "controlled-actions"
import localStore from "./localStore"
import { imageEndpoint } from "./endpoints"

const FetchImages = new ActionFirst(
  () => {
    return new Promise((resolve, reject)=>{
      const images = await imageEndpoint.get()
      localStore.updateImages(images)
      resolve(images)
    })
  }
)
```

## Why

When studying the flux spec, I started to implement it.
I've imagined "actions" as simple async functions that performs some async routine and distribute side effects (such as application state changes). 

In this scenario, Actions could be executed by everything that can dispatch an async routine, like API Calls, for instance.

The first issues appeared when we had multiple components that called the same endpoint with the same params. Those components could dispatch Action executions at the same time. In order to prevent multiple backend calls with the same payload, I've created something like `ActionFirst`. As time passed, new types of concurrency treatment appeared, then has born `controlled-actions`.

Since it relies only on the JS Promises API, it can be used anywhere it is supported. Node or the browser. Using React or any other UI Library.

In some of my projects, I use it alongside mobx in a fancy redux-less flux implemmentation.

## Alternatives

As anything else related to software development, `controlled-actions` is not suitable for every project out there. Here are some aletrnativeas that may be more suitable for your project:

- If you are using redux on your project, you can easily reproduce this concurrent handling behavior with [redux-saga](https://github.com/redux-saga/redux-saga).
- [RxJS](https://rxjs-dev.firebaseapp.com/) can be a good alternative too, but be careful to not implement a overkill. Read more about it [here](https://rxjs-dev.firebaseapp.com/).


## How to use it

Controlled actions includes the following classes:

`Action`, `ActionFirst`, `ActionForceFirst` and `ActionLast `

Each one of those, deals with concurrent calls in a different way. Let's see how they work:

### `Action`

Starting with the simplest: `Action`. Action is wrapper around a simple asynchronous routine, here is a example:

```javascript
import { Action } from "controlled-actions"

const BringMePie = new Action(async ()=>{
  const pie = await fetchPie() //some api call to an pie endpoint, for example
  return pie
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
  async (flavor)=>{
    const pie = await fetchPie(flavor) //some api call to an pie endpoint, for example
    return pie
  }
)

const myPie = await BringMePie.execute("apple pie");
// Number of times fetchPie has been called: 1
// myPie is a "apple pie"

```

**"I can do that just with JS Promises"**.
Action alone can be considered pretty useless, but if you consider the ones who extend it, it can be a good way to standardize the application when you need special runtime features, as provided by `ActionFirst`, `ActionForceFirst` and `ActionLast`

### `ActionFirst`

If you execute an ActionFirst at teh same time another execution, with an equal payload that has not been resolved yet, it will hang on the ongoing Promise. 

```javascript
import { ActionFirst } from "controlled-actions"

const BringMePie = new ActionFirst(
  async (flavor)=>{
    const pie = await fetchPie(flavor) //some api call to an pie endpoint, for example
    return pie
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
  async (flavor)=>{
    const pie = await fetchPie(flavor)  //some api call to an pie endpoint, for example
    return pie
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
  async (flavor)=>{
    const pie = await fetchPie(flavor)
    return pie
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
(payload: PayloadType) => Promise<ResolveType>
```
A function that receives a payload; Performs some async stuff, and returns a promise. It is the routine performed by the action. It is recommended to use an `async` function.

##### Methods:

###### `execute : PayloadType => Promise<ResolveType>`

Starts an execution of the action. 


### [ActionFirst](/src/ActionFirst.js)
```javascript
import { ActionFirst } from "controlled-actions"
```
Actions whose executions hangs on ongoing calls, if there is the same payload. Extends `Action`.
Constructors and methods have the same signatures as `Actions`.

### [ActionForceFirst](/src/ActionForceFirst.js)
```javascript
import { ActionForceFirst } from "controlled-actions"
```
Actions whose executions hang on ongoing calls, despite payload. Extends `ActionFirst`.

Constructors and methods have the same signatures than the `Actions`'s.

### [ActionLast](/src/ActionLast.js)
```javascript
import { ActionLast } from "controlled-actions"
```
Actions whose executions will always resolve to the last call. Extends `Action`.

Constructors and methods have the same signatures than the `Actions`'s.

# Contributing

If you got so far reading this README, you are maybe thinking about contributing. Pull requests are welcome.