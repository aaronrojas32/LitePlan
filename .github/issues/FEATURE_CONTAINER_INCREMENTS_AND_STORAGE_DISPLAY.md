---
title: "[FEATURE] Advanced Multi-Container Quantity Display & Smart Quick Increment Buttons (+1 Stack, +1 Shulker, +1 Double Chest)"
labels: "enhancement, ui/ux, calculations, good first issue"
assignees: ''
---

## 📌 Contexto & Motivación
Actualmente en LitePlan, la gestión de inventario y recolección (especialmente en la sección **Gather** y en la tabla de materiales de **Build**) permite incrementar/decrementar ítems en pasos unitarios (`+1`, `-1`) o en stacks simples (`+64`, `-64`).

Sin embargo, en proyectos masivos de Minecraft (megaconstrucciones, granjas técnicas, estructuras perimetrales), los jugadores manejan los recursos en **cajas de Shulker** (27 stacks = 1.728 bloques) y **Cofres Dobles** (54 stacks = 3.456 bloques). 

Tener que pulsar repetidamente `+64` para registrar 10 shulkers de piedra o no poder visualizar de un vistazo cuántos cofres dobles / shulkers completos representa una cantidad ralentiza el flujo de trabajo del constructor.

---

## 🎯 Solución Propuesta

### 1. Visualización Multi-Unidad Simultánea en Tiempo Real
En todas las tarjetas de materiales (especialmente en **Gather $\rightarrow$ Raw Resources** y **Gather $\rightarrow$ Build Objects**, así como en **MaterialDetails** y el **Dashboard**), mostrar un bloque informativo con 4 niveles de granularidad:

| Unidad | Ejemplo (Cantidad: 4.800 bloques de 64/stack) |
| :--- | :--- |
| **Total Items** | `4.800 bloques` |
| **Stacks & Resto** | `75 stacks + 0 ítems` (`75s`) |
| **Shulkers** | `2 Shulkers + 21 stacks` (`2.77 SB`) |
| **Cofres Dobles** | `1 Cofre Doble + 21 stacks` (`1.38 DC`) |

---

### 2. Botones de Incremento Rápido Inteligentes (+1 Stack, +1 Shulker, +1 Cofre Doble)
Añadir controles de acción rápida adaptativos según el volumen total del material:

- **`+1` / `-1`**: Ajuste fino unitario.
- **`+1s` / `-1s` (+64)**: Añadir/quitar 1 stack exacto (o 16 para ítems como perlas de ender).
- **`+1 SB` (+27 stacks)**: Añadir 1 caja de Shulker completa (1.728 ítems). *Solo visible/habilitado si el total o faltante es $\ge 27$ stacks*.
- **`+1 DC` (+54 stacks)**: Añadir 1 Cofre Doble completo (3.456 ítems). *Habilitado para materiales de gran volumen*.
- **`Completar Todo (Fill All)`**: Botón rápido para marcar el 100% de la cantidad faltante de un ítem con un solo clic.

---

### 💡 Ideas Adicionales Incluidas para Mejorar la Experiencia

1. **Storage Popover / Tooltip Gráfico con Iconos Pixelados**:
   - Al pasar el cursor por encima de cualquier cantidad en cualquier tabla o tarjeta, desplegar un popover visual con:
     - 📦 Icono de Cofre Doble $\times$ cantidad.
     - 🟣 Icono de Shulker Box $\times$ cantidad.
     - 🧱 Icono de Stack $\times$ cantidad.
     - ▫️ Ítems sueltos.
2. **Detección Automática de Stack Size Especial (16 o 1)**:
   - Los cálculos de Shulker y Cofres Dobles se adaptan dinámicamente:
     - Ítems de 64: 1 Shulker = 1.728 ítems.
     - Ítems de 16 (Ender Pearls, Huevos, Carteles, Cubos de nieve): 1 Shulker = 432 ítems (27 stacks $\times$ 16).
     - Ítems no apilables (Armaduras, Pociones, Herramientas): 1 Shulker = 27 ítems.
3. **Selector de Granularidad por Defecto en Ajustes (`⚙️`)**:
   - Permitir al usuario elegir cómo prefiere que se listen las cantidades en las tablas de forma predeterminada:
     - `[ ] Ítems totales (ej. 3.456)`
     - `[x] Stacks compactos (ej. 54s)`
     - `[ ] Shulker Boxes (ej. 2 SB)`
4. **Modo Checklist "Shulker Unboxing"**:
   - Para jugadores que colocan shulkers marcados en sus zonas de construcción, poder marcar con un toggle "1 Shulker entregado en obra".

---

## 📂 Archivos Involucrados para la Implementación (Para Mañana)
- `src/lib/minecraft/storageCalculator.ts`: Ampliar funciones de desglose exacto de shulkers y cofres dobles.
- `src/components/GatheringList.tsx`: Integrar los botones `+1s`, `+1 SB`, `+1 DC`, `Fill All` y los chips de almacenamiento.
- `src/components/MaterialDetails.tsx`: Mostrar el bloque visual de 4 unidades.
- `src/components/MaterialTable.tsx`: Añadir columna / tooltip de Shulkers y Stacks.
- `src/test/storageCalculator.test.ts`: Añadir tests exhaustivos de cálculo para items de stack 64, 16 y 1.

---

**Do you want to work on this issue?**
- [x] Yes
- [ ] No
