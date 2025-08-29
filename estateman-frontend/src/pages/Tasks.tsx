import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  CheckSquare, 
  Clock, 
  User, 
  Calendar,
  AlertCircle,
  Plus,
  Filter,
  Search,
  TrendingUp,
  Target,
  CheckCircle
} from "lucide-react"
import { useEffect, useState } from "react"
import { taskService, type Task, type Project } from "@/services/tasks"

// Removed hardcoded data - now using API data

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [taskStats, setTaskStats] = useState({ total_tasks: 0, completed_tasks: 0, in_progress_tasks: 0, overdue_tasks: 0, completion_rate: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [tasksData, projectsData, statsData] = await Promise.all([
        taskService.getTasks({ limit: 50 }),
        taskService.getProjects({ limit: 20 }),
        taskService.getTaskStats()
      ])
      setTasks(tasksData)
      setProjects(projectsData)
      setTaskStats(statsData)
    } catch (err) {
      setError('Failed to load tasks and projects')
      console.error('Tasks error:', err)
    } finally {
      setLoading(false)
    }
  }
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-success/10 text-success border-success/20"
      case "In Progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Not Started":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "On Track":
        return "bg-success/10 text-success border-success/20"
      case "At Risk":
        return "bg-warning/10 text-warning border-warning/20"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800 border-red-200"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="h-4 w-4 text-success" />
      case "In Progress":
        return <Clock className="h-4 w-4 text-blue-600" />
      case "Pending":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      default:
        return <CheckSquare className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Task & Project Management</h1>
            <p className="text-muted-foreground">Organize and track your team's work</p>
          </div>
          <Button className="bg-primary">
            <Plus className="h-4 w-4 mr-2" />
            Create Task
          </Button>
        </div>

        {/* Task Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{taskStats.total_tasks}</div>
              <p className="text-xs text-muted-foreground">Total tasks</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{taskStats.completed_tasks}</div>
              <p className="text-xs text-muted-foreground">{taskStats.completion_rate}% completion rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{taskStats.in_progress_tasks}</div>
              <p className="text-xs text-muted-foreground">Active work items</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{taskStats.overdue_tasks}</div>
              <p className="text-xs text-muted-foreground">Need attention</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="list" className="space-y-6">
          <TabsList>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Task List */}
              <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <CardTitle>Task Management</CardTitle>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search tasks..." className="pl-10" />
                    </div>
                    <Select>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center py-8">Loading tasks...</div>
                  ) : error ? (
                    <div className="text-center py-8 text-red-600">{error}</div>
                  ) : tasks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No tasks found</div>
                  ) : (
                    tasks.map((task) => (
                    <div key={task.id} className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          {getStatusIcon(task.status)}
                          <div className="flex-1">
                            <h4 className="font-semibold">{task.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                          <Badge variant="outline" className={getStatusColor(task.status)}>
                            {task.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {task.assigneeInitials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-muted-foreground">{task.assignee}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          Due: {task.dueDate || (task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date')}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Project: {task.project}
                        </div>
                      </div>
                      
                      {task.progress > 0 && (
                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{task.progress}%</span>
                          </div>
                          <Progress value={task.progress} className="h-2" />
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                          {(task.tags || []).map((tag, index) => (
                            <span 
                              key={index}
                              className="px-2 py-1 text-xs bg-muted rounded-md"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost">Edit</Button>
                          <Button size="sm" variant="ghost">View</Button>
                        </div>
                      </div>
                    </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Project Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Active Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">Loading projects...</div>
                ) : projects.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No projects found</div>
                ) : (
                  projects.map((project) => (
                  <div key={project.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">{project.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Deadline: {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline'}
                        </p>
                      </div>
                      <Badge variant="outline" className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Tasks Completed</span>
                        <span>{project.tasksCompleted || project.tasks_completed || 0}/{project.tasksTotal || project.tasks_total || 0}</span>
                      </div>
                      <Progress 
                        value={((project.tasksCompleted || project.tasks_completed || 0) / (project.tasksTotal || project.tasks_total || 1)) * 100} 
                        className="h-2" 
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Team:</span>
                      <div className="flex -space-x-1">
                        {(project.team || []).map((member, index) => (
                          <Avatar key={index} className="h-6 w-6 border-2 border-background">
                            <AvatarFallback className="text-xs">{member}</AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                    </div>
                  </div>
                  ))
                )}
                </div>
              </CardContent>
            </Card>
            </div>
          </TabsContent>

          <TabsContent value="kanban">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {['Not Started', 'In Progress', 'Pending', 'Completed'].map((status) => (
                <Card key={status} className="min-h-[500px]">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center justify-between">
                      {status}
                      <Badge variant="outline">
                        {tasks.filter(task => task.status === status).length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {tasks.filter(task => task.status === status).map((task) => (
                        <Card key={task.id} className="p-3 cursor-pointer hover:shadow-md transition-shadow">
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm">{task.title}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className={getPriorityColor(task.priority)}>
                                {task.priority}
                              </Badge>
                              <div className="text-xs text-muted-foreground">
                                {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                              </div>
                            </div>
                            {task.progress > 0 && (
                              <Progress value={task.progress} className="h-1" />
                            )}
                          </div>
                        </Card>
                      ))}
                      {tasks.filter(task => task.status === status).length === 0 && (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                          No {status.toLowerCase()} tasks
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

export default Tasks