require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const session = require('express-session');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sesiones
app.use(session({
  secret: process.env.SESSION_SECRET || 'clave-secreta',
  resave: false,
  saveUninitialized: false
}));

// Ruta raíz → mostrar login primero
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/login.html');
});

// Servir archivos estáticos desde public/
app.use(express.static('public'));

// Conexión a MySQL
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'rehabilitacion'
}).promise();

// Middleware: verificar que el usuario esté logueado
function isLoggedIn(req, res, next) {
  if (!req.session || !req.session.usuario) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  next();
}

// Middleware: verificar rol específico
function hasRole(...rolesPermitidos) {
  return (req, res, next) => {
    const rolUsuario = req.session.usuario?.rol;
    if (!rolUsuario || !rolesPermitidos.includes(rolUsuario)) {
      return res.status(403).json({ success: false, error: 'Acceso denegado' });
    }
    next();
  };
}


// Registro
app.post('/register', async (req, res) => {
  const { correo, usuario, password, codigo_acceso } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buscar el rol según el código
    const [rows] = await db.query(
      'SELECT tipo_usuario FROM codigos_acceso WHERE codigo = ?',
      [codigo_acceso]
    );

    if (rows.length === 0) {
      return res.status(400).json({ success: false, error: 'Código de acceso inválido' });
    }

    const rol = rows[0].tipo_usuario;

    // Insertar usuario
    await db.query(
      'INSERT INTO usuarios (nombre, rol, codigo_acceso, correo, password) VALUES (?, ?, ?, ?, ?)',
      [usuario, rol, codigo_acceso, correo, hashedPassword]
    );

    res.json({ success: true, mensaje: 'Usuario registrado correctamente' });
  } catch (err) {
    console.error('Error al registrar:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});


// Login
app.post('/login', async (req, res) => {
  const { usuario, password } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM usuarios WHERE nombre = ? OR correo = ?', [usuario, usuario]);
    if (rows.length > 0) {
      const match = await bcrypt.compare(password, rows[0].password);
      if (match) {
        req.session.usuario = {
          id_usuario: rows[0].id_usuario,
          nombre: rows[0].nombre,
          rol: rows[0].rol
        };
        return res.json({ success: true, usuario: req.session.usuario });
      }
    }
    res.json({ success: false });
  } catch (err) {
    res.json({ success: false, error: err });
  }
});

// ---------------------- RUTAS ----------------------

// Consultar rol
app.get('/session', (req, res) => {
  if (req.session && req.session.usuario) {
    res.json({ success: true, usuario: req.session.usuario });
  } else {
    res.json({ success: false });
  }
});

// Usuarios (solo admin)
app.get('/usuarios', isLoggedIn, hasRole('admin'), async (req, res) => {
  const [rows] = await db.query('SELECT * FROM usuarios');
  res.json(rows);
});

app.post('/usuarios', isLoggedIn, hasRole('admin'), async (req, res) => {
  const { nombre, rol, codigo_acceso } = req.body;
  await db.query(
    'INSERT INTO usuarios (nombre, rol, codigo_acceso) VALUES (?, ?, ?)',
    [nombre, rol, codigo_acceso]
  );
  res.status(201).json({ mensaje: 'Usuario agregado correctamente' });
});

// Ver usuarios
app.get('/usuarios', isLoggedIn, hasRole('admin'), async (req, res) => {
  const [rows] = await db.query('SELECT id_usuario, nombre, correo, rol, codigo_acceso FROM usuarios');
  res.json(rows);
});

// Editar usuario
app.put('/usuarios/:id', isLoggedIn, hasRole('admin'), async (req, res) => {
  const { nombre, correo, rol } = req.body;
  await db.query(
    'UPDATE usuarios SET nombre=?, correo=?, rol=? WHERE id_usuario=?',
    [nombre, correo, rol, req.params.id]
  );
  res.json({ success: true, mensaje: 'Usuario actualizado correctamente' });
});

// Eliminar usuario
app.delete('/usuarios/:id', isLoggedIn, hasRole('admin'), async (req, res) => {
  await db.query('DELETE FROM usuarios WHERE id_usuario=?', [req.params.id]);
  res.json({ mensaje: 'Usuario eliminado correctamente' });
});

// Pacientes
app.get('/pacientes', isLoggedIn, hasRole('admin', 'fisioterapeuta'), async (req, res) => {
  const [rows] = await db.query('SELECT * FROM pacientes');
  res.json(rows);
});


// Editar paciente (admin y fisioterapeuta)
app.put('/pacientes/:id', isLoggedIn, hasRole('admin', 'fisioterapeuta'), async (req, res) => {
  const { nombre, edad, lesion, estado_salud, fecha_registro } = req.body;
  await db.query(
    'UPDATE pacientes SET nombre=?, edad=?, lesion=?, estado_salud=?, fecha_registro=? WHERE id_paciente=?',
    [nombre, edad, lesion, estado_salud, fecha_registro, req.params.id]
  );
  res.json({ mensaje: 'Paciente actualizado correctamente' });
});

// Eliminar paciente (admin y fisioterapeuta)
app.delete('/pacientes/:id', isLoggedIn, hasRole('admin', 'fisioterapeuta'), async (req, res) => {
  await db.query('DELETE FROM pacientes WHERE id_paciente=?', [req.params.id]);
  res.json({ mensaje: 'Paciente eliminado correctamente' });
});


app.post('/pacientes', isLoggedIn, hasRole('admin', 'fisioterapeuta'), async (req, res) => {
  const { nombre, edad, lesion, estado_salud, fecha_registro } = req.body;
  await db.query(
    'INSERT INTO pacientes (nombre, edad, lesion, estado_salud, fecha_registro) VALUES (?, ?, ?, ?, ?)',
    [nombre, edad, lesion, estado_salud, fecha_registro]
  );
  res.status(201).json({ mensaje: 'Paciente agregado correctamente' });
});

// Ejercicios
// Paciente, admin y fisioterapeuta pueden ver la tabla
app.get('/ejercicios', isLoggedIn, hasRole('admin', 'fisioterapeuta', 'paciente'), async (req, res) => {
  const [rows] = await db.query('SELECT * FROM ejercicios');
  res.json(rows);
});

// Solo admin y fisioterapeuta pueden añadir
app.post('/ejercicios', isLoggedIn, hasRole('admin', 'fisioterapeuta'), async (req, res) => {
  const { nombre, zona_cuerpo, descripcion } = req.body;
  await db.query(
    'INSERT INTO ejercicios (nombre, zona_cuerpo, descripcion) VALUES (?, ?, ?)',
    [nombre, zona_cuerpo, descripcion]
  );
  res.json({ mensaje: 'Ejercicio agregado correctamente' });
});

// Solo admin y fisioterapeuta pueden editar
app.put('/ejercicios/:id', isLoggedIn, hasRole('admin', 'fisioterapeuta'), async (req, res) => {
  const { nombre, zona_cuerpo, descripcion } = req.body;
  await db.query(
    'UPDATE ejercicios SET nombre=?, zona_cuerpo=?, descripcion=? WHERE id_ejercicio=?',
    [nombre, zona_cuerpo, descripcion, req.params.id]
  );
  res.json({ mensaje: 'Ejercicio actualizado correctamente' });
});

// Solo admin y fisioterapeuta pueden eliminar
app.delete('/ejercicios/:id', isLoggedIn, hasRole('admin', 'fisioterapeuta'), async (req, res) => {
  await db.query('DELETE FROM ejercicios WHERE id_ejercicio=?', [req.params.id]);
  res.json({ mensaje: 'Ejercicio eliminado correctamente' });
});

// Registro de Ejercicios
app.post('/registro', isLoggedIn, hasRole('admin','fisioterapeuta'), async (req, res) => {
  const { paciente, ejercicio, observaciones, fecha } = req.body;
  try {
    await db.query(
      'INSERT INTO registro_ejercicios (paciente, ejercicio, observaciones, fecha) VALUES (?, ?, ?, ?)',
      [paciente, ejercicio, observaciones, fecha]
    );
    res.json({ success: true, mensaje: 'Registro guardado exitosamente' });
  } catch (err) {
    console.error('Error al guardar registro:', err);
    res.status(500).json({ success: false, error: 'Error al guardar registro' });
  }
});

app.get('/registro', isLoggedIn, hasRole('admin','fisioterapeuta'), async (req, res) => {
  const [rows] = await db.query('SELECT * FROM registro_ejercicios');
  res.json(rows);
});

// Editar
app.put('/registro/:id', isLoggedIn, hasRole('admin','fisioterapeuta'), async (req, res) => {
  const { ejercicio, observaciones, fecha } = req.body;
  try {
    await db.query(
      'UPDATE registro_ejercicios SET ejercicio=?, observaciones=?, fecha=? WHERE id_registro=?',
      [ejercicio, observaciones, fecha, req.params.id]
    );
    res.json({ success: true, mensaje: 'Registro actualizado correctamente' });
  } catch (err) {
    console.error('Error al actualizar registro:', err);
    res.status(500).json({ success: false, error: 'Error al actualizar registro' });
  }
});

// Eliminar
app.delete('/registro/:id', isLoggedIn, hasRole('admin','fisioterapeuta'), async (req, res) => {
  try {
    await db.query('DELETE FROM registro_ejercicios WHERE id_registro=?', [req.params.id]);
    res.json({ success: true, mensaje: 'Registro eliminado exitosamente' });
  } catch (err) {
    console.error('Error al eliminar registro:', err);
    res.status(500).json({ success: false, error: 'Error al eliminar registro' });
  }
});






// ---------------------- PUERTO ----------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
