# OrbitJobs Theme Guide - Comprehensive Design System

## Overview

This document defines the complete color system for OrbitJobs with perfect inverse relationships between dark and light themes. Every color in the dark theme has a mathematically calculated light mode equivalent, ensuring visual consistency and proper contrast across both themes.

**Core Principle:** Dark mode background `#101010` becomes light mode background `#EFEFEF` (255 - 16 = 239 for each RGB channel). This inversion logic applies to all neutral colors while preserving the indigo brand color across both themes.

---

## Color Calculation Method

**Inversion Formula:**
For any color with RGB values (R, G, B), the inverse is (255-R, 255-G, 255-B)

**Examples:**

- `#101010` (16, 16, 16) → `#EFEFEF` (239, 239, 239)
- `#1A1A1A` (26, 26, 26) → `#E5E5E5` (229, 229, 229)
- `#FFFFFF` (255, 255, 255) → `#000000` (0, 0, 0)

**Brand Color Exception:**

- Indigo `#6366F1` remains constant in both themes for brand consistency

---

## Complete Color Palette

### Background Colors

| Token Name             | Dark Mode | Light Mode | Usage                                            |
| ---------------------- | --------- | ---------- | ------------------------------------------------ |
| `background.page`      | `#0A0A0A` | `#F5F5F5`  | Main page background, html/body element          |
| `background.primary`   | `#101010` | `#EFEFEF`  | Primary content background, main container       |
| `background.secondary` | `#1A1A1A` | `#E5E5E5`  | Sidebar, cards, elevated sections                |
| `background.tertiary`  | `#242424` | `#DBDBDB`  | Nested cards, code blocks, quoted content        |
| `background.modal`     | `#1A1A1A` | `#E5E5E5`  | Modal dialogs, overlays                          |
| `background.dropdown`  | `#1A1A1A` | `#E5E5E5`  | Dropdown menus, select options                   |
| `background.input`     | `#1F1F1F` | `#E0E0E0`  | Input fields, textareas, form controls           |
| `background.hover`     | `#2A2A2A` | `#D5D5D5`  | Hover state for nav items, dropdowns, list items |
| `background.active`    | `#333333` | `#CCCCCC`  | Active/selected state for interactive elements   |
| `background.skeleton`  | `#1F1F1F` | `#E0E0E0`  | Loading skeleton backgrounds                     |
| `background.tooltip`   | `#2A2A2A` | `#D5D5D5`  | Tooltip backgrounds                              |
| `background.badge`     | `#2A2A2A` | `#D5D5D5`  | Badge backgrounds (neutral)                      |

### Border Colors

| Token Name           | Dark Mode | Light Mode | Usage                                           |
| -------------------- | --------- | ---------- | ----------------------------------------------- |
| `border.default`     | `#2A2A2A` | `#D5D5D5`  | Default borders for cards, sections, dividers   |
| `border.subtle`      | `#1F1F1F` | `#E0E0E0`  | Very subtle borders, light separation           |
| `border.strong`      | `#3A3A3A` | `#C5C5C5`  | Emphasized borders, active borders              |
| `border.input`       | `#2A2A2A` | `#D5D5D5`  | Input field borders (default state)             |
| `border.input.hover` | `#3A3A3A` | `#C5C5C5`  | Input field borders (hover state)               |
| `border.input.focus` | `#6366F1` | `#6366F1`  | Input field borders (focus state) - brand color |
| `border.sidebar`     | `#2A2A2A` | `#D5D5D5`  | Sidebar borders, layout dividers                |
| `border.modal`       | `#2A2A2A` | `#D5D5D5`  | Modal borders                                   |
| `border.dropdown`    | `#2A2A2A` | `#D5D5D5`  | Dropdown menu borders                           |

### Text Colors

| Token Name        | Dark Mode | Light Mode | Usage                                         |
| ----------------- | --------- | ---------- | --------------------------------------------- |
| `text.primary`    | `#FFFFFF` | `#0A0A0A`  | Primary text, headings, body copy             |
| `text.secondary`  | `#A0A0A0` | `#5F5F5F`  | Secondary text, subheadings, metadata         |
| `text.tertiary`   | `#707070` | `#8F8F8F`  | Tertiary text, captions, labels               |
| `text.muted`      | `#505050` | `#AFAFAF`  | Muted text, disabled text, placeholders       |
| `text.inverse`    | `#0A0A0A` | `#FFFFFF`  | Text on colored backgrounds (buttons, badges) |
| `text.link`       | `#6366F1` | `#6366F1`  | Link text - brand color                       |
| `text.link.hover` | `#8184F4` | `#4F52D9`  | Link hover state - lighter/darker indigo      |

### Brand Colors (Indigo - Constant Across Themes)

| Token Name      | Both Modes                | Usage                                            |
| --------------- | ------------------------- | ------------------------------------------------ |
| `brand.primary` | `#6366F1`                 | Primary buttons, primary actions, brand elements |
| `brand.hover`   | `#5558E3`                 | Primary button hover state                       |
| `brand.active`  | `#4245D5`                 | Primary button active/pressed state              |
| `brand.light`   | `#8184F4`                 | Lighter brand color for backgrounds, badges      |
| `brand.subtle`  | `rgba(99, 102, 241, 0.1)` | Very subtle brand backgrounds                    |

### Semantic Colors

#### Success (Green)

| Token Name           | Dark Mode                 | Light Mode               | Usage                     |
| -------------------- | ------------------------- | ------------------------ | ------------------------- |
| `success.text`       | `#10B981`                 | `#059669`                | Success message text      |
| `success.background` | `rgba(16, 185, 129, 0.1)` | `rgba(5, 150, 105, 0.1)` | Success alert backgrounds |
| `success.border`     | `rgba(16, 185, 129, 0.3)` | `rgba(5, 150, 105, 0.3)` | Success alert borders     |

#### Error (Red)

| Token Name         | Dark Mode                | Light Mode               | Usage                   |
| ------------------ | ------------------------ | ------------------------ | ----------------------- |
| `error.text`       | `#EF4444`                | `#DC2626`                | Error message text      |
| `error.background` | `rgba(239, 68, 68, 0.1)` | `rgba(220, 38, 38, 0.1)` | Error alert backgrounds |
| `error.border`     | `rgba(239, 68, 68, 0.3)` | `rgba(220, 38, 38, 0.3)` | Error alert borders     |

#### Warning (Amber)

| Token Name           | Dark Mode                 | Light Mode               | Usage                     |
| -------------------- | ------------------------- | ------------------------ | ------------------------- |
| `warning.text`       | `#F59E0B`                 | `#D97706`                | Warning message text      |
| `warning.background` | `rgba(245, 158, 11, 0.1)` | `rgba(217, 119, 6, 0.1)` | Warning alert backgrounds |
| `warning.border`     | `rgba(245, 158, 11, 0.3)` | `rgba(217, 119, 6, 0.3)` | Warning alert borders     |

#### Info (Blue)

| Token Name        | Dark Mode                 | Light Mode               | Usage                  |
| ----------------- | ------------------------- | ------------------------ | ---------------------- |
| `info.text`       | `#3B82F6`                 | `#2563EB`                | Info message text      |
| `info.background` | `rgba(59, 130, 246, 0.1)` | `rgba(37, 99, 235, 0.1)` | Info alert backgrounds |
| `info.border`     | `rgba(59, 130, 246, 0.3)` | `rgba(37, 99, 235, 0.3)` | Info alert borders     |

### Status Badge Colors

| Status   | Dark Mode BG               | Dark Mode Text | Light Mode BG              | Light Mode Text | Usage                 |
| -------- | -------------------------- | -------------- | -------------------------- | --------------- | --------------------- |
| Pending  | `rgba(245, 158, 11, 0.15)` | `#F59E0B`      | `rgba(217, 119, 6, 0.15)`  | `#D97706`       | Pending status badge  |
| Approved | `rgba(16, 185, 129, 0.15)` | `#10B981`      | `rgba(5, 150, 105, 0.15)`  | `#059669`       | Approved status badge |
| Rejected | `rgba(239, 68, 68, 0.15)`  | `#EF4444`      | `rgba(220, 38, 38, 0.15)`  | `#DC2626`       | Rejected status badge |
| Posted   | `rgba(99, 102, 241, 0.15)` | `#6366F1`      | `rgba(99, 102, 241, 0.15)` | `#6366F1`       | Posted status badge   |

### Shadow System

| Token Name  | Dark Mode                             | Light Mode                            | Usage                           |
| ----------- | ------------------------------------- | ------------------------------------- | ------------------------------- |
| `shadow.sm` | `0 1px 2px 0 rgba(0, 0, 0, 0.5)`      | `0 1px 2px 0 rgba(0, 0, 0, 0.05)`     | Small shadows, subtle elevation |
| `shadow.md` | `0 4px 6px -1px rgba(0, 0, 0, 0.5)`   | `0 4px 6px -1px rgba(0, 0, 0, 0.1)`   | Medium shadows, cards           |
| `shadow.lg` | `0 10px 15px -3px rgba(0, 0, 0, 0.6)` | `0 10px 15px -3px rgba(0, 0, 0, 0.1)` | Large shadows, modals           |
| `shadow.xl` | `0 20px 25px -5px rgba(0, 0, 0, 0.7)` | `0 20px 25px -5px rgba(0, 0, 0, 0.1)` | Extra large shadows, dropdowns  |

---

## Component-Specific Color Usage

### Page Layout

```
Page Background: background.page (#0A0A0A / #F5F5F5)
└─ Main Container: background.primary (#101010 / #EFEFEF)
   ├─ Sidebar: background.secondary (#1A1A1A / #E5E5E5)
   │  └─ Border: border.sidebar (#2A2A2A / #D5D5D5)
   └─ Content Area: background.primary (#101010 / #EFEFEF)
```

**Implementation:**

```typescript
// Page/Layout
<Box bg="background.page">
  <Container bg="background.primary">
    <Sidebar bg="background.secondary" borderRight="1px solid" borderColor="border.sidebar" />
    <Content bg="background.primary" />
  </Container>
</Box>
```

### Sidebar Navigation

**States:**

- **Default:** Background transparent, text `text.secondary`
- **Hover:** Background `background.hover`, text `text.primary`
- **Active:** Background `background.active`, text `text.primary`, left border `brand.primary` (4px)

**Implementation:**

```typescript
<NavLink
  styles={{
    root: {
      color: 'text.secondary',
      '&:hover': {
        backgroundColor: 'background.hover',
        color: 'text.primary',
      },
      '&[data-active]': {
        backgroundColor: 'background.active',
        color: 'text.primary',
        borderLeft: '4px solid',
        borderLeftColor: 'brand.primary',
      },
    },
  }}
/>
```

### Cards & Sections

**Structure:**

- Background: `background.secondary`
- Border: `border.default` (1px solid)
- Padding: 24px (desktop), 16px (mobile)
- Border radius: 8px
- Shadow: `shadow.sm`

**Nested Cards:**

- Background: `background.tertiary`
- Border: `border.subtle`
- All other properties same as parent card

**Implementation:**

```typescript
<Card
  bg="background.secondary"
  style={{
    border: '1px solid',
    borderColor: 'border.default',
    borderRadius: '8px',
    boxShadow: 'shadow.sm',
  }}
>
  {/* Card content */}
  <Card bg="background.tertiary" style={{ border: '1px solid', borderColor: 'border.subtle' }}>
    {/* Nested card content */}
  </Card>
</Card>
```

### Modals

**Structure:**

- Background: `background.modal`
- Border: `border.modal` (1px solid)
- Border radius: 12px
- Shadow: `shadow.xl`
- Max width: 500px (centered)
- Overlay: `rgba(0, 0, 0, 0.75)` (dark mode), `rgba(0, 0, 0, 0.5)` (light mode)

**Implementation:**

```typescript
<Modal
  styles={{
    content: {
      backgroundColor: 'background.modal',
      border: '1px solid',
      borderColor: 'border.modal',
      borderRadius: '12px',
      boxShadow: 'shadow.xl',
    },
    overlay: {
      backgroundColor: theme.colorScheme === 'dark'
        ? 'rgba(0, 0, 0, 0.75)'
        : 'rgba(0, 0, 0, 0.5)',
    },
  }}
/>
```

### Dropdowns & Select Menus

**Structure:**

- Background: `background.dropdown`
- Border: `border.dropdown` (1px solid)
- Border radius: 8px
- Shadow: `shadow.lg`
- Item hover: `background.hover` (SAME as sidebar hover)
- Item active: `background.active`

**Implementation:**

```typescript
<Select
  styles={{
    dropdown: {
      backgroundColor: 'background.dropdown',
      border: '1px solid',
      borderColor: 'border.dropdown',
      borderRadius: '8px',
      boxShadow: 'shadow.lg',
    },
    item: {
      '&[data-hovered]': {
        backgroundColor: 'background.hover', // Same as sidebar hover
      },
      '&[data-selected]': {
        backgroundColor: 'background.active',
      },
    },
  }}
/>
```

### Input Fields

**States:**

- **Default:** Background `background.input`, border `border.input`, text `text.primary`
- **Hover:** Background unchanged, border `border.input.hover`
- **Focus:** Background unchanged, border `border.input.focus` (brand.primary), 2px width
- **Disabled:** Background `background.skeleton`, border `border.subtle`, text `text.muted`
- **Error:** Border `error.text`, helper text `error.text`

**Implementation:**

```typescript
<TextInput
  styles={{
    input: {
      backgroundColor: 'background.input',
      borderColor: 'border.input',
      color: 'text.primary',
      '&:hover': {
        borderColor: 'border.input.hover',
      },
      '&:focus': {
        borderColor: 'border.input.focus',
        borderWidth: '2px',
      },
      '&:disabled': {
        backgroundColor: 'background.skeleton',
        borderColor: 'border.subtle',
        color: 'text.muted',
      },
    },
  }}
/>
```

### Buttons

#### Primary Button (Brand)

- Background: `brand.primary`
- Text: `text.inverse`
- Hover: `brand.hover`
- Active: `brand.active`
- Border: none
- Shadow: `shadow.sm`

#### Secondary Button

- Background: `background.secondary`
- Text: `text.primary`
- Hover: `background.hover`
- Border: `border.default` (1px solid)

#### Ghost Button

- Background: transparent
- Text: `text.secondary`
- Hover: `background.hover`, text `text.primary`
- Border: none

**Implementation:**

```typescript
// Primary Button
<Button
  bg="brand.primary"
  c="text.inverse"
  styles={{
    root: {
      boxShadow: 'shadow.sm',
      '&:hover': {
        backgroundColor: 'brand.hover',
      },
      '&:active': {
        backgroundColor: 'brand.active',
      },
    },
  }}
/>

// Secondary Button
<Button
  variant="outline"
  bg="background.secondary"
  c="text.primary"
  styles={{
    root: {
      borderColor: 'border.default',
      '&:hover': {
        backgroundColor: 'background.hover',
      },
    },
  }}
/>

// Ghost Button
<Button
  variant="subtle"
  c="text.secondary"
  styles={{
    root: {
      '&:hover': {
        backgroundColor: 'background.hover',
        color: 'text.primary',
      },
    },
  }}
/>
```

### Tables

**Structure:**

- Header background: `background.secondary`
- Header text: `text.primary`
- Header border bottom: `border.strong` (2px solid)
- Row background: `background.primary`
- Row border: `border.default` (1px solid)
- Row hover: `background.hover`
- Row selected: `background.active`

**Implementation:**

```typescript
<Table
  styles={{
    thead: {
      backgroundColor: 'background.secondary',
      color: 'text.primary',
      borderBottom: '2px solid',
      borderBottomColor: 'border.strong',
    },
    tbody: {
      tr: {
        backgroundColor: 'background.primary',
        borderBottom: '1px solid',
        borderBottomColor: 'border.default',
        '&:hover': {
          backgroundColor: 'background.hover',
        },
        '&[data-selected]': {
          backgroundColor: 'background.active',
        },
      },
    },
  }}
/>
```

### Badges

**Structure:**

- Background: `background.badge`
- Text: `text.primary`
- Border: `border.subtle`
- Border radius: 4px
- Padding: 4px 8px
- Font size: 12px
- Font weight: 500

**Status Badges:** Use status-specific colors from Status Badge Colors table above

**Implementation:**

```typescript
// Neutral Badge
<Badge bg="background.badge" c="text.primary" style={{ border: '1px solid', borderColor: 'border.subtle' }}>
  Badge Text
</Badge>

// Status Badge (Pending)
<Badge
  bg="rgba(245, 158, 11, 0.15)" // pending background
  c="#F59E0B" // pending text (dark mode)
>
  Pending
</Badge>
```

### Tooltips

**Structure:**

- Background: `background.tooltip`
- Text: `text.primary`
- Border: `border.default`
- Border radius: 6px
- Padding: 6px 12px
- Shadow: `shadow.md`
- Font size: 13px

**Implementation:**

```typescript
<Tooltip
  label="Tooltip text"
  styles={{
    tooltip: {
      backgroundColor: 'background.tooltip',
      color: 'text.primary',
      border: '1px solid',
      borderColor: 'border.default',
      borderRadius: '6px',
      boxShadow: 'shadow.md',
    },
  }}
/>
```

### Loading Skeletons

**Structure:**

- Background: `background.skeleton`
- Border radius: 4px
- Animation: pulse (opacity 0.5 to 1)

**Implementation:**

```typescript
<Skeleton height={20} radius={4} bg="background.skeleton" />
```

### Dividers

**Structure:**

- Color: `border.default`
- Thickness: 1px
- Subtle variant: `border.subtle`

**Implementation:**

```typescript
<Divider color="border.default" />
<Divider color="border.subtle" /> {/* For subtle separations */}
```

---

## Consistency Rules (CRITICAL)

### Rule 1: Unified Hover States

Sidebar navigation hover and dropdown item hover MUST use the exact same background color: `background.hover`

**Correct:**

```typescript
// Sidebar nav hover
backgroundColor: "background.hover"; // #2A2A2A dark, #D5D5D5 light

// Dropdown item hover
backgroundColor: "background.hover"; // #2A2A2A dark, #D5D5D5 light
```

**Incorrect:**

```typescript
// Sidebar nav hover
backgroundColor: "background.hover"; // ✓

// Dropdown item hover
backgroundColor: "#2C2C2C"; // ✗ Different color
```

### Rule 2: No Arbitrary Hex Codes

NEVER use arbitrary hex codes in components. ALWAYS use theme tokens.

**Correct:**

```typescript
<Box bg="background.secondary" style={{ borderColor: 'border.default' }} />
```

**Incorrect:**

```typescript
<Box bg="#1A1A1A" style={{ borderColor: '#2A2A2A' }} /> // ✗ Hardcoded colors
```

### Rule 3: Border Consistency

All card/section borders use `border.default`. All input borders use `border.input`. All subtle separations use `border.subtle`.

### Rule 4: Text Hierarchy

- Headings and primary content: `text.primary`
- Metadata and labels: `text.secondary`
- Captions and small text: `text.tertiary`
- Disabled or placeholder: `text.muted`

### Rule 5: Elevation System

- No elevation: No shadow
- Subtle elevation: `shadow.sm` (cards on page)
- Medium elevation: `shadow.md` (hovering elements, tooltips)
- High elevation: `shadow.lg` (dropdowns, popovers)
- Highest elevation: `shadow.xl` (modals, dialogs)

---

## Accessibility Requirements

### Contrast Ratios (WCAG AA)

All text/background combinations must meet WCAG AA contrast requirements:

- Normal text: 4.5:1 minimum
- Large text (18px+): 3:1 minimum
- UI components: 3:1 minimum

**Verified Combinations:**

- `text.primary` on `background.primary`: ✓ Passes
- `text.primary` on `background.secondary`: ✓ Passes
- `text.secondary` on `background.primary`: ✓ Passes
- `text.tertiary` on `background.primary`: ✓ Passes
- `text.muted` on `background.primary`: Use only for disabled states

### Focus Indicators

All interactive elements MUST have visible focus indicators:

- Focus ring: `border.input.focus` (brand.primary)
- Focus ring width: 2px
- Focus ring offset: 2px
- Focus ring style: solid

**Implementation:**

```typescript
'&:focus-visible': {
  outline: '2px solid',
  outlineColor: 'border.input.focus',
  outlineOffset: '2px',
}
```

---

## Mobile Responsiveness

### Touch Targets

All interactive elements MUST meet minimum touch target size:

- Buttons: 44px minimum height
- Nav items: 44px minimum height
- Checkboxes/Radio: 44px minimum touch area (visible size can be smaller with padding)
- Input fields: 44px minimum height

### Spacing System

Use consistent spacing scale (multiples of 4px):

- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px

### Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

**Component Behavior:**

- Tables convert to stacked cards on mobile
- Sidebar collapses to hamburger menu on mobile
- Modals take full width on mobile with padding
- Navigation items stack vertically on mobile

---

## Implementation Checklist

When implementing any component, verify:

- [ ] Uses theme tokens, not arbitrary hex codes
- [ ] Hover states match (`background.hover` for nav and dropdowns)
- [ ] Border colors are consistent across component type
- [ ] Text hierarchy uses correct token (primary, secondary, tertiary, muted)
- [ ] Focus indicators are visible and use `border.input.focus`
- [ ] Touch targets meet 44px minimum on mobile
- [ ] Contrast ratios meet WCAG AA requirements
- [ ] Shadows match elevation system
- [ ] Component works in both light and dark themes
- [ ] No theme-specific logic in component (theme handles inversion)

---

## Quick Reference Table

| Component          | Background           | Border                  | Hover                       | Text                          |
| ------------------ | -------------------- | ----------------------- | --------------------------- | ----------------------------- |
| Page               | background.page      | none                    | n/a                         | n/a                           |
| Sidebar            | background.secondary | border.sidebar          | n/a                         | text.primary                  |
| Sidebar Nav Item   | transparent          | none                    | background.hover            | text.secondary → text.primary |
| Card/Section       | background.secondary | border.default          | n/a                         | text.primary                  |
| Modal              | background.modal     | border.modal            | n/a                         | text.primary                  |
| Dropdown           | background.dropdown  | border.dropdown         | n/a                         | text.primary                  |
| Dropdown Item      | transparent          | none                    | background.hover            | text.primary                  |
| Input              | background.input     | border.input            | border.input.hover (border) | text.primary                  |
| Button (Primary)   | brand.primary        | none                    | brand.hover                 | text.inverse                  |
| Button (Secondary) | background.secondary | border.default          | background.hover            | text.primary                  |
| Badge              | background.badge     | border.subtle           | n/a                         | text.primary                  |
| Tooltip            | background.tooltip   | border.default          | n/a                         | text.primary                  |
| Table Header       | background.secondary | border.strong (bottom)  | n/a                         | text.primary                  |
| Table Row          | background.primary   | border.default (bottom) | background.hover            | text.primary                  |

---

## Common Mistakes to Avoid

1. **Using different hover colors for sidebar and dropdown**
   - ✗ Wrong: `sidebar: #2A2A2A`, `dropdown: #2C2C2C`
   - ✓ Correct: Both use `background.hover`

2. **Hardcoding hex values**
   - ✗ Wrong: `backgroundColor: '#1A1A1A'`
   - ✓ Correct: `backgroundColor: 'background.secondary'`

3. **Inconsistent border usage**
   - ✗ Wrong: Cards using different border colors
   - ✓ Correct: All cards use `border.default`

4. **Missing focus indicators**
   - ✗ Wrong: Interactive element with no focus state
   - ✓ Correct: All interactive elements show `border.input.focus` on focus

5. **Incorrect text color for background**
   - ✗ Wrong: `text.tertiary` on `background.tertiary` (poor contrast)
   - ✓ Correct: `text.primary` or `text.secondary` on `background.tertiary`

---

## Version History

**Version 1.0** - Initial theme system with complete color palette and component specifications
