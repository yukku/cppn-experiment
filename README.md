# Mustang Personaliser App

### Install

```
 npm install --no-optional
```

### Develop

```
 npm run serve
```

### Build

```
 npm run build
```

# To generate image on node.js sever

### Install

```
 npm install
```

### Run

```
 npm run generate
```

### API commands

```

constructor -  ( Canvas element (optional) ) [ none ] create the personaliser. If canvas element not passed, then new one gets created

start - ( manifest (list of items to load), debug mode boolean ) [ returns ready success/fail object start ] the personaliser with a list of files for a pack, returns a success/fail object

refreshSize - ( width, height )	[ none ] Refresh the canvas to a set size (resolution)

interact - ( x, y )	[ none ] pass in x and y coordinates for input, x-range (-1,1) y-range (0,1) - based on a semicircle dial interface

exportToJpeg ( width, height ) [ returns based64 encoded jpeg ] create the image at a defined resolution and return it as base64 encoded jpeg

generateDesign ( json ) [ returns promise, ready success / fail obj ]  recreate design based on json passed

OPTIONAL

exportToFile ( width, height ) [ none ] debug method for downloading directly from the app.

```

### NOTE

`stackgl/headless-gl` package has a dependency on `python >=2.5.0 & <3.0.0`

Please change the NPM config to utilise python 2.x as follows:

```
npm config set python /path/to/python2.x
```

