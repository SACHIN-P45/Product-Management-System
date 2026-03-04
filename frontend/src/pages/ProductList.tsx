import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDebounce } from 'use-debounce';
import toast from 'react-hot-toast';
import { Pencil, Trash2, Plus, ArrowUpDown, ChevronLeft, ChevronRight, Search, PackageOpen, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import { Product, ProductsResponse } from '../types/product';

export default function ProductList() {
    const [products, setProducts] = useState<Product[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Filters and pagination
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounce(search, 500);
    const [page, setPage] = useState(1);
    const [limit] = useState(5);
    const [sortBy, setSortBy] = useState('id');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Delete Confirmation State
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const fetchProducts = async () => {
        setLoading(true);
        setError('');
        try {
            const offset = (page - 1) * limit;
            const res = await api.get<ProductsResponse>(`/products`, {
                params: {
                    search: debouncedSearch,
                    limit,
                    offset,
                    sortBy,
                    sortOrder
                }
            });
            setProducts(res.data.data);
            setTotal(res.data.total);
        } catch (err: any) {
            const serverError = err.response?.data?.error || err.response?.data?.message || 'Failed to fetch products';
            const actionRequired = err.response?.data?.action_required;
            const fullErrorMsg = actionRequired ? `${serverError}: ${actionRequired}` : serverError;
            setError(fullErrorMsg);
            toast.error(serverError);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setPage(1); // Reset to first page on search change
    }, [debouncedSearch]);

    useEffect(() => {
        fetchProducts();
    }, [debouncedSearch, page, limit, sortBy, sortOrder]);

    const handleSort = (column: string) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    };

    const handleDelete = async () => {
        if (deleteId === null) return;

        // Optimistic UI update
        const previousProducts = [...products];
        setProducts(products.filter(p => p.id !== deleteId));
        setTotal(total - 1);

        try {
            await api.delete(`/products/${deleteId}`);
            toast.success('Product deleted successfully');
        } catch (err) {
            // Revert changes on error
            setProducts(previousProducts);
            setTotal(total);
            toast.error('Failed to delete product');
        } finally {
            setDeleteId(null);
        }
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="px-4 sm:px-6 lg:px-8 w-full animate-fade-in-up">
            {/* Header Section */}
            <div className="sm:flex sm:items-center sm:justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Inventory</h2>
                    <p className="mt-2 text-sm text-slate-500 font-medium max-w-2xl">
                        Manage your products, track inventory, and optimize your listings all from one place.
                    </p>
                </div>
                <div className="mt-4 sm:mt-0">
                    <Link
                        to="/add"
                        className="group inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-all duration-300 hover:bg-indigo-500 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 w-full sm:w-auto"
                    >
                        <Plus className="mr-2 h-5 w-5 transition-transform group-hover:rotate-90" />
                        Add Product
                    </Link>
                </div>
            </div>

            {/* Top Toolbar */}
            <div className="mb-6 bg-white/60 backdrop-blur-xl border border-white p-4 rounded-2xl shadow-glass-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search products by name..."
                        className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl leading-5 bg-white/80 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all shadow-sm hover:border-slate-300"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center text-sm font-medium text-slate-500 bg-white/80 px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
                    <PackageOpen className="w-4 h-4 mr-2 text-indigo-500" />
                    Total Products: <span className="ml-1 text-slate-900 font-bold">{total}</span>
                </div>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center shadow-sm">
                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {/* Data Table */}
            <div className="relative rounded-2xl overflow-hidden shadow-soft bg-white/40 backdrop-blur-md border border-white">
                {loading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10 transition-opacity">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                    </div>
                )}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200/50">
                        <thead className="bg-slate-50/80 backdrop-blur-md">
                            <tr>
                                <th scope="col" className="py-4 pl-6 pr-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors rounded-tl-xl" onClick={() => handleSort('name')}>
                                    <div className="flex items-center gap-1.5">Product Name <ArrowUpDown className="h-4 w-4 text-slate-400" /></div>
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('price')}>
                                    <div className="flex items-center gap-1.5">Price <ArrowUpDown className="h-4 w-4 text-slate-400" /></div>
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('stock')}>
                                    <div className="flex items-center gap-1.5">Stock Status <ArrowUpDown className="h-4 w-4 text-slate-400" /></div>
                                </th>
                                <th scope="col" className="relative py-4 pl-3 pr-6 text-right rounded-tr-xl">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white/70">
                            {products.length === 0 && !loading ? (
                                <tr>
                                    <td colSpan={4} className="py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                                                <PackageOpen className="h-10 w-10 text-slate-300" />
                                            </div>
                                            <h3 className="text-lg font-medium text-slate-900 mb-1">No products found</h3>
                                            <p className="text-sm text-slate-500">Get started by adding a new product.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product.id} className="group hover:bg-slate-50/80 transition-all duration-200">
                                        <td className="whitespace-nowrap py-5 pl-6 pr-3">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center border border-indigo-50 shadow-sm">
                                                    <span className="text-indigo-600 font-bold text-sm">
                                                        {product.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">{product.name}</div>
                                                    <div className="text-xs text-slate-500 mt-0.5">ID: #{product.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-5">
                                            <div className="text-sm font-bold text-slate-700">
                                                ${Number(product.price).toFixed(2)}
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-5">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border shadow-sm ${Number(product.stock) > 10
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                : Number(product.stock) > 0
                                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                    : 'bg-red-50 text-red-700 border-red-200'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${Number(product.stock) > 10 ? 'bg-emerald-500' : Number(product.stock) > 0 ? 'bg-amber-500' : 'bg-red-500'
                                                    }`}></span>
                                                {product.stock} in stock
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap py-5 pl-3 pr-6 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                <Link
                                                    to={`/edit/${product.id}`}
                                                    className="p-2 text-indigo-500 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-100"
                                                    title="Edit Product"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() => setDeleteId(product.id)}
                                                    className="p-2 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
                                                    title="Delete Product"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-slate-200/60 bg-slate-50/50 px-6 py-4">
                        <div className="flex flex-1 justify-between sm:hidden">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="relative inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 shadow-sm"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="relative ml-3 inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 shadow-sm"
                            >
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-slate-500 font-medium">
                                    Showing <span className="font-bold text-slate-900">{(page - 1) * limit + 1}</span> to <span className="font-bold text-slate-900">{Math.min(page * limit, total)}</span> of{' '}
                                    <span className="font-bold text-slate-900">{total}</span> results
                                </p>
                            </div>
                            <div>
                                <nav className="isolate inline-flex -space-x-px rounded-xl shadow-sm" aria-label="Pagination">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="relative inline-flex items-center rounded-l-xl px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 bg-white hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 transition-colors"
                                    >
                                        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                                    </button>
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i + 1}
                                            onClick={() => setPage(i + 1)}
                                            className={`relative inline-flex items-center px-4 py-2 text-sm font-bold transition-colors ${page === i + 1
                                                ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 shadow-inner'
                                                : 'text-slate-700 bg-white ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0'
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="relative inline-flex items-center rounded-r-xl px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 bg-white hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 transition-colors"
                                    >
                                        <ChevronRight className="h-5 w-5" aria-hidden="true" />
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteId !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setDeleteId(null)}></div>
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-glass border border-slate-100 relative z-10 transform transition-all scale-100 opacity-100 animate-fade-in-up">
                        <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4 border-4 border-red-50">
                            <AlertCircle className="h-6 w-6 text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Product</h3>
                        <p className="text-sm text-slate-500 mb-6 font-medium">Are you sure you want to delete this product? This action cannot be undone and the product will be permanently removed.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors focus:ring-2 focus:ring-slate-400 focus:outline-none"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 shadow-sm shadow-red-200 hover:shadow-md transition-all focus:ring-2 focus:ring-red-500 focus:outline-none"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
