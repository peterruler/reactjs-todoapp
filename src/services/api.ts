const DEFAULT_REMOTE_API_BASE_URL = 'https://zhaw.rf.gd/web4/api'
const LOCAL_API_BASE_URL = 'http://localhost:3000'

const getEnvApiBaseUrl = (): string | undefined => {
  try {
  return (import.meta as ImportMeta).env?.VITE_API_BASE_URL
  } catch (error) {
    console.warn('Environment API base URL not available:', error)
    return undefined
  }
}

const resolveApiBaseUrl = (): string => {
  const envBaseUrl = getEnvApiBaseUrl()
  if (envBaseUrl) {
    return envBaseUrl
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return LOCAL_API_BASE_URL
    }
  }

  return DEFAULT_REMOTE_API_BASE_URL
}

const API_BASE_URL = resolveApiBaseUrl()

const JSON_HEADERS: HeadersInit = {
  'Content-Type': 'application/json'
}

type MethodOverride = 'PATCH' | 'DELETE'

const postWithMethodOverride = async (
  url: string,
  override: MethodOverride,
  payload?: unknown
): Promise<Response> => {
  return fetch(url, {
    method: 'POST',
    mode: 'cors',
    headers: {
      ...JSON_HEADERS,
      'X-HTTP-Method-Override': override
    },
    body: payload !== undefined ? JSON.stringify(payload) : undefined
  })
}

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
  projectName?: string
}

// Server shapes (match db.json)
interface ServerProject {
  id?: string | number
  projectId?: string | number
  uuid?: string
  project_id?: string | number
  name?: string
  title?: string
  active?: boolean
}

interface ServerIssue {
  id?: string | number
  issueId?: string | number
  uuid?: string
  title?: string
  name?: string
  priority?: string | number
  dueDate?: string
  due_date?: string
  done?: boolean | number | string
  completed?: boolean | number | string
  projectId?: string | number
  project_id?: string | number
  project?: string | { id?: string | number; name?: string }
}

const normalizeProject = (project: ServerProject): Project | null => {
  const idCandidate = project.id ?? project.projectId ?? project.project_id ?? project.uuid
  if (!idCandidate) {
    return null
  }

  const nameCandidate = project.name ?? project.title ?? 'Unbenanntes Projekt'

  return {
    id: String(idCandidate),
    name: nameCandidate
  }
}

const normalizeIssue = (issue: ServerIssue): Issue | null => {
  const idCandidate = issue.id ?? issue.issueId ?? issue.uuid
  if (!idCandidate) {
    return null
  }

  const projectInfo = issue.project
  const projectIdCandidate = issue.projectId
    ?? issue.project_id
    ?? (typeof projectInfo === 'object' ? projectInfo?.id : projectInfo)

  const projectNameCandidate = typeof projectInfo === 'object'
    ? projectInfo?.name
    : typeof projectInfo === 'string'
      ? projectInfo
      : undefined

  const dueDateCandidate = issue.dueDate ?? issue.due_date ?? ''
  const doneCandidate = issue.done ?? issue.completed ?? false
  const priorityCandidate = issue.priority ?? '2'

  return {
    id: String(idCandidate),
    title: issue.title ?? issue.name ?? 'Unbenanntes Issue',
    priority: String(priorityCandidate),
    dueDate: dueDateCandidate,
    done: typeof doneCandidate === 'string'
      ? doneCandidate.toLowerCase() === 'true'
      : Boolean(doneCandidate),
    projectId: projectIdCandidate ? String(projectIdCandidate) : '',
    projectName: projectNameCandidate
  }
}

// Project API
export const projectAPI = {
  // Get all projects
  async getProjects(): Promise<Project[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/Project`, {
        mode: 'cors'
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const rawProjects: ServerProject[] = await response.json()
        return rawProjects
          .filter(p => p.active !== false)
          .map(normalizeProject)
          .filter((p): p is Project => p !== null)
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
        headers: JSON_HEADERS,
        mode: 'cors',
        body: JSON.stringify(newServerProject),
      })
      
      if (!createResponse.ok) {
        throw new Error(`HTTP error! status: ${createResponse.status}`)
      }
      
      const createdProject: ServerProject = await createResponse.json()
    return normalizeProject(createdProject)
    } catch (error) {
      console.error('Error creating project:', error)
      return null
    }
  },

  // Delete project (mark as inactive)
  async deleteProject(id: string): Promise<boolean> {
    try {
      const updateResponse = await postWithMethodOverride(
        `${API_BASE_URL}/Project/${id}`,
        'PATCH',
        { active: false }
      )
      
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
      const issuesResponse = await fetch(`${API_BASE_URL}/Issue`, {
        mode: 'cors'
      })
      if (!issuesResponse.ok) {
        throw new Error('HTTP error!')
      }

      const rawIssues: ServerIssue[] = await issuesResponse.json()
        return rawIssues
          .map(normalizeIssue)
          .filter((i): i is Issue => i !== null)
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
        headers: JSON_HEADERS,
        mode: 'cors',
        body: JSON.stringify(newIssue),
      })
      
      if (!createResponse.ok) {
        throw new Error(`HTTP error! status: ${createResponse.status}`)
      }
      
      const createdIssue: ServerIssue = await createResponse.json()
    return normalizeIssue(createdIssue)
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

      const updateResponse = await postWithMethodOverride(
        `${API_BASE_URL}/Issue/${id}`,
        'PATCH',
        partial
      )
      
      if (!updateResponse.ok) {
        throw new Error(`HTTP error! status: ${updateResponse.status}`)
      }
      
      const updatedIssue: ServerIssue = await updateResponse.json()
    return normalizeIssue(updatedIssue)
    } catch (error) {
      console.error('Error updating issue:', error)
      return null
    }
  },

  // Delete issue
  async deleteIssue(id: string): Promise<boolean> {
    try {
      const deleteResponse = await postWithMethodOverride(
        `${API_BASE_URL}/Issue/${id}`,
        'DELETE'
      )
      
      return deleteResponse.ok
    } catch (error) {
      console.error('Error deleting issue:', error)
      return false
    }
  }
}
