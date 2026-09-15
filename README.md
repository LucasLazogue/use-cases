# use-cases — carga.uy

Vista de Casos de Uso de la plataforma **carga.uy**, Laboratorio TSE 2026.
Corresponde a la **sección 3 del SAD**: 3.1 Actores, 3.2 Diagrama de Casos de Uso, y una
carpeta por caso de uso con su descripción y flujos.

## Vista de Casos de Uso

![Vista de Casos de Uso](vista-casos-de-uso.svg)

La plantilla del SAD (3.2) pide cuatro elementos: **Caso de Uso**, **Actor**, **Asociación**
y **Frontera del Sistema**; y sugiere incluir *todos* los casos de uso identificados,
marcando los críticos. Los paquetes internos no son un requisito: agrupan por subsistema
para que el diagrama se pueda leer.

### Relaciones «include» y «extend»

![Relaciones include y extend](relaciones-include-extend.svg)

Van en una figura aparte: catorce dependencias convergiendo en los dos casos de uso de
autenticación vuelven ilegible la vista principal, y la plantilla no las exige.

Dirección de las relaciones (UML 2): **`«include»` va del caso base al incluido** — el base
siempre lo ejecuta; **`«extend»` va del extensor al extendido** — se ejecuta sólo bajo cierta
condición. En UML 1.x la relación `«include»` se llamaba `«uses»`.

## Actores

| Actor | Tipo | Canal |
|---|---|---|
| Responsable de empresa | primario | Web frontoffice |
| Chofer | primario | Componente móvil |
| Funcionario de Fiscalización MTOP | primario | Web frontoffice |
| Autoridad MTOP | primario (sólo lectura) | Web backoffice |
| Administrador | primario | Web backoffice |
| Público general / empresa cliente | primario | Web frontoffice público |
| Usuario gub.uy (ID Uruguay) | secundario — sistema externo | Proveedor de identidad |
| PDI / AGESIC (DNIC) | secundario — sistema externo | Web Services SOAP |
| Sistema de Balanzas | secundario — nodo periférico | Request-response HTTPS |
| Sistema de Tracking | secundario — nodo periférico | Mensajería asincrónica |

## Matriz actor × caso de uso

Cada actor se asocia a los casos de uso en los que **participa**, no sólo a la autenticación.

| Caso de uso | Actores primarios | Actores secundarios |
|---|---|---|
| CU-01 Autenticarse mediante Usuario gub.uy | Responsable, Chofer, Funcionario | Usuario gub.uy |
| CU-02 Completar perfil del ciudadano | Responsable, Chofer | PDI / AGESIC |
| CU-03 Autenticarse en el backoffice | Autoridad, Administrador | — |
| CU-04 Gestionar empresa y sus usuarios | Funcionario | — |
| CU-05 Consultar y actualizar perfil de empresa | Responsable | — |
| CU-06 Gestionar vehículos y habilitaciones | Responsable | — |
| CU-07 Registrar Guía y asignar el viaje | Responsable | — |
| CU-08 Ejecutar el viaje desde el móvil | Chofer | — |
| CU-09 Sincronizar los eventos del móvil | Chofer | — |
| CU-10 Ingerir y procesar eventos de tracking | — | Sistema de Tracking |
| CU-11 Detectar incumplimiento y generar caso | — | Sistema de Balanzas, Responsable (notificación) |
| CU-12 Presentar descargo | Responsable | — |
| CU-13 Resolver el caso de fiscalización | Funcionario | — |
| CU-14 Fiscalizar permisos y estado de vehículos | Funcionario | — |
| CU-15 Monitorear viajes en curso y pesajes | Funcionario | — |
| CU-16 Consultar reportes gerenciales | Autoridad | — |
| CU-17 Parametrizar las reglas de fiscalización | Administrador | — |
| CU-18 Validar los permisos de una empresa | Público general / empresa cliente | — |
| CU-19 Consultar los listados públicos | Público general | — |
| CU-20 Gestionar usuarios y roles *(propuesto)* | Administrador | — |
| CU-21 Gestionar nodos periféricos *(propuesto)* | Administrador | — |

Tres consecuencias de la matriz que se ven en el diagrama:

- **CU-10 y CU-11 no tienen actor humano que los inicie.** Los disparan los nodos periféricos
  y un temporizador. No es un error del diagrama: es la fiscalización automática de la
  Sec. 3.5 de la letra.
- **CU-03 no incluye a CU-01.** El backoffice usa mecanismo interno (Sec. 3.6.1), no gub.uy.
- **CU-18 y CU-19 no incluyen ninguna autenticación**: son públicos.

**CU-20 y CU-21 están marcados `«propuesto»`**: la letra los exige (3.6.3 gestión de usuarios
y roles, 3.6.4 gestión de nodos periféricos) pero todavía no tienen caso de uso redactado.
CU-21 además es precondición de CU-10, que asume el nodo de tracking ya registrado.

## Casos de uso críticos

La plantilla detalla **dos** casos de uso críticos (secciones 3.3 y 3.4), elegidos porque
intervenga el mayor número de componentes arquitectónicos y los más complejos:

| | Caso de uso | Por qué |
|---|---|---|
| 1 | **CU-09** Sincronizar los eventos del móvil | Componente móvil, REST sobre HTTPS, persistencia local, idempotencia y resolución de conflictos |
| 2 | **CU-11** Detectar un incumplimiento | Mensajería asincrónica, Sistema de Balanzas, pista de auditoría, notificación y umbrales parametrizables |

## Casos de uso

| Carpeta | Caso de uso | Letra |
|---|---|---|
| [CU01](CU01/) | Autenticarse mediante Usuario gub.uy | 3.1.1, 3.2.1, 3.3.1, 3.4.1, 3.7.4 |

## Cómo regenerar los diagramas

Las fuentes son PlantUML (`.puml`); los `.svg` son el render y se versionan para que GitHub
los muestre. Con PlantUML instalado localmente:

```sh
plantuml -tsvg vista-casos-de-uso.puml relaciones-include-extend.puml
```

Sin instalar nada, [`tools/render-puml.js`](tools/render-puml.js) renderiza contra el
servidor público de PlantUML (requiere red; el diagrama se envía a plantuml.com):

```sh
node tools/render-puml.js vista-casos-de-uso.puml vista-casos-de-uso.svg
node tools/render-puml.js relaciones-include-extend.puml relaciones-include-extend.svg
```
