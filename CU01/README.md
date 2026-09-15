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

```mermaid
%% Figura 3 - Vista de Casos de Uso (foco CU-01)
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
        CU04(["CU-04 · Gestionar empresa de transporte y sus usuarios"]):::uc
        CU05(["CU-05 · Consultar y actualizar el perfil de la empresa"]):::uc
        CU06(["CU-06 · Gestionar vehiculos y habilitaciones (ABM)"]):::uc
        CU07(["CU-07 · Registrar Guia y asignar el viaje"]):::uc
        CU08(["CU-08 · Ejecutar el viaje desde el componente movil"]):::uc
        CU09(["CU-09 · Sincronizar los eventos del componente movil"]):::uc
        CU12(["CU-12 · Presentar descargo sobre un caso"]):::uc
        CU13(["CU-13 · Resolver el caso de fiscalizacion"]):::uc
        CU14(["CU-14 · Fiscalizar permisos y estado de los vehiculos"]):::uc
        CU15(["CU-15 · Monitorear viajes en curso y pesajes"]):::uc
    end

    GUB["Usuario gub.uy<br/>(ID Uruguay)"]:::actor
    PDI["PDI / AGESIC<br/>(DNIC)"]:::actor

    %% Asociaciones actor - caso de uso
    RESP --- CU01
    CHOF --- CU01
    FUNC --- CU01
    CU01 --- GUB
    CU02 --- PDI

    %% Relaciones entre casos de uso
    CU02 -.->|"«extend»"| CU01
    CU04 -.->|"«include»"| CU01
    CU05 -.->|"«include»"| CU01
    CU06 -.->|"«include»"| CU01
    CU07 -.->|"«include»"| CU01
    CU08 -.->|"«include»"| CU01
    CU09 -.->|"«include»"| CU01
    CU12 -.->|"«include»"| CU01
    CU13 -.->|"«include»"| CU01
    CU14 -.->|"«include»"| CU01
    CU15 -.->|"«include»"| CU01
```

## Decisiones del diagrama

- **CU-03 no está conectado a CU-01**, a propósito: el backoffice usa mecanismo interno
  (Sec. 3.6.1), no gub.uy.
- **CU-18 y CU-19 tampoco**: son públicos y no requieren autenticación.
- **`Usuario gub.uy` y `PDI` quedan fuera de la frontera y a la derecha**: son actores
  secundarios (sistemas externos). Convención: actores primarios a la izquierda,
  secundarios a la derecha.
- Dirección de las relaciones: en `«include»` la flecha va **del caso base al incluido**;
  en `«extend»`, **del extensor al extendido**. La asociación actor–caso de uso es una
  línea sin punta.

> `«uses»` es UML 1.x. Desde UML 2 son `«include»` y `«extend»`. La plantilla del SAD
> (Sec. 3.2) lista sólo Caso de Uso, Actor, Asociación y Frontera del Sistema, así que
> estas relaciones son un agregado nuestro, no un requisito.
