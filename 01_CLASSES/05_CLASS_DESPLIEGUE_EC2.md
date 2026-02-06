# Deploy a instancia EC2 usando NGINX y Node

Información para lanzar una instancia EC2 con NGINX PM2 Y NVM

## Descargas a instancia EC2 y clonacion repositorio
Conectarte a tu instancia   
`ssh -i "[nombrearhcivo].pem" ubuntu@[ip-estatica]`

(En caso de error de REMOTE HOST IDENTIFICATION HAS CHANGED!)
- Este error se debe a que estamos usando una huella (host key) para ese IP, y ahora estamos intentando conectar a otra máquina (o la misma, pero reinstalada) con una huella distinta. En AWS debemos tener cuidado cuando terminamos una instancia y luego usas otra con el mismo IP (o cambió el host key).

Si ocurre ejecutamos el siguiente código para eliminar la huella anterior:

`ssh-keygen -R 13.39.95.222`

Y el problema se habrá solucionado.

Actualizar repositorios mas recientes   
`sudo apt-get update -y`

Instalacion NGNIX  
`sudo apt install nginx`

Verificar la instalacion  
`curl localhost`

Instalacion NodeJS y NPM version 12  
`sudo apt-get install nodejs npm -y`

Instalacion NVM para instalar la version LTS de node o la version 20 del tutorial  
`curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash`

Activar NVM  
`. ~/.nvm/nvm.sh`

Instalacion de version especifica de node con NVM  
`nvm install 20`

Clonar repositorio   
`git clone [repo].git`

## Configuracion NGINX

Moverte a la carpeta sites-available  
`cd /etc/nginx/sites-available/`

Archivo sampleapp  
```
server {

        listen 80;
        listen [::]:80;
        server_name [public_static_ip];
        location / {
                proxy_pass http://localhost:[YOUR_PORT];
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection 'upgrade';
                proxy_set_header Host $host;
                proxy_cache_bypass $http_upgrade;
        }
}
```

Creacion archivo sampleapp para la configuracion  
`sudo nano sampleapp`

Link del sampleapp a sites-enabled  
`sudo ln -s /etc/nginx/sites-available/sampleapp /etc/nginx/sites-enabled`

Verificar errores en el archivo de configuracion  
`sudo nginx -t`

Reload NGINX  
`sudo service nginx reload`

## Configuracion PM2
Descarga pm2  
`npm i -g pm2`

Ejecuta los siguientes comandos en la ruta de tu proyecto node   
`pm2 start`

`pm2 start ./location/index.js`

`pm2 startup`

Va a imprimir una línea tipo

`sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu`

Copia y ejecuta exactamente esa línea y con eso el servidor ya está registrado en el path de PM2

## PASO FINAL

Guardar la lista de procesos (para que se “restaure” al reiniciar)

`pm2 save`

## IMPORTANTE REINICIAR LA INSTANCIA EC2 PARA GUARDAR LOS CAMBIOS

Para verificar que se agregó a la lista

`pm2 list`
