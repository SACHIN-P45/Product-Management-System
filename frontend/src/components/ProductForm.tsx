import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PackageOpen, DollarSign, Hash, Loader2 } from 'lucide-react';
import { Product } from '../types/product';

interface ProductFormProps {
    initialData?: Product;
    onSubmit: (data: Omit<Product, 'id'>) => Promise<void>;
    isLoading: boolean;
}

export default function ProductForm({ initialData, onSubmit, isLoading }: ProductFormProps) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        stock: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                price: initialData.price.toString(),
                stock: initialData.stock.toString()
            });
        }
    }, [initialData]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) < 0) newErrors.price = 'Valid positive price is required';
        if (!formData.stock || isNaN(Number(formData.stock)) || Number(formData.stock) < 0 || !Number.isInteger(Number(formData.stock))) newErrors.stock = 'Valid positive stock integer is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (validate()) {
            await onSubmit({
                name: formData.name,
                price: Number(formData.price),
                stock: Number(formData.stock)
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-2xl mx-auto">
            <div className="bg-white/80 backdrop-blur-xl border border-white shadow-soft rounded-3xl p-6 sm:p-10 animate-fade-in-up">

                <div className="space-y-8">
                    {/* Name Input */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-bold text-slate-700 mb-2">Product Name</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <PackageOpen className={`h-5 w-5 ${errors.name ? 'text-red-400' : 'text-slate-400'}`} />
                            </div>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                placeholder="e.g. Wireless Noise-Cancelling Headphones"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className={`block w-full pl-11 pr-4 py-3.5 bg-slate-50 border rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 transition-all duration-200 ${errors.name
                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50/50'
                                        : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-slate-300 hover:bg-white'
                                    }`}
                            />
                        </div>
                        {errors.name && <p className="mt-2 text-sm text-red-500 font-medium animate-fade-in-up">{errors.name}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        {/* Price Input */}
                        <div>
                            <label htmlFor="price" className="block text-sm font-bold text-slate-700 mb-2">Price Amount</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <DollarSign className={`h-5 w-5 ${errors.price ? 'text-red-400' : 'text-slate-400'}`} />
                                </div>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="price"
                                    id="price"
                                    placeholder="0.00"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className={`block w-full pl-11 pr-4 py-3.5 bg-slate-50 border rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 transition-all duration-200 ${errors.price
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50/50'
                                            : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-slate-300 hover:bg-white'
                                        }`}
                                />
                            </div>
                            {errors.price && <p className="mt-2 text-sm text-red-500 font-medium animate-fade-in-up">{errors.price}</p>}
                        </div>

                        {/* Stock Input */}
                        <div>
                            <label htmlFor="stock" className="block text-sm font-bold text-slate-700 mb-2">Stock Quantity</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Hash className={`h-5 w-5 ${errors.stock ? 'text-red-400' : 'text-slate-400'}`} />
                                </div>
                                <input
                                    type="number"
                                    name="stock"
                                    id="stock"
                                    placeholder="0"
                                    value={formData.stock}
                                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                    className={`block w-full pl-11 pr-4 py-3.5 bg-slate-50 border rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 transition-all duration-200 ${errors.stock
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50/50'
                                            : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-slate-300 hover:bg-white'
                                        }`}
                                />
                            </div>
                            {errors.stock && <p className="mt-2 text-sm text-red-500 font-medium animate-fade-in-up">{errors.stock}</p>}
                        </div>
                    </div>
                </div>

                <div className="mt-10 flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="w-full sm:w-auto px-6 py-3.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full sm:w-auto inline-flex justify-center items-center rounded-xl bg-indigo-600 px-8 py-3.5 text-sm font-bold text-white shadow-soft transition-all duration-300 hover:bg-indigo-500 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70 disabled:pointer-events-none disabled:transform-none"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                Saving...
                            </>
                        ) : (
                            'Save Product'
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
}
