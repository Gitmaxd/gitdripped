# Memory Bank Maintenance Guide

## Overview

This guide establishes procedures for maintaining your project's memory bank to ensure documentation remains current, accurate, and useful for AI assistants.

## Quick Reference

### Daily Maintenance (2-5 minutes)
```
Please update the memory bank's active development context:
1. Update activeContext-todo.md with completed/new tasks
2. Add today's changes to activeContext-recent-changes.md
3. Update activeContext.md if major state changes occurred
```

### Weekly Maintenance (10-15 minutes)
```
Please perform weekly memory bank maintenance:
1. Review and consolidate recent changes
2. Update activeContext-current-status.md
3. Verify roadmap.md alignment
4. Check for broken cross-references
```

### Monthly Maintenance (30-45 minutes)
```
Please perform monthly memory bank maintenance following MAINTENANCE_GUIDE.md:
1. Full review of active/ directory
2. Verify core/ documentation accuracy
3. Update metadata last_verified dates
4. Archive completed features
5. Generate maintenance report
```

## File Lifecycle Management

```
Creation → Active Use → Periodic Review → Archive/Update → Deprecation
   ↓           ↓              ↓                ↓              ↓
[New file] [3 months]    [Monthly]      [6 months]     [1 year]
```

### Lifecycle Stages

1. **Creation**
   - Add metadata header with all required fields
   - Place in appropriate directory
   - Update README.md navigation if needed
   - Create bidirectional dependencies

2. **Active Use** (0-3 months)
   - Frequent updates expected
   - No formal review required
   - Track changes in activeContext-recent-changes.md

3. **Periodic Review** (3+ months)
   - Monthly verification of accuracy
   - Update `last_verified` date
   - Flag outdated content
   - Consider consolidation opportunities

4. **Archive/Update** (6+ months)
   - Evaluate continued relevance
   - Archive if historical value only
   - Update if still actively used
   - Merge similar documents

5. **Deprecation** (1+ year)
   - Move to archive with date prefix
   - Update any remaining references
   - Consider deletion if no value

## Maintenance Procedures

### Adding New Documentation

1. **Determine Category**
   ```
   core/      → Fundamental, rarely changing
   active/    → Current development work
   patterns/  → Reusable implementations
   features/  → Completed features
   technical/ → Learnings and solutions
   ```

2. **Create File with Metadata**
   ```yaml
   ---
   title: Clear Descriptive Title
   category: [appropriate category]
   last_verified: YYYY-MM-DD
   version: 1.0
   dependencies: [related-file.md, another-file.md]
   ---
   ```

3. **Update Navigation**
   - Add to README.md in appropriate section
   - Update related files' dependencies
   - Ensure bidirectional linking

### Updating Existing Documentation

1. **Metadata Updates**
   ```yaml
   last_verified: YYYY-MM-DD  # Always update
   version: X.Y               # Increment for major changes
   dependencies: [...]        # Add new dependencies
   ```

2. **Content Updates**
   - Mark sections as updated with date
   - Preserve historical context when relevant
   - Update code examples to current patterns

3. **Change Tracking**
   - Add to activeContext-recent-changes.md
   - Note in file what changed and why
   - Update dependent files if needed

### Archiving Documentation

1. **When to Archive**
   - Feature deprecated or removed
   - Pattern no longer used
   - Information superseded
   - Historical reference only

2. **Archive Process**
   ```bash
   # Move with date prefix
   archive/YYYYMMDD-original-name.md
   
   # Add archive header
   > **ARCHIVED**: [Date] - [Reason]
   > Superseded by: [new-file.md] (if applicable)
   ```

3. **Update References**
   - Find all references to archived file
   - Update or remove as appropriate
   - Note in dependent files

## Quality Standards

### Metadata Requirements

Every file MUST have:
```yaml
---
title: Descriptive title (required)
category: [core|active|pattern|feature|technical] (required)
last_verified: YYYY-MM-DD (required)
version: X.Y (required)
dependencies: [file1.md, file2.md] (required, use [] if none)
---
```

### Content Standards

1. **Structure**
   - Clear hierarchy with headers
   - Consistent formatting
   - Logical flow of information

2. **Code Examples**
   - Tested and working
   - Includes context
   - Shows best practices

3. **Cross-References**
   - Use relative paths
   - Verify links work
   - Bidirectional when possible

4. **Language**
   - Clear and concise
   - Technical but accessible
   - No unnecessary jargon

### Naming Conventions

```
lowercase-with-hyphens.md      # Default
systemPatterns-category.md     # For pattern collections
activeContext-aspect.md        # For active context files
YYYYMMDD-name.md              # For archived files
UPPERCASE.md                  # For special system files only
```

## Monitoring and Metrics

### Health Indicators

Track these monthly:

1. **File Metrics**
   - Total file count by category
   - Files not updated in 3+ months
   - Orphaned files (no references)
   - Broken links count

2. **Content Quality**
   - Files missing metadata
   - Outdated code examples
   - Redundant information
   - Incomplete sections

3. **Usage Patterns**
   - Most referenced files
   - Least accessed files
   - Common search patterns
   - Update frequency

### Maintenance Report Template

Create monthly in archive/:

```markdown
# Memory Bank Maintenance Report - [Month Year]

## Summary
- Total Files: X (Change: +X/-X)
- Health Score: X/100
- Critical Issues: X

## File Statistics
| Category | Count | Change | Outdated |
|----------|-------|--------|----------|
| Core     | X     | +X/-X  | X        |
| Active   | X     | +X/-X  | X        |
| Patterns | X     | +X/-X  | X        |
| Features | X     | +X/-X  | X        |
| Technical| X     | +X/-X  | X        |
| Archive  | X     | +X/-X  | N/A      |

## Actions Taken
1. Archived: [list files]
2. Updated: [list major updates]
3. Created: [list new files]
4. Merged: [list consolidations]

## Issues Found
1. Broken references: [list]
2. Outdated content: [list]
3. Missing metadata: [list]

## Recommendations
1. [Specific action items]
2. [Process improvements]
3. [Structure changes]

## Next Month Focus
- [Priority areas]
```

## Common Maintenance Patterns

### Pattern 1: Feature Completion
When a feature is completed:
1. Move specs from active/ to features/
2. Update patterns/ with new patterns discovered
3. Document learnings in technical/
4. Update roadmap.md

### Pattern 2: Major Refactoring
During significant changes:
1. Document old approach in archive/
2. Update all affected patterns
3. Create migration guide in technical/
4. Update core docs if architecture changed

### Pattern 3: Bug Fix Documentation
For significant bugs:
1. Document issue in technical/
2. Update relevant patterns
3. Add to testing guidelines
4. Note in recent changes

### Pattern 4: Pattern Evolution
When patterns change:
1. Version the pattern file
2. Document why it changed
3. Update all examples
4. Note breaking changes

## Automation Opportunities

Consider automating:

1. **Metadata Validation**
   ```javascript
   // Check all files have required metadata
   // Validate date formats
   // Ensure version numbers increment
   ```

2. **Link Checking**
   ```javascript
   // Verify all internal links
   // Check for orphaned files
   // Validate cross-references
   ```

3. **Content Analysis**
   ```javascript
   // Detect duplicate content
   // Find outdated code patterns
   // Identify missing sections
   ```

4. **Report Generation**
   ```javascript
   // Auto-generate monthly statistics
   // Track file changes
   // Create maintenance todos
   ```

## Emergency Procedures

### Documentation Crisis
If memory bank becomes unwieldy:
1. Stop adding new files
2. Run comprehensive audit
3. Aggressive archival (3+ months → archive)
4. Consolidate similar content
5. Simplify structure if needed

### Information Loss
If critical information is lost:
1. Check version control history
2. Review archive directory
3. Reconstruct from code
4. Document recovery process
5. Implement better backups

### Team Confusion
If team struggles with system:
1. Simplify categories
2. Create quick reference guide
3. Add more examples
4. Consider restructuring
5. Provide training session

## Best Practices

1. **Little and Often**: Small, frequent updates > large, rare overhauls
2. **Document as You Go**: Update immediately after changes
3. **Review Before Archive**: Ensure nothing valuable is lost
4. **Keep It Relevant**: Remove truly obsolete information
5. **Maintain Standards**: Consistency enables automation

## Conclusion

A well-maintained memory bank is a force multiplier for AI-assisted development. Following these procedures ensures your documentation remains a valuable asset rather than a burden. The key is establishing a sustainable rhythm of regular, incremental maintenance.

Remember: The memory bank is successful when it helps AI assistants provide better, more contextual assistance. If it's not serving that purpose, adapt the system to better meet your needs.