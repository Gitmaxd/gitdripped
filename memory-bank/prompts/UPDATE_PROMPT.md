# Memory Bank Update Prompt

## Purpose
This prompt template guides AI assistants to properly update the memory bank after completing work sessions, ensuring consistent documentation and maintaining the knowledge base integrity.

---

## PROMPT TO USE:

Please update the memory bank to reflect the work completed in this session. Follow the memory bank maintenance procedures and create appropriate documentation based on what was implemented.

### Update Process:

1. **Analyze Session Work**
   - Review all files that were created, modified, or deleted
   - Identify key features implemented or bugs fixed
   - Note any architectural decisions or pattern changes
   - Document any learnings or challenges encountered

2. **Determine Update Scope**
   Based on the work completed, update the following as needed:

   **For Daily Work:**
   - Update `active/activeContext-recent-changes.md` with a summary of changes
   - Update `active/activeContext-todo.md` to mark completed tasks and add new ones
   - Update `active/activeContext.md` if there were major state changes
   - Update `active/activeContext-current-status.md` with current state

   **For Feature Implementation:**
   - Create or update feature documentation in `features/` directory
   - Update `patterns/` files if new patterns were established
   - Update `technical/` if there were technical learnings
   - Move completed specs from `active/` to `features/`

   **For Bug Fixes or Refactoring:**
   - Document in `active/activeContext-recent-changes.md`
   - Update relevant pattern files if approaches changed
   - Archive outdated documentation if necessary
   - Create technical learning doc if significant

   **For Pattern Changes:**
   - Update or create pattern documentation in `patterns/`
   - Note breaking changes or migrations needed
   - Update dependent feature documentation
   - Add examples from current implementation

3. **File Updates Required**

   a) **activeContext-recent-changes.md**
      Add a new section with today's date:
      ```markdown
      ## [YYYY-MM-DD] - [Brief Description]
      
      ### What Was Implemented ✅
      - **[Component/Feature Name]**: [What was done]
        - [Specific change 1]
        - [Specific change 2]
        - Files affected: `path/to/file1.ext`, `path/to/file2.ext`
      
      ### Key Technical Details
      - **Pattern Used**: [Pattern name and why]
      - **Architecture Changes**: [If any]
      - **Performance Impact**: [If measurable]
      - **Breaking Changes**: [If any]
      
      ### Learnings Documented
      - Created/Updated `[file.md]` with [what was documented]
      - Discovered [insight] leading to [action]
      ```

   b) **activeContext-todo.md**
      Update task status:
      ```markdown
      ## High Priority
      - [x] ~~Completed task~~ ✅ [Date]
      - [ ] Remaining task
      - [ ] New task discovered during work
      
      ## Medium Priority
      - [ ] Task promoted from low priority
      - [ ] New task from today's work
      ```

   c) **Feature Documentation** (if new feature)
      Create with full template:
      ```markdown
      ---
      title: [Feature Name]
      category: feature
      last_verified: YYYY-MM-DD
      version: 1.0
      dependencies: [patterns/used-pattern.md, related-feature.md]
      ---
      
      # [Feature Name]
      
      ## Overview
      [What this feature does and why it exists]
      
      ## Technical Implementation
      
      ### Architecture
      [How it fits into the system]
      
      ### Key Components
      - `path/to/component.ext`: [Purpose]
      - `path/to/another.ext`: [Purpose]
      
      ### Data Flow
      [How data moves through the feature]
      
      ## User Flow
      1. User action
      2. System response
      3. Result
      
      ## Configuration
      ```yaml
      # Required configuration
      ```
      
      ## API Reference
      [If applicable]
      
      ## Security Considerations
      - [Consideration 1]
      - [Consideration 2]
      
      ## Testing
      - Unit tests: `path/to/tests`
      - Integration tests: `path/to/tests`
      
      ## Future Enhancements
      - [Potential improvement]
      ```

   d) **Pattern Updates** (if patterns changed)
      Update existing or create new:
      ```markdown
      ## Pattern: [Name]
      
      ### Updated: [Date]
      [What changed and why]
      
      ### Implementation
      ```[language]
      // Updated example
      ```
      
      ### Migration Guide
      [If breaking change]
      ```

   e) **Technical Learnings** (if applicable)
      Document discoveries:
      ```markdown
      ---
      title: [Learning Title]
      category: technical
      last_verified: YYYY-MM-DD
      version: 1.0
      dependencies: [related-technical-docs.md]
      ---
      
      # [Learning Title]
      
      ## Problem
      [What issue was encountered]
      
      ## Discovery
      [What was learned]
      
      ## Solution
      [How it was resolved]
      
      ## Implementation
      ```[language]
      // Code example
      ```
      
      ## Prevention
      [How to avoid in future]
      ```

4. **Cross-Reference Updates**
   - Update README.md if new important files were added
   - Update dependencies in related files' metadata
   - Ensure all file references use relative paths
   - Check for orphaned references to updated files

5. **Quality Checks**
   Verify:
   - [ ] All dates are today's date (not future dates)
   - [ ] File paths are correct relative paths
   - [ ] Metadata headers are complete
   - [ ] No redundant information across files
   - [ ] Technical details are accurate
   - [ ] Code examples are from actual implementation
   - [ ] Links to related files work
   - [ ] No sensitive information included

### Summary Creation

If this was a major update (new feature, significant refactoring, or multiple pattern changes), create a summary:

```markdown
# Memory Bank Update Summary - [YYYY-MM-DD]

## Overview
[1-2 sentences summarizing the session's work]

## Files Created
1. `path/to/new/file.md` - [Purpose]
2. `path/to/another/file.md` - [Purpose]

## Files Updated
1. `path/to/updated/file.md` - [What changed]
2. `path/to/another/update.md` - [What changed]

## Key Concepts Documented
- **[Concept 1]**: [Brief description]
- **[Concept 2]**: [Brief description]

## Impact on Project
- [How this work advances the project]
- [Any architectural improvements]
- [Technical debt addressed]

## Follow-up Tasks
- [ ] [Task identified during work]
- [ ] [Documentation to be completed]
```

### What NOT to do:
- Don't create redundant documentation
- Don't update files that weren't affected by the session
- Don't use absolute file paths
- Don't forget to update the last_verified date
- Don't include sensitive information (API keys, passwords)
- Don't document trivial changes (typos, formatting)
- Don't create empty or placeholder sections

### Examples by Work Type

#### Example 1: Feature Implementation
```markdown
## 2024-03-15 - User Authentication System

### What Was Implemented ✅
- **JWT Authentication**: Complete auth flow with refresh tokens
  - Login endpoint with rate limiting
  - Token refresh mechanism
  - Logout with token invalidation
  - Files: `api/auth/*`, `middleware/auth.js`, `models/User.js`

### Key Technical Details
- **Pattern Used**: JWT with refresh token rotation
- **Security**: bcrypt for passwords, HTTP-only cookies for tokens
- **Performance**: Redis for token blacklist, 100ms average auth check

### Learnings Documented
- Created `features/authentication.md` with full implementation details
- Updated `patterns/api-patterns.md` with auth middleware pattern
- Added security considerations to `technical/security-practices.md`
```

#### Example 2: Bug Fix
```markdown
## 2024-03-15 - Fixed Memory Leak in WebSocket Handler

### What Was Implemented ✅
- **WebSocket Cleanup**: Proper connection cleanup on disconnect
  - Added event listener removal
  - Implemented connection timeout
  - Fixed memory leak in connection pool
  - Files: `services/websocket.js`, `utils/connectionPool.js`

### Key Technical Details
- **Root Cause**: Event listeners not being removed on disconnect
- **Solution**: Implemented cleanup function with WeakMap for tracking
- **Impact**: Memory usage reduced by 60% under load

### Learnings Documented
- Created `technical/websocket-memory-leak-fix.md`
- Updated `patterns/websocket-patterns.md` with cleanup pattern
```

---

## Usage Instructions

1. Copy the prompt section above (everything between "PROMPT TO USE:" and this section)
2. After completing work in a session, paste this prompt to your AI assistant
3. The AI will analyze the session and create appropriate memory bank updates
4. Review the updates to ensure accuracy and completeness
5. Commit the memory bank updates along with your code changes

## Best Practices

1. **Update Immediately**: Run this prompt right after completing work while context is fresh
2. **Be Specific**: Include file paths, function names, and specific changes
3. **Link Everything**: Create connections between related documentation
4. **Think Future**: Document in a way that helps future development
5. **Stay Focused**: Only document what actually changed in this session

## Maintenance Schedule Integration

- **Daily**: Use this prompt after each significant work session
- **Weekly**: Review accumulated updates for consolidation opportunities
- **Monthly**: Archive completed features and outdated patterns

Remember: Good documentation compounds. Each well-documented session makes future development faster and more accurate.