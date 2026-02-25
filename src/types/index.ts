export type Role = 'employee' | 'hr' | 'admin' | 'super_admin'

export interface User {
  id: number
  created_at: number
  name: string
  email: string
  role: Role
  company_id: number | null
  is_active: boolean
  avatar?: {
    url: string | null
    path: string
    name: string
    type: string
    size: number
    mime: string
  }
}

export interface Company {
  id: number
  created_at: number
  name: string
  description: string
  is_active: boolean
}

export interface Category {
  id: number
  created_at: number
  company_id: number
  name: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  is_active: boolean
}

export interface FormField {
  id: number
  category_id: number
  label: string
  field_type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file' | 'date' | 'number'
  options: string[] | null
  required: boolean
  sort_order: number
  is_active: boolean
}

export interface Request {
  id: number
  created_at: number
  updated_at: number
  employee_id: number
  hr_id: number | null
  category_id: number
  title: string
  status: 'pending' | 'in_progress' | 'resolved' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  is_read_by_hr: boolean
}

export interface RequestFieldValue {
  id: number
  request_id: number
  form_field_id: number
  field_label: string
  field_value: string
  file_value?: object
}

export interface Note {
  id: number
  created_at: number
  request_id: number
  hr_id: number
  content: string
}

export interface HrResponse {
  id: number
  created_at: number
  request_id: number
  hr_id: number
  template_id: number | null
  content: string
}

export interface Tag {
  id: number
  company_id: number
  name: string
  color: string
}

export interface Notification {
  id: number
  created_at: number
  user_id: number
  request_id: number | null
  title: string
  message: string
  type: string
  is_read: boolean
}

export interface ResponseTemplate {
  id: number
  category_id: number
  company_id: number
  title: string
  content: string
}

export interface PaginatedResponse<T> {
  items: T[]
  itemsTotal: number
  curPage: number
  nextPage: number | null
  prevPage: number | null
  pageTotal: number
}

export interface ApiError {
  message: string
  payload?: Record<string, unknown>
}
