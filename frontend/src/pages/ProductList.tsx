import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDebounce } from 'use-debounce';
import toast from 'react-hot-toast';
import {
    Pencil, Trash2, Plus, ArrowUpDown, ArrowUp, ArrowDown,
    ChevronLeft, ChevronRight, Search, PackageOpen, AlertTriangle,
    Package, TrendingUp, Layers, WifiOff, RefreshCw, X,
} from 'lucide-react';
import api from '../api/axios';
import { Product, ProductsResponse } from '../types/product';

// ─── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, sublabel }: {
    label: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    sublabel?: string;
}) {
    const iconColor = color.includes('indigo') ? 'text-indigo-400'
        : color.includes('violet') ? 'text-violet-400'
            : color.includes('emerald') ? 'text-emerald-400'
                : 'text-amber-400';
    const iconBg = color.replace('border-', 'bg-').replace('/20', '/10');

    return (
        <div className={`glass-card rounded-2xl p-4 sm:p-5 border ${color} animate-fade-in-up shine`}>
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-500 mb-1 truncate">{label}</p>
                    <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{value}</p>
                    {sublabel && <p className="text-[10px] sm:text-xs text-gray-500 mt-1 font-medium">{sublabel}</p>}
                </div>
                <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${iconColor}`} />
                </div>
            </div>
        </div>
    );
}

// ─── Skeleton Row ──────────────────────────────────────────────────────────────
function SkeletonRow() {
    return (
        <tr className="border-b border-white/[0.04]">
            <td className="py-4 pl-4 sm:pl-6 pr-3">
                <div className="flex items-center gap-3">
                    <div className="skeleton w-9 h-9 sm:w-10 sm:h-10 rounded-xl shrink-0" />
                    <div className="space-y-2 min-w-0">
                        <div className="skeleton h-3.5 w-28 sm:w-32 rounded" />
                        <div className="skeleton h-2.5 w-14 sm:w-16 rounded" />
                    </div>
                </div>
            </td>
            <td className="px-4 sm:px-6 py-4 hidden sm:table-cell"><div className="skeleton h-3.5 w-20 rounded" /></td>
            <td className="px-4 sm:px-6 py-4 hidden md:table-cell"><div className="skeleton h-6 w-24 rounded-full" /></td>
            <td className="px-4 sm:px-6 py-4"><div className="skeleton h-8 w-16 ml-auto rounded-lg" /></td>
        </tr>
    );
}

// ─── Skeleton Card (mobile) ────────────────────────────────────────────────────
function SkeletonCard() {
    return (
        <div className="glass-card rounded-2xl p-4 border border-white/[0.08] space-y-3">
            <div className="flex items-center gap-3">
                <div className="skeleton w-10 h-10 rounded-xl shrink-0" />
                <div className="space-y-2 flex-1">
                    <div className="skeleton h-3.5 w-36 rounded" />
                    <div className="skeleton h-2.5 w-16 rounded" />
                </div>
            </div>
            <div className="flex items-center justify-between">
                <div className="skeleton h-6 w-24 rounded-full" />
                <div className="skeleton h-3.5 w-16 rounded" />
            </div>
            <div className="flex gap-2 pt-1 border-t border-white/[0.06]">
                <div className="skeleton h-8 flex-1 rounded-lg" />
                <div className="skeleton h-8 flex-1 rounded-lg" />
            </div>
        </div>
    );
}

// ─── Error Banner ──────────────────────────────────────────────────────────────
function ErrorBanner({ message, onDismiss, onRetry, isNetwork }: {
    message: string;
    onDismiss: () => void;
    onRetry: () => void;
    isNetwork?: boolean;
}) {
    return (
        <div className="mb-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4 flex items-start gap-3 animate-fade-in-up">
            <div className="w-9 h-9 rounded-xl bg-rose-500/15 flex items-center justify-center shrink-0 mt-0.5">
                {isNetwork ? <WifiOff className="w-4 h-4 text-rose-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-rose-300">
                    {isNetwork ? 'Connection Error' : 'Failed to Load Products'}
                </p>
                <p className="text-xs text-rose-400/80 mt-0.5 font-medium leading-relaxed">{message}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <button
                    onClick={onRetry}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold transition-colors"
                >
                    <RefreshCw className="w-3 h-3" />
                    <span className="hidden sm:inline">Retry</span>
                </button>
                <button onClick={onDismiss} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 transition-colors">
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}

// ─── Mobile Product Card ───────────────────────────────────────────────────────
function ProductCard({ product, onDelete }: { product: Product; onDelete: (id: number) => void }) {
    const stock = Number(product.stock);
    const getStockBadge = (s: number) => {
        if (s > 10) return { cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400', label: `${s} in stock` };
        if (s > 0) return { cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20', dot: 'bg-amber-400', label: `${s} low stock` };
        return { cls: 'bg-rose-500/10 text-rose-400 border-rose-500/20', dot: 'bg-rose-400 animate-pulse', label: 'Out of stock' };
    };
    const badge = getStockBadge(stock);

    return (
        <div className="glass-card rounded-2xl p-4 border border-white/[0.08] animate-fade-in-up">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-indigo-400">{product.name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-200 truncate">{product.name}</p>
                    <p className="text-xs text-gray-600">#{product.id}</p>
                </div>
                <span className="text-sm font-bold text-gray-100 shrink-0">${Number(product.price).toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between mb-3">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${badge.cls}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                    {badge.label}
                </span>
            </div>

            <div className="flex gap-2 pt-3 border-t border-white/[0.06]">
                <Link
                    to={`/edit/${product.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 hover:border-indigo-500/40 text-indigo-400 text-xs font-bold transition-all"
                >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                </Link>
                <button
                    onClick={() => onDelete(product.id)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/40 text-rose-400 text-xs font-bold transition-all"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                </button>
            </div>
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function ProductList() {
    const [products, setProducts] = useState<Product[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isNetworkError, setIsNetworkError] = useState(false);

    // Search driven by URL param ?q= (shared with header search bar)
    const [searchParams, setSearchParams] = useSearchParams();
    const search = searchParams.get('q') ?? '';
    const [debouncedSearch] = useDebounce(search, 400);

    const setSearch = (value: string) => {
        setSearchParams(value ? { q: value } : {}, { replace: true });
    };

    const [page, setPage] = useState(1);
    const [limit] = useState(7);
    const [sortBy, setSortBy] = useState('id');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Derived stats (from ALL products — fetched separately for accuracy)
    const [allStats, setAllStats] = useState({ inStock: 0, lowStock: 0, totalValue: 0 });

    const fetchStats = async () => {
        try {
            const res = await api.get<ProductsResponse>('/products', { params: { limit: 1000, offset: 0 } });
            const all = res.data.data;
            setAllStats({
                inStock: all.filter(p => Number(p.stock) > 0).length,
                lowStock: all.filter(p => Number(p.stock) > 0 && Number(p.stock) <= 10).length,
                totalValue: all.reduce((acc, p) => acc + Number(p.price) * Number(p.stock), 0),
            });
        } catch { /* silently ignore */ }
    };

    const fetchProducts = async () => {
        setLoading(true);
        setError('');
        setIsNetworkError(false);
        try {
            const offset = (page - 1) * limit;
            const res = await api.get<ProductsResponse>('/products', {
                params: { search: debouncedSearch, limit, offset, sortBy, sortOrder },
            });
            setProducts(res.data.data);
            setTotal(res.data.total);
        } catch (err: any) {
            const msg = err.userMessage || err.response?.data?.error || 'Failed to fetch products.';
            setError(msg);
            setIsNetworkError(!!err.isNetworkError);
            toast.error(err.isNetworkError ? 'Network error — server unreachable' : msg, { id: 'fetch-error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { setPage(1); }, [debouncedSearch]);
    useEffect(() => { fetchProducts(); }, [debouncedSearch, page, limit, sortBy, sortOrder]);
    useEffect(() => { fetchStats(); }, []);

    const handleSort = (column: string) => {
        if (sortBy === column) {
            setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    };

    const SortIcon = ({ col }: { col: string }) => {
        if (sortBy !== col) return <ArrowUpDown className="h-3.5 w-3.5 text-gray-600 ml-1" />;
        return sortOrder === 'asc'
            ? <ArrowUp className="h-3.5 w-3.5 text-indigo-400 ml-1" />
            : <ArrowDown className="h-3.5 w-3.5 text-indigo-400 ml-1" />;
    };

    const handleDelete = async () => {
        if (deleteId === null) return;
        const previousProducts = [...products];
        const previousTotal = total;

        setDeleteLoading(true);
        setProducts(prev => prev.filter(p => p.id !== deleteId));
        setTotal(t => t - 1);

        try {
            await api.delete(`/products/${deleteId}`);
            toast.success('Product deleted successfully');
            setDeleteId(null);
            fetchStats();
        } catch (err: any) {
            setProducts(previousProducts);
            setTotal(previousTotal);
            const msg = err.userMessage || 'Failed to delete product.';
            toast.error(msg);
        } finally {
            setDeleteLoading(false);
            if (deleteId !== null) setDeleteId(null);
        }
    };

    const totalPages = Math.ceil(total / limit);

    const getStockBadge = (stock: number) => {
        if (stock > 10) return { cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400', label: `${stock} in stock` };
        if (stock > 0) return { cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20', dot: 'bg-amber-400', label: `${stock} low stock` };
        return { cls: 'bg-rose-500/10 text-rose-400 border-rose-500/20', dot: 'bg-rose-400 animate-pulse', label: 'Out of stock' };
    };

    const totalValue = allStats.totalValue;

    return (
        <div className="space-y-4 sm:space-y-6 animate-fade-in-up">
            {/* ─── Page Header ─── */}
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">Inventory</h1>
                    <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5 sm:mt-1 hidden sm:block">
                        Manage products, track stock, and optimise listings from one place.
                    </p>
                </div>
                <Link
                    to="/add"
                    className="group inline-flex items-center gap-1.5 sm:gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white shadow-btn transition-all duration-200 hover:shadow-glow-indigo hover:-translate-y-0.5 shrink-0"
                >
                    <Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
                    <span>Add Product</span>
                </Link>
            </div>

            {/* ─── Stat Cards ─── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatCard label="Total Products" value={total} icon={Package} color="border-indigo-500/20" sublabel="in inventory" />
                <StatCard label="In Stock" value={allStats.inStock} icon={Layers} color="border-emerald-500/20" sublabel="available" />
                <StatCard label="Low Stock" value={allStats.lowStock} icon={TrendingUp} color="border-amber-500/20" sublabel="≤10 units" />
                <StatCard
                    label="Total Value"
                    value={`$${totalValue >= 1000 ? (totalValue / 1000).toFixed(1) + 'k' : totalValue.toFixed(0)}`}
                    icon={TrendingUp}
                    color="border-violet-500/20"
                    sublabel="stock × price"
                />
            </div>

            {/* ─── Error Banner ─── */}
            {error && (
                <ErrorBanner
                    message={error}
                    isNetwork={isNetworkError}
                    onDismiss={() => setError('')}
                    onRetry={fetchProducts}
                />
            )}

            {/* ─── Table Card ─── */}
            <div className="glass-card rounded-2xl overflow-hidden border border-white/[0.08] shadow-glass">
                {/* Toolbar */}
                <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-white/[0.06] flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                    <div className="relative flex-1 sm:max-w-xs">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-500" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-9 py-2.5 sm:py-2 text-sm bg-white/5 border border-white/[0.08] rounded-xl text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 justify-between sm:justify-end">
                        <button
                            onClick={fetchProducts}
                            disabled={loading}
                            className="p-2 rounded-lg glass border border-white/[0.08] text-gray-400 hover:text-gray-200 hover:border-white/20 transition-all disabled:opacity-40"
                            title="Refresh"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium bg-white/5 border border-white/[0.06] rounded-xl px-3 py-2">
                            <PackageOpen className="w-3.5 h-3.5 text-indigo-400" />
                            <span><span className="text-white font-bold">{total}</span> products</span>
                        </div>
                    </div>
                </div>

                {/* ─── MOBILE: Card Grid (visible < md) ─── */}
                <div className="block md:hidden">
                    {loading ? (
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
                        </div>
                    ) : products.length === 0 ? (
                        <div className="py-16 flex flex-col items-center justify-center gap-3 px-4 text-center">
                            <div className="w-16 h-16 rounded-2xl glass border border-white/[0.08] flex items-center justify-center mb-1">
                                <PackageOpen className="w-8 h-8 text-gray-600" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-300">
                                {search ? 'No results found' : 'No products yet'}
                            </h3>
                            <p className="text-xs text-gray-600 max-w-xs font-medium">
                                {search
                                    ? `No products match "${search}".`
                                    : 'Add your first product to get started.'}
                            </p>
                            {!search && (
                                <Link to="/add" className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                                    <Plus className="w-4 h-4" /> Add product
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {products.map(product => (
                                <ProductCard key={product.id} product={product} onDelete={setDeleteId} />
                            ))}
                        </div>
                    )}
                </div>

                {/* ─── DESKTOP: Table (visible ≥ md) ─── */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="border-b border-white/[0.06]">
                                {[
                                    { col: 'name', label: 'Product Name', cls: 'pl-6' },
                                    { col: 'price', label: 'Price', cls: 'px-6' },
                                    { col: 'stock', label: 'Stock Status', cls: 'px-6' },
                                ].map(({ col, label, cls }) => (
                                    <th
                                        key={col}
                                        scope="col"
                                        className={`${cls} py-3.5 text-left cursor-pointer select-none`}
                                        onClick={() => handleSort(col)}
                                    >
                                        <div className="inline-flex items-center text-xs font-bold text-gray-500 uppercase tracking-widest hover:text-gray-300 transition-colors">
                                            {label}
                                            <SortIcon col={col} />
                                        </div>
                                    </th>
                                ))}
                                <th scope="col" className="px-6 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-20 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-20 h-20 rounded-2xl glass border border-white/[0.08] flex items-center justify-center mb-2">
                                                <PackageOpen className="w-9 h-9 text-gray-600" />
                                            </div>
                                            <h3 className="text-base font-bold text-gray-300">
                                                {search ? 'No results found' : 'No products yet'}
                                            </h3>
                                            <p className="text-sm text-gray-600 max-w-xs font-medium">
                                                {search
                                                    ? `No products match "${search}". Try a different search term.`
                                                    : 'Get started by adding your first product to the inventory.'}
                                            </p>
                                            {!search && (
                                                <Link to="/add" className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                                                    <Plus className="w-4 h-4" /> Add your first product
                                                </Link>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                products.map((product, idx) => {
                                    const badge = getStockBadge(Number(product.stock));
                                    return (
                                        <tr
                                            key={product.id}
                                            className="group hover:bg-white/[0.03] transition-colors duration-150"
                                            style={{ animationDelay: `${idx * 40}ms` }}
                                        >
                                            {/* Name */}
                                            <td className="whitespace-nowrap py-4 pl-6 pr-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 flex items-center justify-center shrink-0">
                                                        <span className="text-sm font-bold text-indigo-400">
                                                            {product.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-gray-200 group-hover:text-white transition-colors">
                                                            {product.name}
                                                        </div>
                                                        <div className="text-xs text-gray-600 mt-0.5">#{product.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            {/* Price */}
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <span className="text-sm font-bold text-gray-100">
                                                    ${Number(product.price).toFixed(2)}
                                                </span>
                                            </td>
                                            {/* Stock */}
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${badge.cls}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                                                    {badge.label}
                                                </span>
                                            </td>
                                            {/* Actions — always visible on desktop */}
                                            <td className="whitespace-nowrap px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        to={`/edit/${product.id}`}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 hover:border-indigo-500/40 text-indigo-400 text-xs font-bold transition-all"
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" />
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => setDeleteId(product.id)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/40 text-rose-400 text-xs font-bold transition-all"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ─── Pagination ─── */}
                {!loading && totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-5 py-4 border-t border-white/[0.06]">
                        <p className="text-xs text-gray-500 font-medium order-2 sm:order-1">
                            Showing{' '}
                            <span className="text-gray-300 font-bold">{(page - 1) * limit + 1}</span>
                            {' '}–{' '}
                            <span className="text-gray-300 font-bold">{Math.min(page * limit, total)}</span>
                            {' '}of{' '}
                            <span className="text-gray-300 font-bold">{total}</span>
                        </p>
                        <nav className="flex items-center gap-1 order-1 sm:order-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="w-9 h-9 flex items-center justify-center rounded-lg glass border border-white/[0.08] text-gray-400 hover:text-gray-200 hover:border-white/20 disabled:opacity-30 disabled:pointer-events-none transition-all"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>

                            {/* Show limited page buttons on mobile */}
                            {Array.from({ length: totalPages }).map((_, i) => {
                                const p = i + 1;
                                // On mobile show only current, prev, next pages
                                const isVisible = Math.abs(p - page) <= 1 || p === 1 || p === totalPages;
                                const isEllipsis = !isVisible && (p === page - 2 || p === page + 2);
                                if (isEllipsis) return <span key={p} className="text-gray-600 text-xs px-1">…</span>;
                                if (!isVisible && !isEllipsis) return null;
                                return (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={`w-9 h-9 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${page === p
                                            ? 'bg-indigo-600 text-white shadow-glow-sm'
                                            : 'glass border border-white/[0.08] text-gray-400 hover:text-gray-200 hover:border-white/20'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="w-9 h-9 flex items-center justify-center rounded-lg glass border border-white/[0.08] text-gray-400 hover:text-gray-200 hover:border-white/20 disabled:opacity-30 disabled:pointer-events-none transition-all"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </nav>
                    </div>
                )}
            </div>

            {/* ─── Delete Modal ─── */}
            {deleteId !== null && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div
                        className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm"
                        onClick={() => !deleteLoading && setDeleteId(null)}
                    />
                    {/* Bottom sheet on mobile, centred dialog on desktop */}
                    <div className="relative glass-card w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-6 sm:p-7 shadow-glass border-t sm:border border-white/[0.10] animate-fade-in-up sm:animate-scale-in">
                        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5 sm:hidden" />
                        <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/20 flex items-center justify-center mb-5">
                            <Trash2 className="w-7 h-7 text-rose-400" />
                        </div>
                        <h3 className="text-xl font-extrabold text-white mb-2">Delete Product</h3>
                        <p className="text-sm text-gray-400 font-medium mb-7 leading-relaxed">
                            Are you sure you want to permanently delete this product? This action{' '}
                            <span className="text-rose-400 font-bold">cannot be undone</span>.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteId(null)}
                                disabled={deleteLoading}
                                className="flex-1 py-3 rounded-xl glass border border-white/10 text-sm font-bold text-gray-300 hover:bg-white/10 transition-all disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleteLoading}
                                className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-sm font-bold text-white shadow-danger transition-all hover:shadow-lg disabled:opacity-70 disabled:pointer-events-none inline-flex items-center justify-center gap-2"
                            >
                                {deleteLoading ? (
                                    <><RefreshCw className="w-4 h-4 animate-spin" />Deleting...</>
                                ) : (
                                    <><Trash2 className="w-4 h-4" />Delete</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
