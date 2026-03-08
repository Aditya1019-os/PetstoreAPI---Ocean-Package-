import { useAtom } from 'jotai'
import { activeTabAtom, type Tab, loggedInUsernameAtom } from '@/atoms'
import { ToastContainer } from '@/components/Toast'
import PetsPage from '@/pages/PetsPage'
import StorePage from '@/pages/StorePage'
import UsersPage from '@/pages/UsersPage'
import { PawPrint, ShoppingBag, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'pets', label: 'Pets', icon: <PawPrint className="h-4 w-4" /> },
  { id: 'store', label: 'Store', icon: <ShoppingBag className="h-4 w-4" /> },
  { id: 'users', label: 'Users', icon: <Users className="h-4 w-4" /> },
]

export default function App() {
  const [tab, setTab] = useAtom(activeTabAtom)
  const [loggedIn] = useAtom(loggedInUsernameAtom)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <PawPrint className="h-4 w-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">PawStore</span>
          </div>

          {/* Tab nav */}
          <nav className="flex items-center gap-1 bg-muted rounded-xl p-1">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150',
                  tab === t.id
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {t.icon}
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </nav>

          {loggedIn && (
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-6 w-6 rounded-full bg-primary/15 flex items-center justify-center">
                <Users className="h-3 w-3 text-primary" />
              </div>
              <span>@{loggedIn}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {tab === 'pets' && <PetsPage />}
        {tab === 'store' && <StorePage />}
        {tab === 'users' && <UsersPage />}
      </main>

      <ToastContainer />
    </div>
  )
}
