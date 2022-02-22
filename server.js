const express = require('express');
const app = express();

const { animals } = require('./data/animals');





















app.get('/api/animals', (req, res) => {
    res.send('Hello!')
});





app.listen(3001, () => {
    console.log('API server is now on port 3001');
});