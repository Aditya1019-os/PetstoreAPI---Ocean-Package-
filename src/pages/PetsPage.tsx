import { useAtom } from 'jotai'
import { useEffect, useState } from 'react'
import {
  petStatusFilterAtom, petSearchQueryAtom, petsAtom,
  petsLoadingAtom, petsErrorAtom, modalAtom,
} from '@/atoms'
import { petApi, type Pet, type PetStatus } from '@/api/petstore'
import { Button } from '@/components/ui/button'
import { Input, Badge, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/form-elements'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useToast } from '@/components/Toast'
import {
  Plus, Search, RefreshCw, Pencil, Trash2, Eye,
  PawPrint, Dog, AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'

function statusBadgeVariant(status?: string) {
  if (status === 'available') return 'available'
  if (status === 'pending') return 'pending'
  if (status === 'sold') return 'sold'
  return 'secondary'
}

function PetAvatar({ pet }: { pet: Pet }) {
  const url = pet.photoUrls?.[0]
  if (url && !url.includes('example')) {
    return (
      <img
        src={url}
        alt={pet.name}
        className="h-10 w-10 rounded-lg object-cover"
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
      />
    )
  }
  return (
    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
      <PawPrint className="h-5 w-5" />
    </div>
  )
}

// ─── Pet Form ─────────────────────────────────────────────────────────────────
function PetForm({ initial, onSubmit, onClose }: {
  initial?: Pet
  onSubmit: (data: Partial<Pet>) => Promise<void>
  onClose: () => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [status, setStatus] = useState<PetStatus>(initial?.status ?? 'available')
  const [categoryName, setCategoryName] = useState(initial?.category?.name ?? '')
  const [photoUrl, setPhotoUrl] = useState(initial?.photoUrls?.[0] ?? '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!name.trim()) return
    setLoading(true)
    await onSubmit({
      ...(initial ?? {}),
      name,
      status,
      category: categoryName ? { id: 0, name: categoryName } : undefined,
      photoUrls: photoUrl ? [photoUrl] : [],
      tags: initial?.tags ?? [],
    })
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Name *</label>
        <Input placeholder="e.g. Buddy" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Category</label>
        <Input placeholder="e.g. Dog" value={categoryName} onChange={e => setCategoryName(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Photo URL</label>
        <Input placeholder="https://..." value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Status</label>
        <Select value={status} onValueChange={v => setStatus(v as PetStatus)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={loading || !name.trim()}>
          {loading ? 'Saving…' : initial ? 'Update Pet' : 'Add Pet'}
        </Button>
      </DialogFooter>
    </div>
  )
}

// ─── Pet Detail View ──────────────────────────────────────────────────────────
function PetDetail({ pet, onClose }: { pet: Pet; onClose: () => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 rounded-xl bg-primary/10 flex items-center justify-center text-primary overflow-hidden">
          {pet.photoUrls?.[0] && !pet.photoUrls[0].includes('example') ? (
            <img src={pet.photoUrls[0]} alt={pet.name} className="h-full w-full object-cover"
              onError={e => { (e.target as HTMLImageElement).src = '' }} />
          ) : (
            <PawPrint className="h-10 w-10" />
          )}
        </div>
        <div>
          <h3 className="font-display text-2xl font-bold">{pet.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={statusBadgeVariant(pet.status) as any}>{pet.status ?? 'unknown'}</Badge>
            {pet.category?.name && <span className="text-sm text-muted-foreground">{pet.category.name}</span>}
          </div>
        </div>
      </div>
      <div className="rounded-xl bg-muted/60 p-4 space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-muted-foreground">ID</span><span className="font-mono">{pet.id}</span></div>
        {pet.tags && pet.tags.length > 0 && (
          <div className="flex justify-between items-start">
            <span className="text-muted-foreground">Tags</span>
            <div className="flex gap-1 flex-wrap justify-end">
              {pet.tags.map(t => <Badge key={t.id} variant="outline">{t.name}</Badge>)}
            </div>
          </div>
        )}
        {pet.photoUrls?.length > 0 && (
          <div className="flex justify-between"><span className="text-muted-foreground">Photos</span><span>{pet.photoUrls.length}</span></div>
        )}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Close</Button>
      </DialogFooter>
    </div>
  )
}

// ─── Pets Page ────────────────────────────────────────────────────────────────
export default function PetsPage() {
  const [status, setStatus] = useAtom(petStatusFilterAtom)
  const [query, setQuery] = useAtom(petSearchQueryAtom)
  const [pets, setPets] = useAtom(petsAtom)
  const [loading, setLoading] = useAtom(petsLoadingAtom)
  const [error, setError] = useAtom(petsErrorAtom)
  const [modal, setModal] = useAtom(modalAtom)
  const { toast } = useToast()

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await petApi.findByStatus(status)
      setPets(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [status])

  const filtered = pets.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.category?.name?.toLowerCase().includes(query.toLowerCase())
  )

  const handleAdd = async (data: Partial<Pet>) => {
    try {
      await petApi.create(data as Omit<Pet, 'id'>)
      toast('Pet added successfully!', 'success')
      setModal({ type: 'none' })
      load()
    } catch (e: any) { toast(e.message, 'error') }
  }

  const handleEdit = async (data: Partial<Pet>) => {
    try {
      await petApi.update(data as Pet)
      toast('Pet updated!', 'success')
      setModal({ type: 'none' })
      load()
    } catch (e: any) { toast(e.message, 'error') }
  }

  const handleDelete = async (pet: Pet) => {
    if (!confirm(`Delete ${pet.name}?`)) return
    try {
      await petApi.delete(pet.id)
      toast(`${pet.name} deleted`, 'success')
      load()
    } catch (e: any) { toast(e.message, 'error') }
  }

  const isOpen = modal.type === 'addPet' || modal.type === 'editPet' || modal.type === 'viewPet'

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search pets…"
            className="pl-9"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <Select value={status} onValueChange={v => setStatus(v as PetStatus)}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={load} disabled={loading}>
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
        </Button>
        <Button onClick={() => setModal({ type: 'addPet' })}>
          <Plus className="h-4 w-4" /> Add Pet
        </Button>
      </div>

      {/* Count */}
      <p className="text-sm text-muted-foreground">
        {loading ? 'Loading…' : `${filtered.length} pet${filtered.length !== 1 ? 's' : ''} found`}
      </p>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 flex items-center gap-3">
          <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((pet, i) => (
            <div
              key={pet.id}
              className="group rounded-2xl border border-border bg-card p-4 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div className="flex items-start gap-3">
                <PetAvatar pet={pet} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold font-display truncate">{pet.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={statusBadgeVariant(pet.status) as any}>{pet.status ?? '—'}</Badge>
                    {pet.category?.name && (
                      <span className="text-xs text-muted-foreground truncate">{pet.category.name}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setModal({ type: 'viewPet', pet })}>
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setModal({ type: 'editPet', pet })}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(pet)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-mono">#{pet.id}</span>
                {pet.tags && pet.tags.length > 0 && (
                  <div className="flex gap-1">
                    {pet.tags.slice(0, 2).map(t => (
                      <Badge key={t.id} variant="outline" className="text-[10px] py-0">{t.name}</Badge>
                    ))}
                    {pet.tags.length > 2 && <Badge variant="outline" className="text-[10px] py-0">+{pet.tags.length - 2}</Badge>}
                  </div>
                )}
              </div>
            </div>
          ))}

          {filtered.length === 0 && !loading && (
            <div className="col-span-full flex flex-col items-center gap-3 py-16 text-muted-foreground">
              <Dog className="h-12 w-12 opacity-20" />
              <p className="text-sm">No pets found</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <Dialog open={isOpen} onOpenChange={open => !open && setModal({ type: 'none' })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modal.type === 'addPet' && 'Add a new pet'}
              {modal.type === 'editPet' && `Edit ${(modal as any).pet?.name}`}
              {modal.type === 'viewPet' && `${(modal as any).pet?.name}`}
            </DialogTitle>
          </DialogHeader>
          {modal.type === 'addPet' && (
            <PetForm onSubmit={handleAdd} onClose={() => setModal({ type: 'none' })} />
          )}
          {modal.type === 'editPet' && (
            <PetForm initial={(modal as any).pet} onSubmit={handleEdit} onClose={() => setModal({ type: 'none' })} />
          )}
          {modal.type === 'viewPet' && (
            <PetDetail pet={(modal as any).pet} onClose={() => setModal({ type: 'none' })} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
