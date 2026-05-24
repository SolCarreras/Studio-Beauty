const express = require('express');
const path = require('path');

const app = express();


// Archivos estáticos
app.use(express.static(path.join(__dirname, '../static')));


// Página principal
app.get('/', (req, res) => {

    res.sendFile(
        path.join(__dirname, '../frontend/index.html')
    );

});


const PORT = 3000;

app.listen(PORT, () => {

    console.log(`Servidor funcionando en puerto ${PORT}`);

});