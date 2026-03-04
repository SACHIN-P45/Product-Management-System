import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation, useSearchParams } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Package, LayoutDashboard, PlusCircle, Settings, Search, ChevronRight, X, Menu } from 'lucide-react';
import ProductList from './pages/ProductList';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import ErrorBoundary from './components/ErrorBoundary';

// ─── Breadcrumb ──────────────────────────────────────────────────────────────
function Breadcrumb() {
    const location = useLocation();
    const map: Record<string, string> = {
        '/': 'Inventory',
        '/add': 'Add Product',
    };
    const isEdit = location.pathname.startsWith('/edit/');
    const label = isEdit ? 'Edit Product' : (map[location.pathname] || 'Page');

    return (
        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
            <span className="text-gray-400">ProDash</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-indigo-400">{label}</span>
        </div>
    );
}

// ─── Header Search ────────────────────────────────────────────────────────────
function HeaderSearch() {
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();
    const isInventory = location.pathname === '/';
    const value = searchParams.get('q') ?? '';

    if (!isInventory) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        setSearchParams(v ? { q: v } : {}, { replace: true });
    };

    const handleClear = () => setSearchParams({}, { replace: true });

    return (
        <div className="relative hidden lg:flex items-center">
            <div className="absolute left-3 flex items-center pointer-events-none">
                <Search className="w-3.5 h-3.5 text-gray-500" />
            </div>
            <input
                type="text"
                value={value}
                onChange={handleChange}
                placeholder="Search products..."
                className="w-64 pl-9 pr-8 py-1.5 rounded-lg glass border border-white/[0.08] text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 hover:border-white/[0.15] transition-all"
            />
            {value && (
                <button
                    onClick={handleClear}
                    className="absolute right-2.5 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                    aria-label="Clear search"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            )}
        </div>
    );
}

// ─── Sidebar Nav Items ────────────────────────────────────────────────────────
const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Inventory', end: true },
    { to: '/add', icon: PlusCircle, label: 'Add Product', end: false },
];

function SidebarNav({ onNavClick }: { onNavClick?: () => void }) {
    return (
        <nav className="flex-1 p-4 space-y-1">
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-3 mb-3">Main Menu</p>
            {navItems.map(({ to, icon: Icon, label, end }) => (
                <NavLink
                    key={to}
                    to={to}
                    end={end}
                    onClick={onNavClick}
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group shine ${isActive
                            ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-glow-sm'
                            : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'
                        }`
                    }
                >
                    {({ isActive }) => (
                        <>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isActive ? 'bg-indigo-500/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
                                <Icon className="w-4 h-4" />
                            </div>
                            {label}
                            {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                        </>
                    )}
                </NavLink>
            ))}
        </nav>
    );
}

// ─── App Layout ───────────────────────────────────────────────────────────────
function AppLayout() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();

    // Close mobile drawer on route change
    useEffect(() => { setMobileOpen(false); }, [location.pathname]);

    // Prevent body scroll when drawer is open
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    return (
        <div className="flex min-h-screen bg-gray-950 relative overflow-hidden">
            {/* Ambient background */}
            <div className="orb orb-1" />
            <div className="orb orb-2" />
            <div className="orb orb-3" />

            {/* ─── Mobile Drawer Overlay ──────────────────────────────────── */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-950/70 backdrop-blur-sm md:hidden animate-fade-in"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* ─── Mobile Drawer ──────────────────────────────────────────── */}
            <aside
                className={`fixed top-0 left-0 h-full w-72 z-50 flex flex-col glass border-r border-white/[0.08] shadow-glass md:hidden transition-transform duration-300 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Drawer header */}
                <div className="h-16 flex items-center justify-between px-5 border-b border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-glow-sm">
                            <Package className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <span className="text-base font-bold text-white tracking-tight">ProDash</span>
                            <p className="text-[10px] text-gray-500 font-medium tracking-widest uppercase">Inventory</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setMobileOpen(false)}
                        className="w-8 h-8 rounded-lg glass border border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                        aria-label="Close menu"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <SidebarNav onNavClick={() => setMobileOpen(false)} />

                {/* Drawer Footer */}
                <div className="p-4 border-t border-white/[0.06]">
                    <div className="flex items-center gap-3 p-3 rounded-xl glass-hover border border-transparent cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-glow-sm">
                            A
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-200 truncate">Admin</p>
                            <p className="text-xs text-gray-500 truncate">admin@prodash.io</p>
                        </div>
                        <Settings className="w-4 h-4 text-gray-600 shrink-0" />
                    </div>
                </div>
            </aside>

            {/* ─── Desktop Sidebar ────────────────────────────────────────── */}
            <aside className="hidden md:flex flex-col w-64 shrink-0 glass border-r border-white/[0.06] z-20 relative">
                {/* Logo */}
                <div className="h-16 flex items-center px-6 border-b border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-glow-sm">
                            <Package className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <span className="text-base font-bold text-white tracking-tight">ProDash</span>
                            <p className="text-[10px] text-gray-500 font-medium tracking-widest uppercase">Inventory</p>
                        </div>
                    </div>
                </div>

                <SidebarNav />

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-white/[0.06]">
                    <div className="flex items-center gap-3 p-3 rounded-xl glass-hover border border-transparent cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-glow-sm">
                            A
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-200 truncate">Admin</p>
                            <p className="text-xs text-gray-500 truncate">admin@prodash.io</p>
                        </div>
                        <Settings className="w-4 h-4 text-gray-600 shrink-0" />
                    </div>
                </div>
            </aside>

            {/* ─── Main Content ───────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col min-w-0 z-10">
                {/* Top bar */}
                <header className="h-16 glass border-b border-white/[0.06] flex items-center px-4 sm:px-6 gap-3 sticky top-0 z-30">
                    {/* Hamburger - mobile only */}
                    <button
                        onClick={() => setMobileOpen(true)}
                        className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl glass border border-white/[0.08] text-gray-400 hover:text-white hover:border-white/20 transition-all shrink-0"
                        aria-label="Open menu"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    {/* Mobile logo (between hamburger & right section) */}
                    <div className="flex md:hidden items-center gap-2 flex-1 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0">
                            <Package className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-sm font-bold text-white truncate">ProDash</span>
                    </div>

                    {/* Breadcrumb - desktop */}
                    <div className="hidden md:block flex-1">
                        <Breadcrumb />
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        {/* Global search — desktop inventory page only */}
                        <HeaderSearch />

                        {/* Avatar */}
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white cursor-pointer shadow-glow-sm shrink-0">
                            A
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-auto">
                    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                        <ErrorBoundary>
                            <Routes>
                                <Route path="/" element={<ProductList />} />
                                <Route path="/add" element={<AddProduct />} />
                                <Route path="/edit/:id" element={<EditProduct />} />
                            </Routes>
                        </ErrorBoundary>
                    </div>
                </main>
            </div>

            {/* Toast notifications */}
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: 'rgba(17, 19, 24, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.10)',
                        color: '#e2e4ef',
                        borderRadius: '14px',
                        fontSize: '14px',
                        fontWeight: '500',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                        padding: '12px 16px',
                        maxWidth: '90vw',
                    },
                    success: {
                        iconTheme: { primary: '#34d399', secondary: '#064e3b' },
                        style: { borderLeft: '3px solid #34d399' },
                    },
                    error: {
                        iconTheme: { primary: '#fb7185', secondary: '#4c0519' },
                        style: { borderLeft: '3px solid #fb7185' },
                    },
                    duration: 4500,
                }}
            />
        </div>
    );
}

export default function App() {
    return (
        <Router>
            <AppLayout />
        </Router>
    );
}
