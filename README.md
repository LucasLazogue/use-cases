# use-cases — carga.uy

Casos de uso de la plataforma **carga.uy**, Laboratorio TSE 2026.

Una carpeta por caso de uso, con su `README.md`: título, ficha y diagrama de casos de uso
UML en SVG (actores como monigotes, casos de uso como elipses, frontera del sistema).

| Caso de uso | Título | Letra |
|---|---|---|
| [CU01](CU01/) | Autenticarse mediante Usuario gub.uy | 3.1.1, 3.2.1, 3.3.1, 3.4.1, 3.7.4 |

## Diagramas

Los SVG se generan con [`tools/uml-usecase.js`](tools/uml-usecase.js), sin dependencias:

```sh
node tools/uml-usecase.js
```

El script trae las primitivas UML (monigote, elipse, frontera, asociación, `«include»` /
`«extend»`) y una especificación declarativa por figura, así que agregar el diagrama de un
caso de uso nuevo es agregar un objeto con actores, casos de uso y relaciones.
