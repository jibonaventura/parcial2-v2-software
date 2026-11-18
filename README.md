## Presentación

* **Nombre:** Juan Ignacio Bonaventura
* **Fecha:** 18/11

## Instrucciones de Construcción y Ejecución con Docker

Sigue estos pasos para construir la imagen e iniciar el contenedor en tu entorno local:

### 1. Clonar el Repositorio
```bash
git clone https://github.com/jibonaventura/parcial2-v2-software.git
cd parcial2-v2-software
```

### 2. Construir la Imagen Docker
Ejecuta el siguiente comando en la raíz del proyecto (donde se encuentra el archivo `Dockerfile`):

```bash
docker build -t parcial2:v1 .
```

### 3. Ejecutar el Contenedor
Inicia el contenedor mapeando el puerto `8080` de tu máquina host al puerto `80` expuesto por Nginx dentro del contenedor:

```bash
docker run -d -p 8080:80 --name mi-parcial parcial2:v1
```

### 4. Acceder al Sitio Web
Abre tu navegador e ingresa a la siguiente dirección:
```text
http://localhost:8080
```