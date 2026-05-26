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




app.get('/api/reservas', async (req, res) => {

    try {

        const pool = getPool();


        const result = await pool.request()

            .query(`

                SELECT *

                FROM reservas

                ORDER BY fecha, horario

            `);


        res.json(result.recordset);

    } catch (error) {

        console.log(error);

        res.status(500).json({

            message: 'Error al obtener reservas'

        });

    }

});

app.get('/admin', (req, res) => {

    res.sendFile(

        path.join(__dirname, '../frontend/admin.html')

    );

});



app.delete('/api/reservas/:id', async (req, res) => {

    const { id } = req.params;


    try {

        const pool = getPool();


        await pool.request()

            .input('id', id)

            .query(`

                DELETE FROM reservas

                WHERE id = @id

            `);


        res.json({

            message: 'Reserva eliminada'

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({

            message: 'Error al eliminar reserva'

        });

    }

});


app.put('/api/reservas/:id', async (req, res) => {

    const { id } = req.params;

    const { horario } = req.body;


    try {

        const pool = getPool();


        await pool.request()

            .input('id', id)

            .input('horario', horario)

            .query(`

                UPDATE reservas

                SET horario = @horario

                WHERE id = @id

            `);


        res.json({

            message: 'Reserva actualizada'

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({

            message: 'Error al actualizar reserva'

        });

    }

});



app.get('/api/horarios/:fecha', async (req, res) => {

    const { fecha } = req.params;


    const horariosBase = [

        '09:00',
        '10:00',
        '11:00',
        '12:00',
        '13:00',
        '14:00',
        '15:00',
        '16:00',
        '17:00',
        '18:00'

    ];


    try {

        const pool = getPool();


        const result = await pool.request()

            .input('fecha', fecha)

            .query(`

                SELECT horario

                FROM reservas

                WHERE fecha = @fecha

            `);


        const ocupados = result.recordset.map(

            reserva => reserva.horario
        );


        const disponibles = horariosBase.filter(

            horario => !ocupados.includes(horario)
        );


        res.json(disponibles);

    } catch (error) {

        console.log(error);

        res.status(500).json({

            message: 'Error horarios'

        });

    }

});








// Puerto
const PORT = 3000;

// Conexión DB
connectDB();

// Servidor
app.listen(PORT, () => {
  console.log(`Servidor funcionando en puerto ${PORT}`);
});
