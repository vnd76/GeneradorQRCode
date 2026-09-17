# GeneradorQRCode

### Descripción - Español
Aplicación sencilla que genera códigos QR a partir de un enlace, le permite al usuario elegir el tamaño, corrección de errores y validez en días, meses o años. También existe una pestaña para verificar la validez de un QR a través de su id.

---
### Pasos para Ejecutar

#### 1. Instalar dependencias.

```
npm install
```

Lee el archivo _package.json_ y descarga los archivos necesarios dentro de una carpeta llamada _node_modules_.

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

1. Se escribe un id ya generado.
2. Al hacer click en verificar:
   - Busca el registro en _data/qrs.json_.
   - Recalcula la firma y la compara con la ya guardada: si no coinciden, el archivo ha sido manipulado.
   - Compara las fechas para decidir si el código ha expirado.
   - Regenera la imagen del QR y arma la URL de verificación para pruebas.  
4. Se muestran los datos del QR y un mensaje que nos indica si el código es válido o si ha expirado.

---

### Description - English

Simple app to generate QR codes from a link, allows the user to choose the size, error correction and validity in days, months or years. There's also a tab that has the option to verify a QR from its id.

---
### Steps to follow

#### 1. Install dependencies.

```
npm install
```

Reads _package.json_ and downloads the necessary files inside the folder _node_modules_.

#### 2. Create a secret password.

Run the following command:

```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

We create the file .env and add the result of the previous command here.

```
QR_SECRET=GENERATED_PASSWORD_HERE
```

This file is important for the server to work, since it signs each QR (authenticity).

#### 3. Start the server.

Run in terminal:

```
node server.js
```
And you should see: 

```
Server running in http://localhost:3000
```

---

### Functionalities

#### Generate

1. The user writes the URL and selects the size, error correction and validity of the QR code.
2. Once you click generate:
   - Creates an unique id.
   - Calculates the expire date from the creation date and validity introduced.
   - Creates a log with the QR code's content (id, dates, etc.).
   - Signs with HMAC (so it can detect if the log was edited manually).
   - Saves this log in _data/qrs.json_.
   - Generates the QR code that has its own link (to control the expiration date) in:
```
     http://localhost:3000/v/ID
```
3. It returns an image of the QR code and has the option to download it.

#### Verify

1. Insert an id that was already generated.
2. When you click on verify:
   - Search the  _data/qrs.json_.
   - Recalcula la firma y la compara con la ya guardada: si no coinciden, el archivo ha sido manipulado.
   - Compara las fechas para decidir si el código ha expirado.
   - Regenera la imagen del QR y arma la URL de verificación para pruebas.  
4. Se muestran los datos del QR y un mensaje que nos indica si el código es válido o si ha expirado.
