import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Sparkles } from 'lucide-react';
import api from '../api/axios';
import ProductForm from '../components/ProductForm';

export default function AddProduct() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            await api.post('/products', data);
            toast.success('Product created successfully');
            navigate('/');
        } catch (error) {
            toast.error('Failed to create product');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 animate-fade-in-up">
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-2xl mb-4 border border-indigo-200">
                    <Sparkles className="h-6 w-6 text-indigo-600" />
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 sm:text-4xl">
                    Add New Product
                </h2>
                <p className="mt-3 text-lg text-slate-500 max-w-2xl mx-auto font-medium">
                    Create a new listing in your inventory. Fill out the details below.
                </p>
            </div>
            <ProductForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
    );
}
