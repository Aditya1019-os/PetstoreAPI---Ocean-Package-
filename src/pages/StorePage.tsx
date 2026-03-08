import { useAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { inventoryAtom, inventoryLoadingAtom, orderLookupIdAtom, lookedUpOrderAtom } from '@/atoms'
import { storeApi, type Order } from '@/api/petstore'
import { Button } from '@/components/ui/button'
import { Input, Badge } from '@/components/ui/form-elements'
import { useToast } from '@/components/Toast'
import { RefreshCw, Search, ShoppingBag, Package, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

function statusColor(status?: string) {
  if (status === 'delivered') return 'available'
  if (status === 'approved') return 'pending'
  return 'secondary'
}

export default function StorePage() {
  const [inventory, setInventory] = useAtom(inventoryAtom)
  const [loading, setLoading] = useAtom(inventoryLoadingAtom)
  const [orderId, setOrderId] = useAtom(orderLookupIdAtom)
  const [order, setOrder] = useAtom(lookedUpOrderAtom)
  const [orderLoading, setOrderLoading] = useState(false)
  const { toast } = useToast()

  const loadInventory = async () => {
    setLoading(true)
    try {
      const data = await storeApi.getInventory()
      setInventory(data)
    } catch (e: any) {
      toast(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadInventory() }, [])

  const lookupOrder = async () => {
    const id = parseInt(orderId)
    if (!id) return
    setOrderLoading(true)
    setOrder(null)
    try {
      const data = await storeApi.getOrder(id)
      setOrder(data)
    } catch (e: any) {
      toast(`Order not found: ${e.message}`, 'error')
    } finally {
      setOrderLoading(false)
    }
  }

  const sorted = Object.entries(inventory).sort((a, b) => b[1] - a[1])
  const total = Object.values(inventory).reduce((s, v) => s + v, 0)

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Inventory */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-xl font-bold">Inventory</h2>
            <p className="text-sm text-muted-foreground">{total} total items across {sorted.length} categories</p>
          </div>
          <Button variant="outline" size="icon" onClick={loadInventory} disabled={loading}>
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading inventory…</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {sorted.map(([key, count]) => (
              <div key={key} className="rounded-2xl border border-border bg-card p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-2">
                  <Package className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="font-display text-2xl font-bold text-foreground">{count}</span>
                </div>
                <p className="text-sm font-medium mt-2 capitalize truncate">{key}</p>
              </div>
            ))}
            {sorted.length === 0 && (
              <div className="col-span-full text-center text-sm text-muted-foreground py-8">No inventory data</div>
            )}
          </div>
        )}
      </section>

      {/* Order Lookup */}
      <section>
        <h2 className="font-display text-xl font-bold mb-1">Order Lookup</h2>
        <p className="text-sm text-muted-foreground mb-4">Find an order by its ID</p>

        <div className="flex gap-2 max-w-sm">
          <Input
            type="number"
            placeholder="Order ID…"
            value={orderId}
            onChange={e => setOrderId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && lookupOrder()}
          />
          <Button onClick={lookupOrder} disabled={orderLoading || !orderId}>
            {orderLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>

        {order && (
          <div className="mt-4 rounded-2xl border border-border bg-card p-5 max-w-sm animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <h3 className="font-display font-bold">Order #{order.id}</h3>
              <Badge variant={statusColor(order.status) as any}>{order.status ?? '—'}</Badge>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pet ID</span>
                <span className="font-mono">{order.petId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantity</span>
                <span>{order.quantity}</span>
              </div>
              {order.shipDate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ship date</span>
                  <span>{new Date(order.shipDate).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Complete</span>
                <span>{order.complete ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
