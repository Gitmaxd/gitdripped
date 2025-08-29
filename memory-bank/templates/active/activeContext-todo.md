---
title: Active Todo List
category: active
last_verified: YYYY-MM-DD
version: 1.0
dependencies: [activeContext.md, roadmap.md]
---

# Todo List

*Last Updated: YYYY-MM-DD*

## Critical/Urgent 🔴
Items that block others or have immediate deadlines

- [ ] [Task description] - Due: [Date]
  - Blocker for: [What it blocks]
  - Assigned to: [Person]
  - Context: [Additional info]

## High Priority 🟡
Important items that should be completed soon

- [ ] [Task description]
  - Impact: [What this enables]
  - Estimated effort: [Time]
  - Dependencies: [What needs to be done first]

- [ ] [Task description]
  - Related to: [Feature/issue]
  - Notes: [Additional context]

## Medium Priority 🟢
Regular development tasks

### Features
- [ ] Implement [feature name]
  - Spec: [Link to spec]
  - Pattern: [Which pattern to follow]

- [ ] Complete [feature name]
  - Remaining work: [What's left]
  - Testing needed: [Type of tests]

### Bug Fixes
- [ ] Fix [bug description]
  - Reported by: [Source]
  - Reproduction: [Steps]
  - Impact: [Who's affected]

### Refactoring
- [ ] Refactor [component/module]
  - Reason: [Why needed]
  - Approach: [How to do it]

### Documentation
- [ ] Document [feature/API]
  - Type: [User/technical/API]
  - Location: [Where to put it]

- [ ] Update [existing docs]
  - Changes: [What needs updating]

## Low Priority ⚪
Nice to have, or future considerations

### Improvements
- [ ] Optimize [what]
  - Current: [Metric]
  - Target: [Goal]

- [ ] Enhance [feature]
  - Idea: [Description]
  - Benefit: [Why do it]

### Technical Debt
- [ ] Clean up [what]
  - Issue: [Current problem]
  - Solution: [Approach]

### Research
- [ ] Investigate [technology/approach]
  - Purpose: [Why research this]
  - Timeframe: [When needed]

## Completed Recently ✅

### [Date]
- [x] ~~[Completed task]~~ ✅
  - Result: [What was achieved]
  - Follow-up: [Any new tasks created]

- [x] ~~[Completed task]~~ ✅
  - Merged: PR #[number]

### [Previous Date]
- [x] ~~[Completed task]~~ ✅
- [x] ~~[Completed task]~~ ✅

## Backlog 📋
Items not yet prioritized

### Feature Ideas
- [ ] [Feature concept]
  - Rationale: [Why valuable]
  - Complexity: [High/Medium/Low]

### Future Improvements
- [ ] [Improvement idea]
- [ ] [Improvement idea]

### Long-term Goals
- [ ] [Strategic item]
- [ ] [Strategic item]

## Blocked/On Hold 🚫

### Blocked Items
- [ ] ⏸️ [Task] - Blocked by: [What's blocking]
  - Need: [What would unblock]
  - Impact: [What can't proceed]

### On Hold
- [ ] ⏸️ [Task] - Reason: [Why on hold]
  - Resume when: [Condition]

## Task Organization

### By Component
**Frontend**
- [ ] [Frontend task]
- [ ] [Frontend task]

**Backend**
- [ ] [Backend task]
- [ ] [Backend task]

**Infrastructure**
- [ ] [Infra task]
- [ ] [Infra task]

### By Sprint/Milestone
**Current Sprint**
- [ ] [Sprint task]
- [ ] [Sprint task]

**Next Sprint**
- [ ] [Future task]
- [ ] [Future task]

## Notes

### Task Guidelines
- Use checkboxes for all tasks
- Include context and dependencies
- Update status regularly
- Move completed items to "Completed Recently"
- Archive old completed items monthly

### Priority Levels
- 🔴 Critical: Blocks work or has immediate deadline
- 🟡 High: Important for current sprint
- 🟢 Medium: Regular work items
- ⚪ Low: Nice to have
- 🚫 Blocked: Cannot proceed

### Task Format
```markdown
- [ ] [Clear action verb] [specific task description]
  - Context: [Why this task exists]
  - Dependencies: [What it needs/blocks]
  - Assigned: [Who's responsible]
  - Due: [If applicable]
```

---

*For current development state, see [active context](./activeContext.md). For recent completions and changes, see [recent changes](./activeContext-recent-changes.md).*