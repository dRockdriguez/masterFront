'use strict'

const mongoose = require('mongoose');
const app = require('./app');
const port = 3333;

// Configuración de mongoose y conexión contra bbdd.
mongoose.set('useFindAndModify', false);
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/api_rest_blog', { useNewUrlParser: true }).then(() => {
    app.listen(port, () => {
    });
});