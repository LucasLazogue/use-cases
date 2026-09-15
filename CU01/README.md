# CU-01 — Autenticarse mediante Usuario gub.uy

Delega la verificación de identidad en el proveedor de identidad de gub.uy y establece en
carga.uy una sesión con los roles del usuario.

| | |
|---|---|
| **Actor principal** | Ciudadano (responsable o chofer) / Funcionario de Fiscalización MTOP |
| **Actor secundario** | Usuario gub.uy (ID Uruguay) |
| **Canales** | frontoffice Web y componente móvil |
| **Relación** | `«include»` de todos los CU no públicos del frontoffice y del móvil |
| **Letra** | Sec. 3.1.1, 3.2.1, 3.3.1, 3.4.1, 3.7.4 |

## Diagrama de casos de uso

![CU-01 — diagrama de casos de uso](cu01.svg)

Con las relaciones `«include»` de todos los casos de uso no públicos:

![CU-01 con las relaciones «include»](cu01-include.svg)

Los dos SVG los genera [`tools/uml-usecase.js`](../tools/uml-usecase.js) — sin dependencias,
`node tools/uml-usecase.js` desde la raíz del repo.

## Decisiones del diagrama

- **CU-03 no está conectado a CU-01**, a propósito: el backoffice usa mecanismo interno
  (Sec. 3.6.1), no gub.uy.
- **CU-18 y CU-19 tampoco**: son públicos y no requieren autenticación.
- **Todos los actores van fuera de la frontera del sistema.** `Usuario gub.uy` y
  `PDI / AGESIC` son actores secundarios (sistemas externos), no casos de uso.
- Dirección de las relaciones: en `«include»` la flecha va **del caso base al incluido**;
  en `«extend»`, **del extensor al extendido**. La asociación actor–caso de uso es una
  línea sin punta.
- CU-01 va resaltado por ser **caso de uso crítico** para la arquitectura.

> `«uses»` es UML 1.x. Desde UML 2 son `«include»` y `«extend»`. La plantilla del SAD
> (Sec. 3.2) lista sólo Caso de Uso, Actor, Asociación y Frontera del Sistema, así que
> estas relaciones son un agregado nuestro, no un requisito.

<details>
<summary>Fuente Mermaid (alternativa)</summary>

Mermaid no tiene diagrama de casos de uso UML: no hay monigotes, los casos de uso no son
elipses y con muchas relaciones `«include»` convergiendo queda ilegible. Se mantiene sólo
como versión rápida de editar.

```mermaid
flowchart LR
    classDef actor   fill:#ffffff,stroke:#334155,stroke-width:1.5px,color:#0f172a
    classDef uc      fill:#eef4ff,stroke:#94a3b8,color:#0f172a
    classDef critico fill:#dbeafe,stroke:#1d4ed8,stroke-width:3px,color:#0f172a

    RESP["Responsable<br/>de empresa"]:::actor
    CHOF["Chofer"]:::actor
    FUNC["Funcionario de<br/>Fiscalizacion MTOP"]:::actor

    subgraph SYS["carga.uy"]
        direction TB
        CU01(["CU-01 · Autenticarse mediante Usuario gub.uy"]):::critico
        CU02(["CU-02 · Completar perfil del ciudadano en el primer ingreso"]):::uc
    end

    GUB["Usuario gub.uy<br/>(ID Uruguay)"]:::actor
    PDI["PDI / AGESIC<br/>(DNIC)"]:::actor

    RESP --- CU01
    CHOF --- CU01
    FUNC --- CU01
    CU01 --- GUB
    CU02 --- PDI

    CU02 -.->|"«extend»"| CU01
```

</details>
