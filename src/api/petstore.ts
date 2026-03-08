const BASE_URL = 'https://petstore.swagger.io/v2'

export type PetStatus = 'available' | 'pending' | 'sold'

export interface Category {
  id: number
  name: string
}

export interface Tag {
  id: number
  name: string
}

export interface Pet {
  id: number
  name: string
  category?: Category
  photoUrls: string[]
  tags?: Tag[]
  status?: PetStatus
}

export interface Order {
  id?: number
  petId: number
  quantity: number
  shipDate?: string
  status?: 'placed' | 'approved' | 'delivered'
  complete?: boolean
}

export interface User {
  id?: number
  username: string
  firstName?: string
  lastName?: string
  email?: string
  password?: string
  phone?: string
  userStatus?: number
}

export interface StoreInventory {
  [key: string]: number
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(text || `HTTP ${res.status}`)
  }
  const text = await res.text()
  return text ? JSON.parse(text) : ({} as T)
}

// ─── Pets ────────────────────────────────────────────────────────────────────
export const petApi = {
  findByStatus: (status: PetStatus) =>
    request<Pet[]>(`/pet/findByStatus?status=${status}`),

  findByTags: (tags: string[]) =>
    request<Pet[]>(`/pet/findByTags?tags=${tags.join(',')}`),

  getById: (id: number) =>
    request<Pet>(`/pet/${id}`),

  create: (pet: Omit<Pet, 'id'>) =>
    request<Pet>('/pet', { method: 'POST', body: JSON.stringify(pet) }),

  update: (pet: Pet) =>
    request<Pet>('/pet', { method: 'PUT', body: JSON.stringify(pet) }),

  delete: (id: number) =>
    request<void>(`/pet/${id}`, { method: 'DELETE' }),

  uploadImage: (petId: number, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return request<{ message: string }>(`/pet/${petId}/uploadFile`, {
      method: 'POST',
      headers: {},
      body: formData,
    })
  },
}

// ─── Store ───────────────────────────────────────────────────────────────────
export const storeApi = {
  getInventory: () =>
    request<StoreInventory>('/store/inventory'),

  placeOrder: (order: Omit<Order, 'id'>) =>
    request<Order>('/store/order', { method: 'POST', body: JSON.stringify(order) }),

  getOrder: (id: number) =>
    request<Order>(`/store/order/${id}`),

  deleteOrder: (id: number) =>
    request<void>(`/store/order/${id}`, { method: 'DELETE' }),
}

// ─── Users ───────────────────────────────────────────────────────────────────
export const userApi = {
  create: (user: User) =>
    request<User>('/user', { method: 'POST', body: JSON.stringify(user) }),

  login: (username: string, password: string) =>
    request<string>(`/user/login?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`),

  logout: () =>
    request<void>('/user/logout'),

  getByUsername: (username: string) =>
    request<User>(`/user/${encodeURIComponent(username)}`),

  update: (username: string, user: User) =>
    request<void>(`/user/${encodeURIComponent(username)}`, { method: 'PUT', body: JSON.stringify(user) }),

  delete: (username: string) =>
    request<void>(`/user/${encodeURIComponent(username)}`, { method: 'DELETE' }),
}
