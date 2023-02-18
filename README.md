# stadia_js
Using a Stadia Controller from a browser

Library to enable an unlocked Stadia controller to be used from Javascript UI.
Decodes the raw data packets and maps all of the controls into an easy to access structure.

## Usage
Only one file is needed: _stadia.js_ 
This declares the _StadiaController_ class which does everything. It needs to be used from an ES6 module script like this (this code is in _basic.html_)

```
<script type='module'>

    // Import the library
    import StadiaController from './stadia.js'

    // call back fro changes of controller state
    const controlsChanged = (status) => {
        document.getElementById('info')
                .innerHTML = JSON.stringify(status, undefined, 2)
    }

    // Start the connection
    const connectController = async () => {

        const stadia = new StadiaController()
        stadia.connect(controlsChanged)
        .then(() => {
            console.log(stadia.connected ? "Connected" : "No controller")
        })
    }

    // connect the button
    document.getElementById('connect')
            .addEventListener('click', connectController)

</script>
```

Note that the initial connection has to be triggered from a UI interaction - this is a security restriction imposed by WebHID - see https://developer.mozilla.org/en-US/docs/Web/API/HID/requestDevice#security

To try it out you will need to either run your own webserver or use the simple node server provided:
```
npm install
node server.js
```

Then navigate to http://localhost:3002/basic.html or http://localhost:3002/cube.html on your browser

## Cube Example

This example creates a cube using three.js which can be rotates it with the two analogue triggers on the Stadia contoller. The A button will change the colour of the cube.

Short video is here: https://youtu.be/zrzJPpVoYNw

-- rockcat Feb 2023

