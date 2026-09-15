# CU-01 — Autenticarse mediante Usuario gub.uy

| | |
|---|---|
| **Actor principal** | Ciudadano (responsable o chofer) / Funcionario de Fiscalización MTOP |
| **Actor secundario** | Usuario gub.uy (ID Uruguay) |
| **Canales** | frontoffice Web y componente móvil |
| **Relación** | `«include»` de todos los CU no públicos del frontoffice y del móvil |
| **Letra** | Sec. 3.1.1, 3.2.1, 3.3.1, 3.4.1, 3.7.4 |

El diagrama está en la [Vista de Casos de Uso](../README.md) del repo, no acá: es una vista
única de toda la plataforma, no una por caso de uso.

## Descripción

Delega la verificación de identidad en el proveedor de identidad de gub.uy y establece en
carga.uy una sesión con los roles del usuario.

## Pre-condiciones

- El usuario posee Usuario gub.uy vigente.
- carga.uy está registrado como cliente ante el proveedor, con sus credenciales fuera del
  repositorio de código (RNF 4.2.5).

## Flujo de eventos

1. El usuario solicita ingresar.
2. El sistema redirige al proveedor de identidad gub.uy.
3. El usuario se autentica con el nivel de garantía requerido.
4. gub.uy redirige de vuelta con un código de autorización.
5. El sistema canjea el código por los tokens, valida firma, emisor, audiencia y vigencia, y
   extrae cédula y correo.
6. El sistema busca un perfil local asociado a esa cédula.
7. Establece la sesión, resuelve roles y permisos, y redirige a la vista correspondiente.
8. Registra el ingreso en el log estructurado con identificador de correlación (RNF 4.4.7).

### Flujos alternativos y excepciones

| | |
|---|---|
| **6a** | No existe perfil local: se ejecuta CU-02 y se continúa en el paso 7. |
| **6b** | Ciudadano sin empresa asociada: sesión con rol mínimo; se informa que un funcionario debe asociarlo a una empresa (Sec. 3.4.2) y sólo quedan habilitadas las funcionalidades públicas. No aplica al Funcionario MTOP, que no se asocia a ninguna empresa y cuyo rol se resuelve por su pertenencia al organismo. |
| **3a** | El usuario cancela o falla la autenticación: retorno a la portada pública, sin sesión. |
| **5a** | Token inválido o expirado: se aborta, se registra el evento de seguridad, no se crea sesión. |
| **2a/4a** | gub.uy no responde: se aplica timeout y se muestra degradación; las funcionalidades públicas siguen disponibles (RNF 4.3.5). |

### Variante móvil

| | |
|---|---|
| **V1** | El flujo se abre en el navegador del sistema y la app canjea el código contra el componente central vía REST sobre HTTPS (RNF 4.1.2), obteniendo token de acceso y de refresco, que almacena de forma segura junto al perfil y los viajes asignados. |
| **V1.a** | Apertura sin conectividad con sesión previa vigente: se permite acceso local a la Guía descargada y al registro de eventos, sin contactar al componente central (Sec. 3.3.4.a/b). |
| **V1.b** | Sin conectividad y sin sesión previa: se deniega el acceso. |

## Post-condiciones

- Existe una sesión autenticada con identidad y roles resueltos, o ninguna sesión.
- El evento de autenticación queda registrado.
- El sistema no almacena credenciales del usuario.
