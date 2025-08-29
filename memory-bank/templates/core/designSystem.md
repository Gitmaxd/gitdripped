---
title: Design System - UI/UX Guidelines
category: core
last_verified: YYYY-MM-DD
version: 1.0
dependencies: [systemPatterns.md, patterns/ui-patterns.md]
---

# Design System

## Design Principles

### Core Principles
1. **[Principle 1]**: [Description]
2. **[Principle 2]**: [Description]
3. **[Principle 3]**: [Description]

### User Experience Goals
- [Goal 1]: [How we achieve it]
- [Goal 2]: [How we achieve it]
- [Goal 3]: [How we achieve it]

## Visual Design

### Color Palette

#### Primary Colors
```css
--primary-50:  #[hex];  /* Lightest */
--primary-100: #[hex];
--primary-200: #[hex];
--primary-300: #[hex];
--primary-400: #[hex];
--primary-500: #[hex];  /* Base */
--primary-600: #[hex];
--primary-700: #[hex];
--primary-800: #[hex];
--primary-900: #[hex];  /* Darkest */
```

#### Secondary Colors
[Similar structure]

#### Semantic Colors
```css
--success:    #[hex];
--warning:    #[hex];
--error:      #[hex];
--info:       #[hex];
```

### Typography

#### Font Stack
```css
--font-sans: [Font], system-ui, sans-serif;
--font-mono: [Font], monospace;
```

#### Type Scale
```css
--text-xs:   0.75rem;   /* 12px */
--text-sm:   0.875rem;  /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg:   1.125rem;  /* 18px */
--text-xl:   1.25rem;   /* 20px */
--text-2xl:  1.5rem;    /* 24px */
--text-3xl:  1.875rem;  /* 30px */
--text-4xl:  2.25rem;   /* 36px */
```

#### Font Weights
```css
--font-light:    300;
--font-normal:   400;
--font-medium:   500;
--font-semibold: 600;
--font-bold:     700;
```

### Spacing System

```css
--space-1:  0.25rem;  /* 4px */
--space-2:  0.5rem;   /* 8px */
--space-3:  0.75rem;  /* 12px */
--space-4:  1rem;     /* 16px */
--space-5:  1.25rem;  /* 20px */
--space-6:  1.5rem;   /* 24px */
--space-8:  2rem;     /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

### Breakpoints

```css
--screen-sm: 640px;   /* Mobile landscape */
--screen-md: 768px;   /* Tablet */
--screen-lg: 1024px;  /* Desktop */
--screen-xl: 1280px;  /* Large desktop */
--screen-2xl: 1536px; /* Extra large */
```

## Component Library

### Buttons

#### Primary Button
```html
<button class="btn btn-primary">
  Button Text
</button>
```

Variants:
- `.btn-primary` - Primary action
- `.btn-secondary` - Secondary action
- `.btn-ghost` - Tertiary action
- `.btn-danger` - Destructive action

Sizes:
- `.btn-sm` - Small
- `.btn-md` - Medium (default)
- `.btn-lg` - Large

States:
- `:hover` - Hover state
- `:active` - Active state
- `:disabled` - Disabled state
- `.loading` - Loading state

### Forms

#### Input Fields
```html
<div class="form-group">
  <label for="input" class="form-label">Label</label>
  <input type="text" id="input" class="form-input" />
  <span class="form-hint">Helper text</span>
</div>
```

#### Validation States
- `.is-valid` - Valid input
- `.is-invalid` - Invalid input
- `.is-warning` - Warning state

### Cards

```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Title</h3>
  </div>
  <div class="card-body">
    Content
  </div>
  <div class="card-footer">
    Actions
  </div>
</div>
```

### Navigation

#### Primary Navigation
```html
<nav class="nav-primary">
  <a href="#" class="nav-link active">Active</a>
  <a href="#" class="nav-link">Link</a>
</nav>
```

#### Breadcrumbs
```html
<nav class="breadcrumb">
  <a href="#" class="breadcrumb-item">Home</a>
  <span class="breadcrumb-separator">/</span>
  <a href="#" class="breadcrumb-item">Category</a>
  <span class="breadcrumb-separator">/</span>
  <span class="breadcrumb-item active">Current</span>
</nav>
```

## Layout Patterns

### Grid System
```css
.container {
  max-width: var(--screen-xl);
  margin: 0 auto;
  padding: 0 var(--space-4);
}

.grid {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: repeat(12, 1fr);
}
```

### Common Layouts

#### Two Column
```html
<div class="layout-two-column">
  <aside class="sidebar">Sidebar</aside>
  <main class="content">Main Content</main>
</div>
```

#### Dashboard
```html
<div class="layout-dashboard">
  <header class="header">Header</header>
  <nav class="sidebar">Navigation</nav>
  <main class="main">Content</main>
</div>
```

## Icons & Images

### Icon System
- Library: [Icon library name]
- Size variants: 16px, 20px, 24px
- Style: [Outline/Solid/etc]

### Image Guidelines
- Formats: WebP with fallbacks
- Responsive: Multiple sizes
- Lazy loading: Implemented
- Alt text: Required

## Motion & Animation

### Timing Functions
```css
--ease-in:     cubic-bezier(0.4, 0, 1, 1);
--ease-out:    cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

### Duration Scale
```css
--duration-75:  75ms;
--duration-150: 150ms;
--duration-300: 300ms;
--duration-500: 500ms;
```

### Common Animations
- Fade in/out
- Slide in/out
- Scale
- Skeleton loading

## Accessibility

### WCAG Compliance
- Target: WCAG 2.1 AA
- Color contrast: 4.5:1 minimum
- Focus indicators: Visible
- Screen reader: Fully supported

### Keyboard Navigation
- Tab order: Logical
- Skip links: Implemented
- Focus trap: For modals
- Shortcuts: Documented

### ARIA Guidelines
- Landmarks: Used appropriately
- Labels: All interactive elements
- Live regions: For dynamic content
- Descriptions: For complex elements

## Dark Mode

### Implementation
```css
[data-theme="dark"] {
  --background: #[hex];
  --foreground: #[hex];
  /* Override colors */
}
```

### Considerations
- Contrast adjustments
- Image filters
- Syntax highlighting
- User preference detection

## Responsive Design

### Mobile First
```css
/* Base mobile styles */
.component { }

/* Tablet and up */
@media (min-width: 768px) {
  .component { }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .component { }
}
```

### Touch Targets
- Minimum size: 44x44px
- Spacing: 8px minimum
- Hover states: Removed on touch

## Code Examples

### Component Template
```jsx
// Example React component
function Button({ variant, size, children, ...props }) {
  const classes = clsx(
    'btn',
    `btn-${variant}`,
    `btn-${size}`
  );
  
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
```

### Styling Pattern
```css
/* Component styles */
.component {
  /* Layout */
  display: flex;
  
  /* Spacing */
  padding: var(--space-4);
  
  /* Typography */
  font-size: var(--text-base);
  
  /* Colors */
  color: var(--foreground);
  background: var(--background);
  
  /* Borders */
  border: 1px solid var(--border);
  border-radius: var(--radius);
  
  /* Effects */
  transition: all var(--duration-150) var(--ease-out);
}
```

## Tools & Resources

### Design Tools
- Design software: [Tool name]
- Prototyping: [Tool name]
- Handoff: [Tool name]

### Development Tools
- Component library: [Library]
- CSS framework: [Framework]
- Build tools: [Tools]

### Documentation
- Storybook: [URL]
- Design tokens: [Location]
- Component docs: [Location]

## Maintenance

### Review Process
- Quarterly design review
- Component audit
- Accessibility testing
- Performance review

### Version Control
- Design tokens versioned
- Breaking changes documented
- Migration guides provided

### Contribution
- Design proposal process
- Review requirements
- Testing checklist
- Documentation standards