import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Settings2, Loader2 } from 'lucide-react';
import api from '../api/axios';
import ProductForm from '../components/ProductForm';
import { Product } from '../types/product';

export default function EditProduct() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [initialData, setInitialData] = useState<Product | undefined>();
    const [fetchError, setFetchError] = useState('');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                // Since there is no specific GET /products/:id, we use the list endpoint with search logic to find the specific ID
                const res = await api.get(`/products`);
                const product = res.data.data.find((p: Product) => p.id === Number(id));
                if (product) {
                    setInitialData(product);
                } else {
                    setFetchError('Product not found');
                    toast.error('Product not found');
                    navigate('/');
                }
            } catch (error) {
                setFetchError('Failed to fetch product details');
                toast.error('Failed to fetch product details');
            }
        };
        fetchProduct();
    }, [id, navigate]);

    const handleSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            await api.put(`/products/${id}`, data);
            toast.success('Product updated successfully');
            navigate('/');
        } catch (error) {
            toast.error('Failed to update product');
        } finally {
            setIsLoading(false);
        }
    };

    if (fetchError) return (
        <div className="max-w-7xl mx-auto px-4 mt-20 text-center animate-fade-in-up">
            <div className="inline-flex flex-col items-center p-8 bg-red-50 rounded-3xl border border-red-100">
                <span className="text-red-500 font-bold text-lg">{fetchError}</span>
            </div>
        </div>
    );

    if (!initialData) return (
        <div className="max-w-7xl mx-auto px-4 mt-32 flex flex-col items-center justify-center animate-pulse">
            <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mb-4" />
            <span className="text-slate-500 font-medium text-lg">Loading product details...</span>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full animate-fade-in-up">
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center p-3 bg-slate-200 rounded-2xl mb-4 border border-slate-300">
                    <Settings2 className="h-6 w-6 text-slate-700" />
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 sm:text-4xl">
                    Edit Product
                </h2>
                <p className="mt-3 text-lg text-slate-500 max-w-2xl mx-auto font-medium">
                    Modify the details of your existing product below.
                </p>
            </div>
            <ProductForm initialData={initialData} onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
    );
}
