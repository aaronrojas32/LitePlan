**Is your feature request related to a problem? Please describe.**
In large-scale Minecraft projects (mega-builds, technical farms, perimeter structures), builders and redstone engineers manage resources in containers: **Stacks** (64 items), **Shulker Boxes** (27 stacks = 1,728 blocks), and **Double Chests** (54 stacks = 3,456 blocks).

Currently, LitePlan only allows single-unit increments (`+1`, `-1`) or single stacks (`+64`, `-64`). Having to repeatedly click `+64` to register multiple shulkers of stone or not being able to see at a glance how many full shulkers or double chests a quantity represents slows down material gathering in survival.

---

**Describe the solution you'd like**

### 1. Simultaneous 4-Tier Quantity Display
Across all material cards (especially in **Gather $\rightarrow$ Raw Resources** and **Gather $\rightarrow$ Build Objects**, as well as **Material Details** and **Dashboard**), show a multi-scale breakdown:

| Unit Level | Example (4,800 blocks @ 64 stack size) |
| :--- | :--- |
| **Total Items** | `4,800 blocks` |
| **Stacks & Remainder** | `75 stacks + 0 items` (`75s 0`) |
| **Shulker Boxes** | `2 Shulkers + 21 stacks` (`2.77 SB`) |
| **Double Chests** | `1 Double Chest + 21 stacks` (`1.38 DC`) |

### 2. Adaptive Smart Quick Increment Controls
Add responsive quick increment buttons based on the total volume of the item:
- **`+1` / `-1`**: Fine single-unit adjustment.
- **`+1s` / `-1s`**: Adjust by 1 exact stack ($\pm 64$ or $\pm 16$ based on item stackSize).
- **`+1 SB`**: Add 1 full Shulker Box ($+27\text{ stacks} = +1,728\text{ items}$). *Enabled if total or missing $\ge 27$ stacks*.
- **`+1 DC`**: Add 1 full Double Chest ($+54\text{ stacks} = +3,456\text{ items}$). *Enabled for large-volume materials*.
- **`Fill All`**: One-click quick button to mark 100% of remaining missing items.

---

**Describe alternatives you've considered**
- Manual calculator conversion: inconvenient and prone to human calculation errors while playing in survival.
- Pure numeric inputs without quick container increments: requires frequent keyboard interaction while playing.

---

**Additional context & ideas included**
1. **Storage Tooltip / Popover with Pixelated Icons**:
   - Hovering over any quantity shows a popover with visual icons for Double Chests ($\times N$), Shulkers ($\times N$), Stacks ($\times N$), and loose items.
2. **Dynamic Stack Size Adaptation (64, 16, or 1)**:
   - Automatic formula adjustment for 16-stack items (Ender Pearls, Eggs, Signs $\rightarrow 432/\text{shulker}$) and non-stackables (27/shulker).
3. **Default Display Unit Preference in Settings (`⚙️`)**:
   - Allow users to select their preferred default column display (Total Items / Compact Stacks / Shulkers).
4. **Shulker Unboxing Checklist Mode**:
   - Toggle to mark complete delivered physical shulkers at the build site.

---

**Do you want to work on this issue?**
- [x] Yes
- [ ] No
