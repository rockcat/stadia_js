const express = require('express')

const PORT = 3002

const app = express()

app.use(express.static('.'))

express.static.mime.define({'application/javascript': ['js','jsm']});

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})