const express = require('express');
const app = express()
const port = 3002;
app.use(express.static(__dirname + '/'));
app.get('/', function(request, response){
    response.sendFile('index.html', { root: __dirname });
});
app.listen(port, () => console.log(`SMUM webapp listening on port ${port}!`))
