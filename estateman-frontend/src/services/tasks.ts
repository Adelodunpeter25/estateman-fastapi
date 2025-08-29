import { api } from './api'

export interface Task {
  id: number
  task_id: string
  title: string
  description?: string
  status: 'Not Started' | 'In Progress' | 'Pending' | 'Completed' | 'Cancelled'
  priority: 'Low' | 'Medium' | 'High' | 'Urgent'
  progress: number
  project_id?: number
  assigned_to?: number
  created_by: number
  due_date?: string
  created_at: string
  updated_at?: string
  // Frontend compatibility fields
  assignee?: string
  assigneeInitials?: string
  project?: string
  tags?: string[]
  dueDate?: string
}

export interface Project {
  id: number
  name: string
  description?: string
  status: 'Planning' | 'On Track' | 'At Risk' | 'Completed' | 'Cancelled'
  deadline?: string
  created_by: number
  created_at: string
  updated_at?: string
  tasks_total: number
  tasks_completed: number
  // Frontend compatibility fields
  team?: string[]
  tasksTotal?: number
  tasksCompleted?: number
}

export const taskService = {
  // Task operations
  createTask: async (taskData: {
    title: string
    description?: string
    priority?: string
    due_date?: string
    project_id?: number
    assigned_to?: number
  }): Promise<Task> => {
    const response = await api.post('/tasks/tasks', taskData)
    return response.data
  },

  getTasks: async (params?: {
    skip?: number
    limit?: number
    status?: string
    assigned_to?: number
  }): Promise<Task[]> => {
    const response = await api.get('/tasks/tasks', { params })
    return response.data || []
  },

  getTask: async (taskId: number): Promise<Task> => {
    const response = await api.get(`/tasks/tasks/${taskId}`)
    return response.data
  },

  updateTask: async (taskId: number, taskData: {
    title?: string
    description?: string
    status?: string
    priority?: string
    progress?: number
    due_date?: string
    assigned_to?: number
  }): Promise<Task> => {
    const response = await api.put(`/tasks/tasks/${taskId}`, taskData)
    return response.data
  },

  deleteTask: async (taskId: number): Promise<void> => {
    await api.delete(`/tasks/tasks/${taskId}`)
  },

  // Project operations
  createProject: async (projectData: {
    name: string
    description?: string
    deadline?: string
  }): Promise<Project> => {
    const response = await api.post('/tasks/projects', projectData)
    return response.data
  },

  getProjects: async (params?: {
    skip?: number
    limit?: number
  }): Promise<Project[]> => {
    const response = await api.get('/tasks/projects', { params })
    return response.data || []
  },

  getProject: async (projectId: number): Promise<Project> => {
    const response = await api.get(`/tasks/projects/${projectId}`)
    return response.data
  },

  updateProject: async (projectId: number, projectData: {
    name?: string
    description?: string
    status?: string
    deadline?: string
  }): Promise<Project> => {
    const response = await api.put(`/tasks/projects/${projectId}`, projectData)
    return response.data
  },

  getTaskStats: async (): Promise<{
    total_tasks: number
    completed_tasks: number
    in_progress_tasks: number
    overdue_tasks: number
    completion_rate: number
  }> => {
    const response = await api.get('/tasks/stats')
    return response.data
  }
}