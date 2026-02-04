
# Guía paso a paso: instalar AWS CLI y configurar perfiles (según la transcripción)

## 1 Instalar AWS CLI (Cliente CLI de AWS)
1. Entra a la página oficial de **AWS CLI** y busca la sección de instalación.
2. Selecciona el instalador según tu **sistema operativo** (Windows / macOS / Linux).
   - En el video, el autor usa **macOS** y elige el instalador correspondiente.
3. Ejecuta el instalador y completa el asistente:
   - “Siguiente, siguiente, siguiente” hasta finalizar.

### Verificar que quedó instalado
1. Abre una terminal (CMD/PowerShell en Windows, Terminal en macOS/Linux).
2. Ejecuta:
   ```bash
   aws --version
    ````

3. Si te muestra una versión (ej. `aws-cli/2.x.x ...`), la instalación fue correcta.

---

## 2 Crear un usuario IAM (para acceso programático)

> Objetivo: tener credenciales para usar AWS desde la terminal o desde código, sin entrar a la consola.

1. Inicia sesión en tu **cuenta de AWS** desde el navegador.
2. Busca y entra al servicio **IAM**.
3. Ve a **Users (Usuarios)** y crea un nuevo usuario.
4. Asigna un nombre al usuario (en el video usa “Def”, pero puede ser cualquier nombre).
5. **No le des acceso a la consola** (porque se busca acceso programático).
6. Continúa con **Next**.

### Asignar permisos al usuario

1. Añade el usuario a un **grupo**:

   * Si ya tienes un grupo de administradores, selecciónalo.
   * Si no, crea uno nuevo (en el video lo llama `admins`).
2. Selecciona el permiso **AdministratorAccess** (acceso de administración).

   * Nota del video: esto es común en cuentas de desarrollo; en organizaciones reales se recomiendan permisos más específicos.
3. Crea el grupo y selecciónalo.
4. Continúa con **Next** y luego **Create user**.

---

## 3 Crear Access Key (credenciales)

1. En IAM, haz clic en el **usuario** recién creado.
2. Ve a la pestaña/sección **Security credentials**.
3. Busca **Access keys** y selecciona **Create access key**.
4. Elige el tipo de uso (en el video selecciona la **última opción** de la lista).
5. (Opcional) agrega **tags** o descripción.
6. Clic en **Create access key**.

### Guardar las credenciales (muy importante)

* Se mostrará:

  * **Access key ID**
  * **Secret access key**
* La **Secret access key** se muestra **solo una vez**.

  * Cópiala o descárgala como **CSV** y guárdala en un lugar seguro.
* Si la pierdes, puedes crear otra y **desactivar** la anterior.

---

## 4 Configurar el perfil por defecto (default)

1. Abre la terminal.
2. Ejecuta:

   ```bash
   aws configure
   ```
3. Pega y confirma los datos cuando te los pida:

   * **AWS Access Key ID**: pega tu access key.
   * **AWS Secret Access Key**: pega tu secret.
   * **Default region name**: ejemplo del video: `us-east-1`
   * **Default output format**: ejemplo del video: `json`

### Probar que funciona

1. Ejecuta un comando de prueba (como en el video):

   ```bash
   aws iam list-users
   ```
2. Si devuelve resultados (usuarios), quedó bien configurado.
3. Si aparece error, revisa que copiaste bien las claves, región y que el usuario tiene permisos.

---

## 5) Configurar perfiles adicionales (para varias cuentas/usuarios)

> Idea: tener múltiples perfiles para diferentes credenciales y cambiar entre ellos cuando lo necesites.

1. Ejecuta en la terminal:

   ```bash
   aws configure --profile NOMBRE_DEL_PERFIL
   ```
2. Ingresa otra combinación de credenciales (Access key + Secret) correspondiente a otra cuenta/usuario.
3. Define región y formato de salida para ese perfil.

   * En el video, para variar, usa salida `yaml` (en algunos entornos puede aparecer como `yaml` o `yml`).

### Usar un perfil específico en un comando

* Añade al final `--profile`:

  ```bash
  aws iam list-users --profile NOMBRE_DEL_PERFIL
  ```

---

## 6) Dónde se guardan los perfiles (archivos de configuración)

AWS CLI guarda la configuración en tu carpeta de usuario:

* Carpeta:

  * `~/.aws/` (macOS/Linux)
  * En Windows también existe una carpeta equivalente dentro del perfil del usuario.

Ahí verás dos archivos principales:

1. **config**

   * Guarda región, formato de salida, y configuración por perfil.
2. **credentials**

   * Guarda las **access keys** por perfil.

> Nota del video: podrías editar estos archivos manualmente, pero `aws configure` lo hace más fácil.

---

## 7) Resumen rápido (checklist)

* [ ] Instalar AWS CLI
* [ ] Verificar con `aws --version`
* [ ] Crear usuario IAM (programático)
* [ ] Asignar permisos (grupo + policy)
* [ ] Generar Access Key y guardar Secret
* [ ] Configurar perfil default con `aws configure`
* [ ] Probar con `aws iam list-users`
* [ ] (Opcional) Crear perfiles extra con `aws configure --profile ...`
* [ ] Ejecutar comandos con `--profile ...`
* [ ] Revisar `~/.aws/config` y `~/.aws/credentials`


