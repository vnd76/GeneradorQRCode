# GeneradorQRCode

### Descripción - Español
Aplicación sencilla que permite generar códigos QR a partir de un enlace, le permite al usuario elegir el tamaño, corrección de errores y validez en días, meses o años. También existe una pestaña que permite verificar la validez de un QR a través de su id y el resultado de escanearlo.

---
### Pasos para Ejecutar

#### 1. Instalar dependencias.

```
npm install
```

Lee el archivo package.json y descarga los archivos necesarios dentro de una carpeta llamada node_modules.

#### 2. Crear una clave secreta.

Ejecutamos el siguiente comando:

```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Ahora crearemos un archivo .env e insertaremos el resultado del comando aquí.

```
QR_SECRET=CLAVE_GENERADA_AQUI
```

Este archivo es importante para el funcionamiento del servidor, ya que se encarga de firmar cada QR (autenticidad). 

#### 3. Levantar el servidor.

Se ejecuta en la terminal:

```
node server.js
```
Y debería verse: 

```
Servidor corriendo en http://localhost:3000
```

---

### Funcionalidades

#### Generar

1. El usuario escribe la URL y selecciona el tamaño, la corrección de errores y la validez del QR.
2. Al hacer click en generar:
   - Genera un id único.
   - Calcula la fecha de expiración a partir de la fecha de creación y la cantidad de validez introducida.
   - Crea un registro con los datos del QR (id, contenido, fechas, etc.).
   - Lo firma con HMAC (detecta si el archivo es editado a mano después).
   - Guarda el registro en _data/qrs.json_.
   - Genera el QR real, que genera un enlace propio que sirve como túnel (para controlar la expiración) en:
```
     http://localhost:3000/v/ID
```
3. Devuelve la imagen del QR y da la opción de descargarla.

#### Verificar

1. Se confirma o escribe un id ya generado.
2. Al hacer click en verificar:
   - Busca el registro en _data/qrs.json_.
   - Recalcula la firma y la compara con la ya guardada: si no coinciden, el archivo ha sido manipulado.
   - Compara las fechas para decidir si el código ha expirado.
   - Regenera la imagen del QR y arma la URL de verificación para pruebas.  
4. Se muestran los datos del QR y un mensaje que nos indica si el código es válido o si ha expirado.


