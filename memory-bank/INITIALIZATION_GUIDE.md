# Memory Bank Initialization Guide

This guide walks through setting up a new memory bank for your project. The process is designed to be executed by Claude Code or similar AI assistants.

## Prerequisites

- A project with existing code
- Basic understanding of the project's purpose
- 30-60 minutes for initial setup

## Phase 1: Project Analysis (10-15 minutes)

### Step 1: Run Project Analysis

Provide this prompt to Claude Code:

```
Please analyze this project and create an initial memory bank structure by:
1. Reading the PROJECT_ANALYSIS_PROMPT.md in memory-bank/prompts/
2. Following its instructions to analyze the codebase
3. Creating the initial core documentation
```

### Step 2: Review Analysis Results

The AI will create:
- Initial project brief
- Technical context documentation  
- Identified patterns
- Suggested structure

## Phase 2: Core Documentation (15-20 minutes)

### Step 3: Create Core Documents

Using the templates in `templates/core/`, create:

#### A. Project Brief (`core/projectbrief.md`)
```yaml
---
title: Project Overview and Goals
category: core
last_verified: YYYY-MM-DD
version: 1.0
dependencies: [techContext.md, systemPatterns.md]
---
```

Include:
- Project purpose and goals
- Target audience
- Success criteria
- Timeline/roadmap
- Key features

#### B. Technical Context (`core/techContext.md`)
```yaml
---
title: Technical Architecture and Stack
category: core
last_verified: YYYY-MM-DD
version: 1.0
dependencies: [projectbrief.md, systemPatterns.md]
---
```

Include:
- Technology stack
- Architecture overview
- Database schema
- External integrations
- Development setup

#### C. System Patterns (`core/systemPatterns.md`)
```yaml
---
title: System Patterns Index
category: core
last_verified: YYYY-MM-DD
version: 1.0
dependencies: [patterns/*.md]
---
```

Include:
- Pattern categories
- Links to specific patterns
- Key principles
- Usage guidelines

#### D. Design System (`core/designSystem.md`)
```yaml
---
title: UI/UX Design System
category: core
last_verified: YYYY-MM-DD
version: 1.0
dependencies: [systemPatterns.md]
---
```

Include:
- UI components
- Styling approach
- Design principles
- Accessibility standards

## Phase 3: Active Development Setup (10-15 minutes)

### Step 4: Initialize Active Directory

Create the following in `active/`:

#### A. Active Context (`active/activeContext.md`)
```markdown
---
title: Current Development State
category: active
last_verified: YYYY-MM-DD
version: 1.0
dependencies: [activeContext-todo.md, activeContext-recent-changes.md]
---

# Active Development Context

## Current Sprint/Phase
[Describe current development focus]

## Active Features
[List features being worked on]

## Known Issues
[Current bugs or blockers]

## Next Steps
[Immediate next actions]
```

#### B. Todo List (`active/activeContext-todo.md`)
```markdown
---
title: Active Todo List
category: active
last_verified: YYYY-MM-DD
version: 1.0
dependencies: [activeContext.md]
---

# Todo List

## High Priority
- [ ] Task 1
- [ ] Task 2

## Medium Priority
- [ ] Task 3
- [ ] Task 4

## Low Priority
- [ ] Task 5
```

#### C. Recent Changes (`active/activeContext-recent-changes.md`)
```markdown
---
title: Recent Development Changes
category: active
last_verified: YYYY-MM-DD
version: 1.0
dependencies: [activeContext.md]
---

# Recent Changes Log

## [Date] - Initial Setup
### What Was Implemented ✅
- Memory bank initialization
- Core documentation created

### Key Technical Details
- Using [technology] version X.Y
- Implemented [pattern name]

### Learnings Documented
- Created initial pattern documentation
```

#### D. Roadmap (`active/roadmap.md`)
```markdown
---
title: Development Roadmap
category: active
last_verified: YYYY-MM-DD
version: 1.0
dependencies: [projectbrief.md]
---

# Development Roadmap

## Phase 1: [Name] (Timeline)
- [ ] Feature 1
- [ ] Feature 2

## Phase 2: [Name] (Timeline)
- [ ] Feature 3
- [ ] Feature 4

## Future Considerations
- Potential feature A
- Potential feature B
```

## Phase 4: Pattern Documentation (10-15 minutes)

### Step 5: Document Existing Patterns

Identify and document patterns already in use:

1. **Framework Patterns**: How the main framework is used
2. **Data Patterns**: Database access, state management
3. **UI Patterns**: Component structure, styling approach
4. **Integration Patterns**: API calls, external services

Create files in `patterns/` following the template:

```markdown
---
title: [Pattern Name]
category: pattern
last_verified: YYYY-MM-DD
version: 1.0
dependencies: [related-patterns.md]
---

# [Pattern Name]

## Overview
[What this pattern solves]

## Implementation
[How to implement with code examples]

## When to Use
[Specific use cases]

## Examples in Codebase
- `path/to/file.ext` - [Usage description]
- `path/to/another.ext` - [Usage description]
```

## Phase 5: Feature Documentation

### Step 6: Document Existing Features

For each major feature already implemented:

```markdown
---
title: [Feature Name]
category: feature
last_verified: YYYY-MM-DD
version: 1.0
dependencies: [related-features.md, patterns-used.md]
---

# [Feature Name]

## Overview
[Feature purpose and description]

## Technical Implementation
[How it's built]

## User Flow
[How users interact with it]

## Configuration
[Any setup or config needed]

## Security Considerations
[Security measures implemented]
```

## Validation Checklist

After initialization, verify:

- [ ] All core documents have metadata headers
- [ ] Dependencies are bidirectional (if A depends on B, B should reference A)
- [ ] Active context reflects current project state
- [ ] At least 3-5 patterns are documented
- [ ] README.md navigation is updated
- [ ] No placeholder content remains
- [ ] All dates are current

## Common Initialization Patterns

### For Web Applications
Focus on:
- Route structure
- Authentication patterns
- API patterns
- Component hierarchy

### For APIs/Services
Focus on:
- Endpoint patterns
- Authentication/authorization
- Data validation
- Error handling

### For Libraries
Focus on:
- Public API design
- Internal architecture
- Testing patterns
- Distribution approach

### For CLI Tools
Focus on:
- Command structure
- Configuration patterns
- Output formatting
- Error messaging

## Post-Initialization

1. **Test the System**: Ask Claude Code to find information using the memory bank
2. **Refine Structure**: Adjust categories or organization as needed
3. **Set Reminders**: Schedule regular maintenance
4. **Team Training**: If applicable, train team on memory bank usage

## Troubleshooting

### "Too Much to Document"
Start with:
- Just the active/ directory
- Top 3 most important patterns
- Core technical context
- Expand gradually

### "Not Sure What's a Pattern"
Look for:
- Repeated code structures
- Consistent approaches
- Team conventions
- Problem solutions used multiple times

### "Documentation Feels Redundant"
Ensure:
- Each document has unique purpose
- No copy-paste between files
- Clear category boundaries
- Focused, specific content

## Next Steps

1. Run the UPDATE_PROMPT.md after your first work session
2. Review MAINTENANCE_GUIDE.md for ongoing procedures
3. Customize templates for your specific needs
4. Begin regular maintenance cycle

Remember: The initial setup is just the beginning. The memory bank becomes more valuable as it grows with your project.