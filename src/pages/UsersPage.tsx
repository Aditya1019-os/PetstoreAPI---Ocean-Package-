import { useAtom } from 'jotai'
import { useState } from 'react'
import {
  usernameSearchAtom, lookedUpUserAtom, userLoadingAtom,
  authTokenAtom, loggedInUsernameAtom
} from '@/atoms'
import { userApi, type User } from '@/api/petstore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/form-elements'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useToast } from '@/components/Toast'
import { Search, UserPlus, LogIn, LogOut, User as UserIcon, Loader2 } from 'lucide-react'

function UserCard({ user }: { user: User }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 max-w-sm animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center text-primary">
          <UserIcon className="h-5 w-5" />
        </div>
        <div>
          <p className="font-display font-bold">{user.firstName} {user.lastName}</p>
          <p className="text-sm text-muted-foreground">@{user.username}</p>
        </div>
      </div>
      <div className="space-y-1.5 text-sm">
        {user.email && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email</span>
            <span>{user.email}</span>
          </div>
        )}
        {user.phone && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Phone</span>
            <span>{user.phone}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-muted-foreground">ID</span>
          <span className="font-mono">{user.id}</span>
        </div>
      </div>
    </div>
  )
}

function CreateUserModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<Partial<User>>({})
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const set = (k: keyof User) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async () => {
    if (!form.username || !form.password) return
    setLoading(true)
    try {
      await userApi.create(form as User)
      toast('User created!', 'success')
      onClose()
    } catch (e: any) {
      toast(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const fields: { key: keyof User; label: string; placeholder: string; type?: string }[] = [
    { key: 'username', label: 'Username *', placeholder: 'johndoe' },
    { key: 'firstName', label: 'First name', placeholder: 'John' },
    { key: 'lastName', label: 'Last name', placeholder: 'Doe' },
    { key: 'email', label: 'Email', placeholder: 'john@example.com', type: 'email' },
    { key: 'phone', label: 'Phone', placeholder: '+49 123 456789' },
    { key: 'password', label: 'Password *', placeholder: '••••••', type: 'password' },
  ]

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {fields.map(f => (
          <div key={f.key} className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">{f.label}</label>
            <Input type={f.type ?? 'text'} placeholder={f.placeholder} onChange={set(f.key)} />
          </div>
        ))}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={loading || !form.username || !form.password}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create User'}
        </Button>
      </DialogFooter>
    </div>
  )
}

function LoginModal({ onClose }: { onClose: () => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [, setToken] = useAtom(authTokenAtom)
  const [, setLoggedIn] = useAtom(loggedInUsernameAtom)
  const { toast } = useToast()

  const handleLogin = async () => {
    if (!username || !password) return
    setLoading(true)
    try {
      const token = await userApi.login(username, password)
      setToken(typeof token === 'string' ? token : JSON.stringify(token))
      setLoggedIn(username)
      toast(`Welcome back, ${username}!`, 'success')
      onClose()
    } catch (e: any) {
      toast(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Username</label>
        <Input placeholder="your_username" value={username} onChange={e => setUsername(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Password</label>
        <Input type="password" placeholder="••••••" value={password} onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()} />
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleLogin} disabled={loading || !username || !password}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Login'}
        </Button>
      </DialogFooter>
    </div>
  )
}

type ModalT = 'none' | 'create' | 'login'

export default function UsersPage() {
  const [search, setSearch] = useAtom(usernameSearchAtom)
  const [user, setUser] = useAtom(lookedUpUserAtom)
  const [loading, setLoading] = useAtom(userLoadingAtom)
  const [token, setToken] = useAtom(authTokenAtom)
  const [loggedIn, setLoggedIn] = useAtom(loggedInUsernameAtom)
  const [modal, setModal] = useState<ModalT>('none')
  const { toast } = useToast()

  const lookupUser = async () => {
    if (!search.trim()) return
    setLoading(true)
    setUser(null)
    try {
      const data = await userApi.getByUsername(search.trim())
      setUser(data)
    } catch (e: any) {
      toast(`User not found: ${e.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await userApi.logout()
    } catch (_) {}
    setToken(null)
    setLoggedIn(null)
    toast('Logged out', 'info')
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Auth status */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold">Authentication</h2>
            {loggedIn ? (
              <p className="text-sm text-muted-foreground mt-0.5">Signed in as <span className="font-medium text-foreground">@{loggedIn}</span></p>
            ) : (
              <p className="text-sm text-muted-foreground mt-0.5">Not signed in</p>
            )}
          </div>
          <div className="flex gap-2">
            {!loggedIn ? (
              <>
                <Button variant="outline" onClick={() => setModal('login')}>
                  <LogIn className="h-4 w-4" /> Login
                </Button>
                <Button onClick={() => setModal('create')}>
                  <UserPlus className="h-4 w-4" /> New User
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4" /> Logout
              </Button>
            )}
          </div>
        </div>
        {token && (
          <div className="mt-4 rounded-lg bg-muted px-3 py-2">
            <p className="text-xs text-muted-foreground mb-1">Session token</p>
            <p className="text-xs font-mono truncate">{token}</p>
          </div>
        )}
      </section>

      {/* User lookup */}
      <section>
        <h2 className="font-display text-xl font-bold mb-1">User Lookup</h2>
        <p className="text-sm text-muted-foreground mb-4">Find a user by username</p>
        <div className="flex gap-2 max-w-sm">
          <Input
            placeholder="Username…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && lookupUser()}
          />
          <Button onClick={lookupUser} disabled={loading || !search.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>
        {user && <div className="mt-4"><UserCard user={user} /></div>}
      </section>

      {/* Create modal */}
      <Dialog open={modal === 'create'} onOpenChange={o => !o && setModal('none')}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>
          <CreateUserModal onClose={() => setModal('none')} />
        </DialogContent>
      </Dialog>

      {/* Login modal */}
      <Dialog open={modal === 'login'} onOpenChange={o => !o && setModal('none')}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign In</DialogTitle>
          </DialogHeader>
          <LoginModal onClose={() => setModal('none')} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
