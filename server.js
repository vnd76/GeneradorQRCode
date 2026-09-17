require('dotenv').config();
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { nanoid } = require('nanoid');
const SECRET = process.env.QR_SECRET;

function firmar(texto) { return crypto.createHmac('sha256', SECRET).update(texto).digest('hex'); }
function sumarTiempo(fecha, unidad, cantidad) {
    const resultado = new Date(fecha);
    if (unidad === 'dias') resultado.setDate(resultado.getDate() + cantidad);
    else if (unidad === 'meses') resultado.setMonth(resultado.getMonth() + cantidad);
    else if (unidad === 'anios') resultado.setFullYear(resultado.getFullYear() + cantidad);
    return resultado;
}

const DB_PATH = path.join(__dirname, 'data', 'qrs.json');
function leerDB() {
    if (!fs.existsSync(DB_PATH)) return {};
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}
function guardarDB(db) {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

const express = require('express');
const QRCode = require('qrcode');
const app = express();
const PORT = 3006;

app.use(express.json());
app.use(express.static('public'));

app.post('/api/generar', async (req, res) => {
    const { contenido, cantidad, unidad, tamano, correccion } = req.body;
    const tamanoNum = parseInt(tamano, 10) || 256;
    const nivelesValidos = ['L', 'M', 'Q', 'H'];
    const nivelCorreccion = nivelesValidos.includes(correccion) ? correccion : 'M';
    if (!contenido) return res.status(400).json({ error: 'Falta el contenido' });

    const id = nanoid(10);
    const fechaCreacion = new Date();
    const cantidadNum = parseInt(cantidad, 10);
    const tieneValidez = ['dias', 'meses', 'anios'].includes(unidad) && cantidadNum > 0;
    const fechaExpiracion = tieneValidez ? sumarTiempo(fechaCreacion, unidad, cantidadNum) : null;

    const registro = {
        id,
        contenido,
        fecha_creacion: fechaCreacion.toISOString(),
        fecha_expiracion: fechaExpiracion ? fechaExpiracion.toISOString() : null,
        tamano: tamanoNum,
        correccion: nivelCorreccion,
    };
    registro.firma = firmar(`${registro.id}|${registro.contenido}|${registro.fecha_expiracion}`);

    const db = leerDB();
    db[id] = registro;
    guardarDB(db);

    const urlVerificacion = `${req.protocol}://${req.get('host')}/v/${id}`;

    const qrDataUrl = await QRCode.toDataURL(urlVerificacion, {
        errorCorrectionLevel: nivelCorreccion,
        width: tamanoNum,
    });

    res.json({ id, qr: qrDataUrl, url: urlVerificacion, fecha_expiracion: registro.fecha_expiracion });
});

app.get('/api/verificar/:id', async (req, res) => {
    const db = leerDB();
    const registro = db[req.params.id];
    if (!registro) {
        return res.status(404).json({ error: 'No existe ningún QR con ese identificador.' });
    }
    const firmaEsperada = firmar(`${registro.id}|${registro.contenido}|${registro.fecha_expiracion}`);
    const integro = firmaEsperada === registro.firma;
    const ahora = new Date();
    const sinExpiracion = !registro.fecha_expiracion;
    const valido = sinExpiracion || ahora <= new Date(registro.fecha_expiracion);

    const qrDataUrl = await QRCode.toDataURL(registro.contenido, {
        errorCorrectionLevel: registro.correccion || 'M',
        width: registro.tamano || 256,
    });

    const urlVerificacion = `${req.protocol}://${req.get('host')}/v/${registro.id}`;

    res.json({
        id: registro.id,
        contenido: registro.contenido,
        fecha_creacion: registro.fecha_creacion,
        fecha_expiracion: registro.fecha_expiracion,
        valido,
        integro,
        qr: qrDataUrl,
        url: urlVerificacion,
    });
});

app.get('/v/:id', (req, res) => {
    const db = leerDB();
    const registro = db[req.params.id];

    if (!registro) {
        return res.status(404).send(paginaMensaje('QR no encontrado', 'Este código no corresponde a ningún registro válido.', 'expirado'));
    }

    const ahora = new Date();
    const sinExpiracion = !registro.fecha_expiracion;
    const valido = sinExpiracion || ahora <= new Date(registro.fecha_expiracion);

    if (!valido) {
        return res.status(410).send(paginaMensaje(
            'Este QR ha expirado',
            `Dejó de ser válido el ${new Date(registro.fecha_expiracion).toLocaleString('es-ES')}. El contenido ya no está disponible desde este código.`,
            'expirado'
        ));
    }

    const esUrl = /^https?:\/\//i.test(registro.contenido);

    if (esUrl) {
        return res.redirect(registro.contenido);
    }

    return res.send(paginaMensaje('Contenido verificado', registro.contenido, 'valido'));
});

function paginaMensaje(titulo, texto, tipo) {
    const color = tipo === 'valido' ? '#3c6e52' : '#b0483f';
    return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${titulo}</title>
<style>
  body{
    margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center;
    background:#f6f4ee; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
    padding:24px;
  }
  .box{
    max-width:400px; background:#fff; border:1px solid #d8d3c4; border-radius:6px;
    padding:32px; text-align:center;
  }
  h1{ color:${color}; font-size:1.2rem; margin:0 0 12px; }
  p{ color:#4a463c; font-size:0.95rem; line-height:1.5; margin:0; word-break:break-word; }
</style>
</head>
<body>
  <div class="box">
    <h1>${titulo}</h1>
    <p>${texto}</p>
  </div>
</body>
</html>`;
}

app.get('/', (req, res) => {
    res.send('El servidor está funcionando');
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});