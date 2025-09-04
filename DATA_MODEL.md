# Data Model Documentation

## Overview

This application uses a robust data model with UUID-based primary keys and foreign key relationships. The data is stored in JSON format for development purposes but can easily be migrated to a relational database.

## Database Schema

### Project Entity

```typescript
interface Project {
  id: string;        // UUID v4 primary key
  name: string;      // Project name (required)
  active: boolean;   // Project status (default: true)
}
```

**Example:**
```json
{
  "id": "22c054b7-4078-4d02-9034-e4b186bcb81f",
  "name": "Project Alpha",
  "active": true
}
```

### Issue Entity

```typescript
interface Issue {
  id: string;        // UUID v4 primary key
  title: string;     // Issue title (required)
  priority: string;  // Priority level: "1", "2", or "3"
  dueDate: string;   // Due date in YYYY-MM-DD format
  done: boolean;     // Completion status (default: false)
  projectId: string; // Foreign key reference to Project.id
}
```

**Example:**
```json
{
  "id": "fa48263b-a110-4f25-a774-2fcf03f35d78",
  "title": "Issue 1 for Project Alpha",
  "priority": "2",
  "dueDate": "2025-12-31",
  "done": false,
  "projectId": "22c054b7-4078-4d02-9034-e4b186bcb81f"
}
```

## Relationships

### 1:N Project-Issue Relationship

```
Project (1) ----< Issue (N)
    |                |
   id    ←---------  projectId
```

- Each Project can have multiple Issues
- Each Issue belongs to exactly one Project
- Foreign key: `Issue.projectId` references `Project.id`

## Priority System

| Priority | Value | Color Code | Description |
|----------|-------|------------|-------------|
| High     | "1"   | Red        | Urgent, needs immediate attention |
| Medium   | "2"   | Yellow     | Normal priority |
| Low      | "3"   | Green      | Low priority, can wait |

## Data Validation Rules

### Project Validation
- `id`: Must be valid UUID v4
- `name`: Required, minimum 1 character, maximum 100 characters
- `active`: Boolean, defaults to `true`

### Issue Validation
- `id`: Must be valid UUID v4
- `title`: Required, minimum 1 character, maximum 200 characters
- `priority`: Must be "1", "2", or "3"
- `dueDate`: Must be valid date in YYYY-MM-DD format, cannot be in the past
- `done`: Boolean, defaults to `false`
- `projectId`: Must reference an existing Project.id

## Sample Data Structure

```json
{
  "Project": [
    {
      "id": "22c054b7-4078-4d02-9034-e4b186bcb81f",
      "name": "Project Alpha",
      "active": true
    },
    {
      "id": "3a6f2a73-1220-4f4e-93f9-9a5a0b1a2c11",
      "name": "Project Beta",
      "active": true
    },
    {
      "id": "7c2e9b5d-8f5a-46f5-9f5e-0f2b9a1c3d77",
      "name": "Project Gamma",
      "active": true
    }
  ],
  "Issue": [
    {
      "id": "fa48263b-a110-4f25-a774-2fcf03f35d78",
      "title": "Issue 1 for Project Alpha",
      "priority": "2",
      "dueDate": "2025-12-31",
      "done": false,
      "projectId": "22c054b7-4078-4d02-9034-e4b186bcb81f"
    },
    {
      "id": "b1e2c3d4-5f6a-4b7c-8d9e-0a1b2c3d4e5f",
      "title": "Issue 2 for Project Alpha",
      "priority": "1",
      "dueDate": "2026-01-15",
      "done": true,
      "projectId": "22c054b7-4078-4d02-9034-e4b186bcb81f"
    },
    {
      "id": "c2d3e4f5-6a7b-4c8d-9e0f-1a2b3c4d5e60",
      "title": "Issue 1 for Project Beta",
      "priority": "3",
      "dueDate": "2026-02-20",
      "done": false,
      "projectId": "3a6f2a73-1220-4f4e-93f9-9a5a0b1a2c11"
    }
  ]
}
```

## Database Migration Considerations

When migrating to a production database:

### PostgreSQL Schema
```sql
-- Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Issues table
CREATE TABLE issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    priority VARCHAR(1) NOT NULL CHECK (priority IN ('1', '2', '3')),
    due_date DATE NOT NULL,
    done BOOLEAN DEFAULT false,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_issues_project_id ON issues(project_id);
CREATE INDEX idx_issues_due_date ON issues(due_date);
CREATE INDEX idx_issues_priority ON issues(priority);
```

### MongoDB Schema
```javascript
// Projects collection
{
  _id: ObjectId,
  id: String, // UUID v4
  name: String,
  active: Boolean,
  createdAt: Date,
  updatedAt: Date
}

// Issues collection
{
  _id: ObjectId,
  id: String, // UUID v4
  title: String,
  priority: String, // "1", "2", or "3"
  dueDate: Date,
  done: Boolean,
  projectId: String, // References Project.id
  createdAt: Date,
  updatedAt: Date
}
```

## API Integration Notes

The application's API layer (`src/services/api.ts`) handles:
- UUID generation for new entities
- Data transformation between frontend and backend formats
- Type safety with TypeScript interfaces
- Error handling and validation
- Optimistic updates with rollback capability

## Testing Data

The test suite uses mock data that follows the same schema structure:
- **Mock Projects**: 6 projects with realistic UUIDs
- **Mock Issues**: 11 issues distributed across projects
- **Relationship Testing**: Validates foreign key constraints
- **Edge Cases**: Tests with empty projects, completed issues, various priorities

See test files in `src/components/__tests__/` for specific test data examples.
