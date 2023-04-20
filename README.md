# react-native-svg-draw

React Native drawing component based on SVG with editable annotations

![Drawing Example](documentation/example.gif)

## Features

- Draw arrow, rectangle, ellipse ... on picture or blank view
- Compatible with `Expo`
- Built with `react-native-reanimated` v2
- Save result with `react-native-view-shot`
- Fully customisable

## Installation

### Bare react native app

```sh

npm install @archireport/react-native-svg-draw react-native-reanimated react-native-gesture-handler react-native-svg react-native-view-shot react-native-linear-gradient

```

### Expo

```sh

expo install @archireport/react-native-svg-draw react-native-reanimated react-native-gesture-handler react-native-svg react-native-view-shot expo-linear-gradient

```

---

**⚠️ extra steps are required**

_React Native Gesture Handler_ needs extra steps to finalize its installation, please follow their [installation instructions](https://docs.swmansion.com/react-native-gesture-handler/docs/#installation).

_React Native Reanimated_ needs extra steps to finalize its installation, please follow their [installation instructions](https://docs.swmansion.com/react-native-reanimated/docs/installation/).

---

## Usage

### Bare react native app

```js
import { DrawWithOptions } from 'react-native-svg-draw';
import LinearGradient from 'react-native-linear-gradient';

// ...
  <DrawWithOptions linearGradient={LinearGradient} />
```

### Expo

```js
import { DrawWithOptions } from 'react-native-svg-draw';
import { LinearGradient } from 'expo-linear-gradient';

// ...
  <DrawWithOptions linearGradient={LinearGradient} />
```

---

## How it works

You have 2 options

### Use DrawWithOptions provided by the lib

Fast and easy way to use the lib.
Example :

```jsx
  <DrawWithOptions
    linearGradient={LinearGradient}
    image={require('./pexels-sebastian-palomino-2847766.jpg')}
    close={() => true}
    takeSnapshot={(snap) => {
      snap.then((uri) => console.log('snapShot uri:', uri));
    }}
  />
```

### Use your own "DrawWithOptions" component

You can create your own "DrawWithOptions" component and customize the ui.

You will need to use `DrawCore` component wrapped in `DrawProvider` context.


```jsx
<DrawProvider>
  <DrawCore image={require('./pexels-sebastian-palomino-2847766.jpg')}/>
</DrawProvider>
```


Then you can use the hook "useDrawHook" inside your components to interact with the context. This hook expose a lot of functions and objects that can be used to interact with the `DrawCore`.

```js
  const {
    drawState,
    dispatchDrawStates,
    itemIsSelected,
    cancelLastAction,
    deleteSelectedItem,
    ...
  } = useDrawHook();
```

#### useDrawHook

| Name                  | Type                   | Description                                                                                               |
| --------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------- |
| `strokeWidth`         | shared value(number)   | Object from react-native-reanimated, get and set value => strokeWidth.value                               |
| `color`               | shared value(hslColor) | Object from react-native-reanimated, get and set value => color.value                                     |
| `onColorStrokeChange` | function               | Function use when changing color or strokeWidth is done to memorize action for undo                       |
| `drawState`           | object                 | Get the selected `drawingMode` : 'singleHead','doubleHead','rectangle','ellipse','text','pen', `cancelEnabled`  is true when last action can be canceled,  `doneItems` contains all previous draw items and `screenStates` helps to go back in time (cancel pops last state)            |
| `dispatchDrawStates`  | function               | Can be used to update `drawingMode`            |
| `itemIsSelected`      | shared value(boolean)  | Object from react-native-reanimated Indicate if an item is selected, to get value => itemIsSelected.value |
| `cancelLastAction`    | function               | Call this function when user press your undo button                                                       |
| `takeSnapshot`        | function               | This async function will return the uri of your drawing                                                   |
| `deleteSelectedItem`  | function               | Call this function when you want to delete the selected item                                              |

### Recommendation

Copy the drawWithOptions component, sliders component and adjust styles to match your theme

## Components

### DrawWithOptions

Component with header and footer, based on DrawCore

#### Properties

| Name             | Type            | Description                                                                              |
| ---------------- | --------------- | ---------------------------------------------------------------------------------------- |
| `close`          | function        | (optional) called when cross is pressed                                                  |
| `takeSnapshot`   | function        | (optional) called when send button (at the top right) is pressed                         |
| `linearGradient` | React Component | implementation used for linear gradient (differs between expo and bare react native app) |
| `image`          | image           | (optional) background picture                                                            |
| `backgroundColor` | string | (optional) background color of the draw zone |

### DrawCore

Component where the user can draw

#### Properties

| Name              | Type   | Description                                  |
| ----------------- | ------ | -------------------------------------------- |
| `image`           | image  | (optional) background picture                |
| `backgroundColor` | string | (optional) background color of the draw zone |

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
