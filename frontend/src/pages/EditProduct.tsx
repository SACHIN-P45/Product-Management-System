import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Settings2, AlertTriangle, ChevronLeft, RefreshCw } from 'lucide-react';
import api from '../api/axios';
import ProductForm from '../components/ProductForm';
import { Product } from '../types/product';

export default function EditProduct() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [initialData, setInitialData] = useState<Product | undefined>();
    const [fetchLoading, setFetchLoading] = useState(true);
    const [fetchError, setFetchError] = useState('');
    const [submitError, setSubmitError] = useState('');

    const fetchProduct = async () => {
        setFetchLoading(true);
        setFetchError('');
        try {
            // Fetch all products and find by id since no GET /products/:id endpoint exists
            const res = await api.get('/products', { params: { limit: 1000, offset: 0 } });
            const product = res.data.data.find((p: Product) => p.id === Number(id));
            if (product) {
                setInitialData(product);
            } else {
                setFetchError('Product not found. It may have been deleted.');
            }
        } catch (err: any) {
            const msg = err.userMessage || 'Failed to fetch product details.';
            setFetchError(msg);
            toast.error(msg, { id: 'fetch-error' });
        } finally {
            setFetchLoading(false);
        }
    };

    useEffect(() => { fetchProduct(); }, [id]);

    const handleSubmit = async (data: Omit<Product, 'id' | 'created_at'>) => {
        setIsLoading(true);
        setSubmitError('');
        try {
            await api.put(`/products/${id}`, data);
            toast.success('Product updated successfully!');
            navigate('/');
        } catch (err: any) {
            const msg = err.userMessage || 'Failed to update product. Please try again.';
            setSubmitError(msg);
            toast.error(msg, { id: 'update-error' });
        } finally {
            setIsLoading(false);
        }
    };

    // ─── Loading State ────────────────────────────────────────────────────────
    if (fetchLoading) return (
        <div className="flex flex-col items-center justify-center py-32 animate-fade-in">
            <div className="relative w-16 h-16 mb-6">
                <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20" />
                <div className="absolute inset-0 rounded-full border-t-2 border-indigo-500 animate-spin" />
                <div className="absolute inset-3 rounded-full bg-indigo-500/10 flex items-center justify-center">
                    <Settings2 className="w-5 h-5 text-indigo-400" />
                </div>
            </div>
            <p className="text-sm font-semibold text-gray-400">Loading product details...</p>
            <p className="text-xs text-gray-600 mt-1">Please wait</p>
        </div>
    );

    // ─── Error State ──────────────────────────────────────────────────────────
    if (fetchError) return (
        <div className="flex flex-col items-center justify-center py-24 animate-fade-in-up">
            <div className="glass-card rounded-3xl p-10 max-w-md w-full text-center border border-rose-500/20 shadow-glass">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-5">
                    <AlertTriangle className="w-8 h-8 text-rose-400" />
                </div>
                <h3 className="text-xl font-extrabold text-white mb-2">Oops!</h3>
                <p className="text-sm text-gray-400 font-medium mb-6 leading-relaxed">{fetchError}</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={fetchProduct}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl glass border border-white/10 text-sm font-bold text-gray-300 hover:bg-white/10 transition-all"
                    >
                        <RefreshCw className="w-4 h-4" /> Retry
                    </button>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-bold text-white shadow-btn transition-all"
                    >
                        <ChevronLeft className="w-4 h-4" /> Back to Inventory
                    </Link>
                </div>
            </div>
        </div>
    );

    // ─── Main Form ────────────────────────────────────────────────────────────
    return (
        <div className="w-full animate-fade-in-up">
            {/* Back button */}
            <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-300 mb-6 transition-colors group"
            >
                <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                Back to Inventory
            </Link>

            {/* Page header */}
            <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold mb-4">
                    <Settings2 className="w-3.5 h-3.5" />
                    Edit Mode — #{id}
                </div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">Edit Product</h1>
                <p className="text-gray-500 text-sm mt-2 font-medium">
                    Modify the details of your existing product. Changes are saved immediately.
                </p>
            </div>

            <ProductForm
                initialData={initialData}
                onSubmit={handleSubmit}
                isLoading={isLoading}
                submitError={submitError}
            />
        </div>
    );
}
