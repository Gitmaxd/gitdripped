# Project Analysis Prompt

## Purpose
This prompt guides AI assistants to analyze a codebase and extract the information needed to initialize a memory bank system.

---

## PROMPT TO USE:

I need you to analyze this project's codebase to create an initial memory bank documentation system. Please perform a comprehensive analysis following these steps:

### 1. Project Discovery

First, explore the project structure:
- Examine the root directory files (README, package.json, Cargo.toml, requirements.txt, etc.)
- Identify the primary programming language(s) and frameworks
- Look for configuration files that reveal the tech stack
- Check for existing documentation

### 2. Architecture Analysis

Analyze the code architecture:
- Identify the main entry points
- Map out the directory structure and its purpose
- Find the core modules/components
- Understand the data flow and system boundaries
- Identify external dependencies and integrations

### 3. Pattern Recognition

Identify recurring patterns:
- **Code Patterns**: Common coding structures, utilities, helpers
- **Architecture Patterns**: MVC, microservices, monolith, etc.
- **Data Patterns**: Database access, state management, caching
- **UI Patterns**: Component structure, styling approach, layouts
- **Integration Patterns**: API calls, authentication, third-party services
- **Testing Patterns**: Test structure, mocking approaches, coverage

### 4. Feature Inventory

Catalog existing features:
- List all major features/functionalities
- Note their implementation locations
- Identify feature dependencies
- Document configuration requirements
- Note any feature flags or toggles

### 5. Technical Context

Document the technical environment:
- Development setup requirements
- Build and deployment processes
- Environment variables and configuration
- Database schema or data models
- API endpoints and contracts
- Security measures and authentication

### 6. Current State Assessment

Evaluate the current development state:
- Recent commits and active development areas
- TODO comments and known issues
- Work in progress indicators
- Technical debt markers
- Performance bottlenecks or concerns

### 7. Initial Documentation Creation

Based on your analysis, create the following initial files:

#### A. `memory-bank/core/projectbrief.md`
Include:
- Project name and purpose
- Target audience and use cases
- Core features and capabilities
- Technology choices rationale
- Success metrics or goals

#### B. `memory-bank/core/techContext.md`
Include:
- Complete tech stack listing
- Architecture diagram (text-based)
- Database/data structure overview
- External service integrations
- Development environment setup

#### C. `memory-bank/core/systemPatterns.md`
Include:
- Identified pattern categories
- Links to specific pattern docs (to be created)
- Coding conventions observed
- Best practices in use

#### D. `memory-bank/active/activeContext.md`
Include:
- Current development focus
- Recent changes observed
- Active branches or features
- Immediate technical needs

#### E. `memory-bank/patterns/[specific-patterns].md`
Create 3-5 pattern files for the most important patterns you found

### 8. Recommendations

Provide recommendations for:
- Additional patterns to document
- Areas needing technical documentation
- Potential structure improvements
- Missing documentation priorities
- Quick wins for improvement

### Analysis Output Format

Structure your findings as:

```markdown
# Project Analysis Report

## Executive Summary
[Brief overview of the project and key findings]

## Project Overview
- **Name**: [Project name]
- **Type**: [Web app, API, Library, etc.]
- **Primary Language**: [Language]
- **Framework**: [Main framework]

## Architecture Summary
[Key architectural decisions and structure]

## Discovered Patterns
1. **[Pattern Name]**: [Brief description]
2. **[Pattern Name]**: [Brief description]
[Continue for all major patterns]

## Feature Inventory
1. **[Feature Name]**: [Location and purpose]
2. **[Feature Name]**: [Location and purpose]
[Continue for major features]

## Technical Debt & Issues
- [Issue 1]
- [Issue 2]
[List any identified problems]

## Recommended Memory Bank Structure
[Suggest any customizations to the standard structure]

## Next Steps
1. [Immediate action]
2. [Short-term action]
3. [Long-term action]
```

### Important Notes

- Focus on extracting actionable, specific information
- Avoid generic observations; be concrete
- Include file paths and specific examples
- Note any unusual or non-standard patterns
- Flag any security concerns noticed
- Identify the project's unique characteristics

### What NOT to Do

- Don't make assumptions about undocumented features
- Don't include sensitive information (API keys, passwords)
- Don't spend excessive time on deprecated code
- Don't create overly detailed documentation initially
- Don't ignore the project's existing documentation

Please proceed with the analysis and create the initial memory bank structure based on your findings.

---

## Usage Instructions

1. Copy the prompt section above (between "PROMPT TO USE:" markers)
2. Provide it to Claude Code along with access to your project
3. The AI will analyze your codebase and create initial documentation
4. Review and refine the generated documentation
5. Continue with the initialization guide for next steps

## Tips for Best Results

- Run this on a clean, up-to-date codebase
- Ensure all dependencies are installed
- Have any existing documentation available
- Be prepared to answer clarifying questions
- Review generated content for accuracy

## Common Project Types

### Web Applications
Focus areas: Routes, components, state management, API integration

### APIs/Services  
Focus areas: Endpoints, authentication, data models, middleware

### Libraries
Focus areas: Public API, internal structure, examples, distribution

### CLI Tools
Focus areas: Commands, configuration, plugins, output formats

### Mobile Apps
Focus areas: Screens, navigation, state, platform differences

Adjust the analysis based on your specific project type for best results.