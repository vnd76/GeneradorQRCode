# GeneradorQRCode

### Descripción - Español
Aplicación sencilla que genera códigos QR a partir de un enlace, le permite al usuario elegir el tamaño, corrección de errores y validez en días, meses o años. También existe una pestaña para verificar la validez de un código QR a través de su id.

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
node -e "console.record(require('crypto').randomBytes(32).toString('hex'))"
```

Ahora crearemos un archivo **.env** e insertaremos el resultado del comando aquí.

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

1. El usuario escribe la URL y selecciona el tamaño, la corrección de errores y la validez del código QR.
2. Al hacer click en generar:
   - Genera un id único.
   - Calcula la fecha de expiración a partir de la fecha de creación y la cantidad de validez introducida.
   - Crea un registro con los datos del código QR (id, contenido, fechas, etc.).
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

Simple app to generate QR codes from a URL. Allows the user to choose the size, error correction and validity in days, months or years. There's also a tab that allows users to verify a QR from its id.

---
### Steps to follow

#### 1. Install dependencies.

```
npm install
```

This command reads _package.json_ and downloads the required dependencies into the _node_modules_ folder.

#### 2. Create a secret key.

Run the following command:

```
node -e "console.record(require('crypto').randomBytes(32).toString('hex'))"
```

Then, create the file **.env** and add the result of the previous command here.

```
QR_SECRET=GENERATED_KEY_HERE
```

This file is important for the server to work, as it signs each QR code (authenticity).

#### 3. Start the server.

Run:

```
node server.js
```
You should see: 

```
Server running in http://localhost:3000
```

---

### Features

#### Generate

1. The user enters the URL and selects the size, error correction and validity of the QR code.
2. Once the user clicks "generate":
   - A unique id is generated.
   - The expiration date is calculated based on the creation date and the selected validity period.
   - A record with the QR code's content (id, dates, etc.) is created.
   - The record is signed with HMAC (so it can detect if it was edited manually).
   - This record is saved in _data/qrs.json_.
   - The QR code is generated with its own URL (to control the expiration date):
```
     http://localhost:3000/v/ID
```
3. The QR code image is displayed with an option to download it.

#### Verify

1. The user enters an id from an already existing QR code.
2. When the user clicks on "verify":
   - The app searches for the record in _data/qrs.json_.
   - The signature is recalculated and compared to the one that was already stored: if it doesn't, the file was manually modified.
   - The dates are compared to determine whether the QR code has expired.
   - The QR code image is regenerated and the verification URL is generated for testing.
3. The QR code info is displayed along with a message indicating whether the code is valid or expired.
