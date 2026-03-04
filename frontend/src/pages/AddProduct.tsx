import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Sparkles, ChevronLeft } from 'lucide-react';
import api from '../api/axios';
import ProductForm from '../components/ProductForm';
import { Product } from '../types/product';

export default function AddProduct() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const handleSubmit = async (data: Omit<Product, 'id' | 'created_at'>) => {
        setIsLoading(true);
        setSubmitError('');
        try {
            await api.post('/products', data);
            toast.success('Product created successfully! 🎉');
            navigate('/');
        } catch (err: any) {
            const msg = err.userMessage || 'Failed to create product. Please try again.';
            setSubmitError(msg);
            toast.error(msg, { id: 'create-error' });
        } finally {
            setIsLoading(false);
        }
    };

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
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold mb-4">
                    <Sparkles className="w-3.5 h-3.5" />
                    New Product
                </div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">Add Product</h1>
                <p className="text-gray-500 text-sm mt-2 font-medium">
                    Create a new listing in your inventory. All fields are required.
                </p>
            </div>

            <ProductForm onSubmit={handleSubmit} isLoading={isLoading} submitError={submitError} />
        </div>
    );
}
