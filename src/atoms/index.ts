import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import type { Pet, PetStatus, Order, User } from '@/api/petstore'

// ─── UI State ────────────────────────────────────────────────────────────────
export type Tab = 'pets' | 'store' | 'users'
export const activeTabAtom = atom<Tab>('pets')

export type ModalState =
  | { type: 'none' }
  | { type: 'addPet' }
  | { type: 'editPet'; pet: Pet }
  | { type: 'viewPet'; pet: Pet }
  | { type: 'placeOrder'; petId: number }
  | { type: 'viewOrder'; orderId: number }
  | { type: 'addUser' }
  | { type: 'viewUser'; username: string }

export const modalAtom = atom<ModalState>({ type: 'none' })

// ─── Pets State ──────────────────────────────────────────────────────────────
export const petStatusFilterAtom = atom<PetStatus>('available')
export const petSearchQueryAtom = atom<string>('')
export const petsAtom = atom<Pet[]>([])
export const petsLoadingAtom = atom<boolean>(false)
export const petsErrorAtom = atom<string | null>(null)

// ─── Store State ─────────────────────────────────────────────────────────────
export const inventoryAtom = atom<Record<string, number>>({})
export const inventoryLoadingAtom = atom<boolean>(false)
export const orderLookupIdAtom = atom<string>('')
export const lookedUpOrderAtom = atom<Order | null>(null)

// ─── Users State ─────────────────────────────────────────────────────────────
export const usernameSearchAtom = atom<string>('')
export const lookedUpUserAtom = atom<User | null>(null)
export const userLoadingAtom = atom<boolean>(false)

// ─── Auth State (persisted) ───────────────────────────────────────────────────
export const authTokenAtom = atomWithStorage<string | null>('petstore_token', null)
export const loggedInUsernameAtom = atomWithStorage<string | null>('petstore_username', null)

// ─── Toast ───────────────────────────────────────────────────────────────────
export interface ToastMessage {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}
export const toastsAtom = atom<ToastMessage[]>([])
