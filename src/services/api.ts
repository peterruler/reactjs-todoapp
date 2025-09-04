const API_BASE_URL = 'http://localhost:3001'

export interface Project {
  id: string
  name: string
}

export interface Issue {
  id: string
  title: string
  priority: string
  dueDate: string
  done: boolean
  projectId: string
}

// Server shapes (match db.json)
interface ServerProject {
  id: string
  name: string
  active: boolean
}

interface ServerIssue {
  id: string
  title: string
  priority: string
  dueDate: string
  done: boolean
  projectId: string
}

// Project API
export const projectAPI = {
  // Get all projects
  async getProjects(): Promise<Project[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/Project`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const rawProjects: ServerProject[] = await response.json()
      return rawProjects
        .filter(p => p.active)
        .map(p => ({ id: p.id, name: p.name }))
    } catch (error) {
      console.error('Error fetching projects:', error)
      return []
    }
  },

  // Create new project
  async createProject(project: Omit<Project, 'id'>): Promise<Project | null> {
    try {
      const newServerProject: ServerProject = {
        id: crypto.randomUUID(),
        name: project.name,
        active: true
      }
      
      const createResponse = await fetch(`${API_BASE_URL}/Project`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newServerProject),
      })
      
      if (!createResponse.ok) {
        throw new Error(`HTTP error! status: ${createResponse.status}`)
      }
      
      const createdProject: ServerProject = await createResponse.json()
      return { id: createdProject.id, name: createdProject.name }
    } catch (error) {
      console.error('Error creating project:', error)
      return null
    }
  },

  // Delete project (mark as inactive)
  async deleteProject(id: string): Promise<boolean> {
    try {
      const updateResponse = await fetch(`${API_BASE_URL}/Project/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active: false }),
      })
      
      return updateResponse.ok
    } catch (error) {
      console.error('Error deleting project:', error)
      return false
    }
  }
}

// Issue API
export const issueAPI = {
  // Get all issues
  async getIssues(): Promise<Issue[]> {
    try {
      const issuesResponse = await fetch(`${API_BASE_URL}/Issue`)
      if (!issuesResponse.ok) {
        throw new Error('HTTP error!')
      }

      const rawIssues: ServerIssue[] = await issuesResponse.json()
      return rawIssues.map(i => ({
        id: i.id,
        title: i.title,
        priority: i.priority,
        dueDate: i.dueDate,
        done: i.done,
        projectId: i.projectId
      }))
    } catch (error) {
      console.error('Error fetching issues:', error)
      return []
    }
  },

  // Get issues by project ID
  async getIssuesByProject(projectId: string): Promise<Issue[]> {
    try {
      const issues = await this.getIssues()
      return issues.filter(issue => issue.projectId === projectId)
    } catch (error) {
      console.error('Error fetching issues by project:', error)
      return []
    }
  },

  // Create new issue
  async createIssue(issue: Omit<Issue, 'id'>): Promise<Issue | null> {
    try {
      const newIssue: ServerIssue = {
        id: crypto.randomUUID(),
        title: issue.title,
        priority: issue.priority,
        dueDate: issue.dueDate,
        done: issue.done,
        projectId: issue.projectId
      }
      
      const createResponse = await fetch(`${API_BASE_URL}/Issue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newIssue),
      })
      
      if (!createResponse.ok) {
        throw new Error(`HTTP error! status: ${createResponse.status}`)
      }
      
      const createdIssue: ServerIssue = await createResponse.json()
      return { ...createdIssue }
    } catch (error) {
      console.error('Error creating issue:', error)
      return null
    }
  },

  // Update issue
  async updateIssue(id: string, updates: Partial<Issue>): Promise<Issue | null> {
    try {
      const partial: Partial<ServerIssue> = {}
      if (updates.done !== undefined) partial.done = updates.done
      if (updates.title !== undefined) partial.title = updates.title
      if (updates.dueDate !== undefined) partial.dueDate = updates.dueDate
      if (updates.priority !== undefined) partial.priority = updates.priority

      const updateResponse = await fetch(`${API_BASE_URL}/Issue/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(partial),
      })
      
      if (!updateResponse.ok) {
        throw new Error(`HTTP error! status: ${updateResponse.status}`)
      }
      
      const updatedIssue: ServerIssue = await updateResponse.json()
      return { ...updatedIssue }
    } catch (error) {
      console.error('Error updating issue:', error)
      return null
    }
  },

  // Delete issue
  async deleteIssue(id: string): Promise<boolean> {
    try {
      const deleteResponse = await fetch(`${API_BASE_URL}/Issue/${id}`, {
        method: 'DELETE',
      })
      
      return deleteResponse.ok
    } catch (error) {
      console.error('Error deleting issue:', error)
      return false
    }
  }
}
