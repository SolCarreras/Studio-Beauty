const express = require("express");
const path = require("path");

const app = express();

app.use(express.json());

const { connectDB, getPool } = require("./db");

// Archivos estáticos
app.use(express.static(path.join(__dirname, "../static")));

// Página principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// Endpoint reservas
app.post("/api/reservas", async (req, res) => {
  const { nombre, apellido, telefono, fecha, horario } = req.body;

  try {

    const pool = getPool();


    // Verificar si el horario ya existe

    const reservaExistente = await pool.request()

        .input('fecha', fecha)

        .input('horario', horario)

        .query(`

            SELECT *

            FROM reservas

            WHERE fecha = @fecha

            AND horario = @horario

        `);


    // Si ya existe una reserva

    if (reservaExistente.recordset.length > 0) {

        return res.status(400).json({

            message: 'Ese horario ya está reservado.'

        });

    }


    // Guardar reserva

    await pool.request()

        .input('nombre', nombre)

        .input('apellido', apellido)

        .input('telefono', telefono)

        .input('fecha', fecha)

        .input('horario', horario)

        .query(`

            INSERT INTO reservas (

                nombre,
                apellido,
                telefono,
                fecha,
                horario

            )

            VALUES (

                @nombre,
                @apellido,
                @telefono,
                @fecha,
                @horario
            )

        `);


    res.json({

        message: `Reserva guardada exitosamente.
Te esperamos el día ${fecha} a las ${horario}.`

    });

} catch (error) {

    console.log(error);

    res.status(500).json({

        message: 'Error al guardar reserva'

    });
}});















// Puerto
const PORT = 3000;

// Conexión DB
connectDB();

// Servidor
app.listen(PORT, () => {
  console.log(`Servidor funcionando en puerto ${PORT}`);
});
