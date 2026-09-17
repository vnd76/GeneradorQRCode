document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('panel-' + btn.dataset.tab).classList.add('active');
    });
});

async function generarQR() {
    const textInput = document.getElementById('text-input');
    const texto = textInput.value.trim();

    if (!texto) {
        textInput.focus();
        textInput.style.borderColor = 'var(--red)';
        setTimeout(() => textInput.style.borderColor = '', 900);
        return;
    }

    const cantidad = document.getElementById('validity-amount').value;
    const tamano = document.getElementById('size-select').value; 
    const correccion = document.getElementById('ec-select').value;
    const unidad = document.getElementById('validity-unit').value;
    const generateBtn = document.getElementById('generate-btn');

    generateBtn.disabled = true;
    generateBtn.textContent = 'Generando...';

    try {
        const resp = await fetch('/api/generar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contenido: texto, cantidad, unidad, tamano, correccion })
        });

        const data = await resp.json();
        if (!resp.ok) {
            throw new Error(data.error || 'Error al generar el QR.');
        }

        document.getElementById('qrcode').innerHTML = `<img src="${data.qr}" alt="QR generado">`;
        document.getElementById('result').classList.add('show');

        document.getElementById('validity-note').textContent = data.fecha_expiracion
            ? 'Válido hasta: ' + new Date(data.fecha_expiracion).toLocaleString('es-ES')
            : 'Sin fecha de expiración definida.';

        const downloadLink = document.getElementById('download-link');
        downloadLink.href = data.qr;

        const verifyIdInput = document.getElementById('verify-id-input');
        if (verifyIdInput) verifyIdInput.value = data.id;

    } catch (err) {
        alert(err.message);
    } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = 'Generar QR';
    }
}

document.getElementById('generate-btn').addEventListener('click', generarQR);
document.getElementById('text-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') generarQR();
});

async function verificarQR() {
    const id = document.getElementById('verify-id-input').value.trim();
    const errorMsg = document.getElementById('verify-error');
    const statusCard = document.getElementById('status-card');

    errorMsg.classList.remove('show');
    statusCard.classList.remove('show', 'valido', 'expirado');

    if (!id) {
        errorMsg.textContent = 'Escribe el id del QR que quieres verificar.';
        errorMsg.classList.add('show');
        return;
    }

    try {
        const resp = await fetch('/api/verificar/' + encodeURIComponent(id));
        const data = await resp.json();

        if (!resp.ok) {
            errorMsg.textContent = data.error || 'No se pudo verificar.';
            errorMsg.classList.add('show');
            return;
        }

        statusCard.classList.add('show', data.valido ? 'valido' : 'expirado');

        const badge = document.getElementById('status-badge');
        badge.textContent = data.valido ? 'VÁLIDO' : 'EXPIRADO';
        badge.className = 'status-badge ' + (data.valido ? 'valido' : 'expirado');

        document.getElementById('status-qr').innerHTML = data.qr
            ? `<img src="${data.qr}" alt="QR verificado">`
            : '';

        document.getElementById('status-contenido').textContent = data.contenido;

        const statusUrl = document.getElementById('status-url');
        statusUrl.innerHTML = data.url
            ? `Probar sin escanear: <a href="${data.url}" target="_blank">${data.url}</a>`
            : '';

        document.getElementById('status-creado').textContent = new Date(data.fecha_creacion).toLocaleString('es-ES');
        document.getElementById('status-expira').textContent = data.fecha_expiracion
            ? new Date(data.fecha_expiracion).toLocaleString('es-ES')
            : 'Sin expiración';

        if (data.fecha_expiracion) {
            const ahora = new Date();
            const expira = new Date(data.fecha_expiracion);
            const dias = Math.floor(Math.abs(expira - ahora) / (1000 * 60 * 60 * 24));
            document.getElementById('status-restante').innerHTML = data.valido
                ? ` ${dias} día(s)`
                : ` ${dias} día(s)`;
        } else {
            document.getElementById('status-restante').textContent = '';
        }

        document.getElementById('status-integridad').textContent = data.integro
            ? ' Firma verificada'
            : ' Los datos no coinciden con la firma original';

    } catch (err) {
        errorMsg.textContent = 'Error de conexión con el servidor.';
        errorMsg.classList.add('show');
    }
}

const verifyBtn = document.getElementById('verify-btn');
if (verifyBtn) verifyBtn.addEventListener('click', verificarQR);