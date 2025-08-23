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

// Raw API interfaces (as they come from the server)
interface RawProject {
  id: string  // JSON-Server returns id as string
  client_id: string
  title: string
  active: boolean
}

interface RawIssue {
  id: string  // JSON-Server returns id as string
  client_id: string
  project_id: number  // This remains number in the data
  done: boolean
  title: string
  due_date: string
  priority: number
}

// Transform functions
const transformProject = (raw: RawProject): Project => ({
  id: raw.client_id,
  name: raw.title
})

const transformIssue = (raw: RawIssue): Issue => ({
  id: raw.client_id,
  title: raw.title,
  priority: raw.priority.toString(),
  dueDate: raw.due_date,
  done: raw.done,
  projectId: '' // We need to map project_id to client_id
})

// Project API
export const projectAPI = {
  // Get all projects
  async getProjects(): Promise<Project[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/Project`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const rawProjects: RawProject[] = await response.json()
      return rawProjects.filter(p => p.active).map(transformProject)
    } catch (error) {
      console.error('Error fetching projects:', error)
      return []
    }
  },

  // Create new project
  async createProject(project: Omit<Project, 'id'>): Promise<Project | null> {
    try {
      // Get existing projects to determine next ID
      const response = await fetch(`${API_BASE_URL}/Project`)
      const existingProjects: RawProject[] = await response.json()
      const nextId = Math.max(...existingProjects.map(p => parseInt(p.id)), -1) + 1
      
      const newRawProject: RawProject = {
        id: nextId.toString(),
        client_id: crypto.randomUUID(),
        title: project.name,
        active: true
      }
      
      const createResponse = await fetch(`${API_BASE_URL}/Project`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRawProject),
      })
      
      if (!createResponse.ok) {
        throw new Error(`HTTP error! status: ${createResponse.status}`)
      }
      
      const createdProject = await createResponse.json()
      return transformProject(createdProject)
    } catch (error) {
      console.error('Error creating project:', error)
      return null
    }
  },

  // Delete project (mark as inactive)
  async deleteProject(id: string): Promise<boolean> {
    try {
      // Find project by client_id
      const response = await fetch(`${API_BASE_URL}/Project`)
      const projects: RawProject[] = await response.json()
      const project = projects.find(p => p.client_id === id)
      
      if (!project) return false
      
      const updateResponse = await fetch(`${API_BASE_URL}/Project/${project.id}`, {
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
      const [issuesResponse, projectsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/Issue`),
        fetch(`${API_BASE_URL}/Project`)
      ])
      
      if (!issuesResponse.ok || !projectsResponse.ok) {
        throw new Error('HTTP error!')
      }
      
      const rawIssues: RawIssue[] = await issuesResponse.json()
      const rawProjects: RawProject[] = await projectsResponse.json()
      
      // Create project_id to client_id mapping
      // Note: JSON-Server returns id as string, but project_id in issues is number
      const projectIdMap = new Map(rawProjects.map(p => [parseInt(p.id), p.client_id]))
      
      return rawIssues.map(rawIssue => ({
        ...transformIssue(rawIssue),
        projectId: projectIdMap.get(rawIssue.project_id) || ''
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
      // Get existing issues to determine next ID
      const issuesResponse = await fetch(`${API_BASE_URL}/Issue`)
      const existingIssues: RawIssue[] = await issuesResponse.json()
      const nextId = Math.max(...existingIssues.map(i => parseInt(i.id)), -1) + 1
      
      // Find project by client_id to get project_id
      const projectsResponse = await fetch(`${API_BASE_URL}/Project`)
      const projects: RawProject[] = await projectsResponse.json()
      const project = projects.find(p => p.client_id === issue.projectId)
      
      if (!project) {
        throw new Error('Project not found')
      }
      
      const newRawIssue: RawIssue = {
        id: nextId.toString(),
        client_id: crypto.randomUUID(),
        project_id: parseInt(project.id),
        done: issue.done,
        title: issue.title,
        due_date: issue.dueDate,
        priority: parseInt(issue.priority) || 0
      }
      
      const createResponse = await fetch(`${API_BASE_URL}/Issue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRawIssue),
      })
      
      if (!createResponse.ok) {
        throw new Error(`HTTP error! status: ${createResponse.status}`)
      }
      
      const createdIssue = await createResponse.json()
      return {
        ...transformIssue(createdIssue),
        projectId: issue.projectId
      }
    } catch (error) {
      console.error('Error creating issue:', error)
      return null
    }
  },

  // Update issue
  async updateIssue(id: string, updates: Partial<Issue>): Promise<Issue | null> {
    try {
      // Find issue by client_id
      const issuesResponse = await fetch(`${API_BASE_URL}/Issue`)
      if (!issuesResponse.ok) {
        throw new Error(`HTTP error! status: ${issuesResponse.status}`)
      }
      
      const issues: RawIssue[] = await issuesResponse.json()
      const issue = issues.find(i => i.client_id === id)
      
      if (!issue) {
        console.error('Issue not found with client_id:', id)
        return null
      }
      
      const rawUpdates: Partial<RawIssue> = {}
      if (updates.done !== undefined) rawUpdates.done = updates.done
      if (updates.title) rawUpdates.title = updates.title
      if (updates.dueDate) rawUpdates.due_date = updates.dueDate
      if (updates.priority) rawUpdates.priority = parseInt(updates.priority)
      
      console.log('Updating issue:', issue.id, 'with updates:', rawUpdates)
      
      const updateResponse = await fetch(`${API_BASE_URL}/Issue/${issue.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rawUpdates),
      })
      
      if (!updateResponse.ok) {
        throw new Error(`HTTP error! status: ${updateResponse.status}`)
      }
      
      const updatedIssue = await updateResponse.json()
      console.log('Issue updated successfully:', updatedIssue)
      
      // For the checkbox toggle, we need to get the current projectId
      // Let's get it from the projects to maintain consistency
      const projectsResponse = await fetch(`${API_BASE_URL}/Project`)
      if (projectsResponse.ok) {
        const projects: RawProject[] = await projectsResponse.json()
        // Fix: Convert project_id (number) to string for map lookup
        const projectIdMap = new Map(projects.map(p => [p.id, p.client_id]))
        const projectId = projectIdMap.get(updatedIssue.project_id.toString()) || ''
        
        return {
          id: updatedIssue.client_id,
          title: updatedIssue.title,
          priority: updatedIssue.priority.toString(),
          dueDate: updatedIssue.due_date,
          done: updatedIssue.done,
          projectId: projectId
        }
      } else {
        // Fallback: return without projectId
        return {
          id: updatedIssue.client_id,
          title: updatedIssue.title,
          priority: updatedIssue.priority.toString(),
          dueDate: updatedIssue.due_date,
          done: updatedIssue.done,
          projectId: '' // This might cause issues, but better than failing completely
        }
      }
    } catch (error) {
      console.error('Error updating issue:', error)
      return null
    }
  },

  // Delete issue
  async deleteIssue(id: string): Promise<boolean> {
    try {
      // Find issue by client_id
      const response = await fetch(`${API_BASE_URL}/Issue`)
      const issues: RawIssue[] = await response.json()
      const issue = issues.find(i => i.client_id === id)
      
      if (!issue) return false
      
      const deleteResponse = await fetch(`${API_BASE_URL}/Issue/${issue.id}`, {
        method: 'DELETE',
      })
      
      return deleteResponse.ok
    } catch (error) {
      console.error('Error deleting issue:', error)
      return false
    }
  }
}
