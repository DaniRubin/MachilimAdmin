const express = require('express')
const bodyParser = require('body-parser');

const RouterRest = require('./routes/Route-rest');
const HOST_NAME = 'localhost'
const INITIAL_ROUTE = '/api/v1'
const PORT = 80

const app = express()
app.use(bodyParser.json());

app.use(INITIAL_ROUTE, RouterRest);

app.listen(PORT, () => {
  console.log(`Orca server listening at http://${HOST_NAME}:${PORT}`)
});
