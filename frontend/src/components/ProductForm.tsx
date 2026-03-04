import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package2, DollarSign, Hash, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Product } from '../types/product';

interface ProductFormProps {
    initialData?: Product;
    onSubmit: (data: Omit<Product, 'id' | 'created_at'>) => Promise<void>;
    isLoading: boolean;
    submitError?: string;
}

interface FieldMeta {
    touched: boolean;
    dirty: boolean;
}

export default function ProductForm({ initialData, onSubmit, isLoading, submitError }: ProductFormProps) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', price: '', stock: '' });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [meta, setMeta] = useState<Record<string, FieldMeta>>({
        name: { touched: false, dirty: false },
        price: { touched: false, dirty: false },
        stock: { touched: false, dirty: false },
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                price: initialData.price.toString(),
                stock: initialData.stock.toString(),
            });
        }
    }, [initialData]);

    const validate = (data = formData) => {
        const newErrors: Record<string, string> = {};
        const trimmedName = data.name.trim();
        if (!trimmedName) newErrors.name = 'Product name is required.';
        else if (trimmedName.length < 2) newErrors.name = 'Name must be at least 2 characters.';
        else if (trimmedName.length > 100) newErrors.name = 'Name must not exceed 100 characters.';

        const price = Number(data.price);
        if (data.price === '' || isNaN(price)) newErrors.price = 'A valid price is required.';
        else if (price < 0) newErrors.price = 'Price cannot be negative.';
        else if (price > 1_000_000) newErrors.price = 'Price cannot exceed $1,000,000.';

        const stock = Number(data.stock);
        if (data.stock === '' || isNaN(stock)) newErrors.stock = 'A valid stock quantity is required.';
        else if (!Number.isInteger(stock)) newErrors.stock = 'Stock must be a whole number.';
        else if (stock < 0) newErrors.stock = 'Stock cannot be negative.';
        else if (stock > 1_000_000) newErrors.stock = 'Stock cannot exceed 1,000,000.';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (field: string, value: string) => {
        const updated = { ...formData, [field]: value };
        setFormData(updated);
        setMeta(prev => ({ ...prev, [field]: { touched: true, dirty: true } }));
        // Validate only if previously touched
        if (meta[field]?.touched) {
            validate(updated);
        }
    };

    const handleBlur = (field: string) => {
        setMeta(prev => ({ ...prev, [field]: { ...prev[field], touched: true } }));
        validate();
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        // Mark all touched
        setMeta({
            name: { touched: true, dirty: true },
            price: { touched: true, dirty: true },
            stock: { touched: true, dirty: true },
        });
        if (!validate()) return;

        await onSubmit({
            name: formData.name.trim(),
            price: Number(formData.price),
            stock: Number(formData.stock),
        });
    };

    const isEditing = !!initialData;

    const fieldClass = (field: string) => {
        const hasError = !!errors[field];
        const isValid = meta[field]?.touched && !hasError && formData[field as keyof typeof formData];
        return [
            'block w-full pl-11 pr-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200',
            'bg-white/[0.04] border placeholder-gray-600 text-gray-100',
            'focus:outline-none focus:ring-2',
            hasError
                ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-500/[0.04]'
                : isValid
                    ? 'border-emerald-500/40 focus:border-emerald-500/60 focus:ring-emerald-500/15 bg-emerald-500/[0.03]'
                    : 'border-white/[0.08] focus:border-indigo-500/60 focus:ring-indigo-500/20 hover:border-white/20',
        ].join(' ');
    };

    return (
        <form onSubmit={handleSubmit} noValidate className="w-full max-w-2xl mx-auto animate-fade-in-up">
            <div className="glass-card rounded-2xl border border-white/[0.08] shadow-glass overflow-hidden">
                {/* Form Header */}
                <div className="px-5 sm:px-8 py-5 sm:py-6 border-b border-white/[0.06] bg-gradient-to-r from-indigo-500/5 to-violet-500/5">
                    <h2 className="text-sm sm:text-base font-bold text-gray-200">
                        {isEditing ? 'Update product details' : 'New product details'}
                    </h2>
                    <p className="text-xs text-gray-500 mt-1 font-medium">
                        {isEditing
                            ? 'Modify the fields below and save to update.'
                            : 'Fill in all required fields to add to your inventory.'}
                    </p>
                </div>

                <div className="px-5 sm:px-8 py-6 sm:py-8 space-y-5 sm:space-y-6">
                    {/* Submit Error Banner */}
                    {submitError && (
                        <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 px-4 py-3.5 flex items-start gap-3 animate-fade-in-up">
                            <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                            <p className="text-sm text-rose-300 font-medium leading-relaxed">{submitError}</p>
                        </div>
                    )}

                    {/* Product Name */}
                    <div>
                        <label htmlFor="name" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                            Product Name <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Package2 className={`h-4 w-4 ${errors.name ? 'text-rose-400' : meta.name.touched && !errors.name && formData.name ? 'text-emerald-400' : 'text-gray-600'}`} />
                            </div>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                placeholder="e.g. Wireless Noise-Cancelling Headphones"
                                value={formData.name}
                                onChange={e => handleChange('name', e.target.value)}
                                onBlur={() => handleBlur('name')}
                                className={fieldClass('name')}
                                autoComplete="off"
                                maxLength={100}
                            />
                            {meta.name.touched && formData.name && !errors.name && (
                                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                </div>
                            )}
                        </div>
                        {errors.name && meta.name.touched && (
                            <p className="mt-1.5 text-xs text-rose-400 font-semibold flex items-center gap-1.5 animate-fade-in-up">
                                <AlertCircle className="w-3 h-3" /> {errors.name}
                            </p>
                        )}
                        <p className="mt-1 text-xs text-gray-600 font-medium">{formData.name.length}/100</p>
                    </div>

                    {/* Price & Stock row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Price */}
                        <div>
                            <label htmlFor="price" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                                Price (USD) <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <DollarSign className={`h-4 w-4 ${errors.price ? 'text-rose-400' : meta.price.touched && !errors.price && formData.price ? 'text-emerald-400' : 'text-gray-600'}`} />
                                </div>
                                <input
                                    type="number"
                                    id="price"
                                    name="price"
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                    max="1000000"
                                    value={formData.price}
                                    onChange={e => handleChange('price', e.target.value)}
                                    onBlur={() => handleBlur('price')}
                                    className={fieldClass('price')}
                                />
                            </div>
                            {errors.price && meta.price.touched && (
                                <p className="mt-1.5 text-xs text-rose-400 font-semibold flex items-center gap-1.5 animate-fade-in-up">
                                    <AlertCircle className="w-3 h-3" /> {errors.price}
                                </p>
                            )}
                        </div>

                        {/* Stock */}
                        <div>
                            <label htmlFor="stock" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                                Stock Qty <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Hash className={`h-4 w-4 ${errors.stock ? 'text-rose-400' : meta.stock.touched && !errors.stock && formData.stock ? 'text-emerald-400' : 'text-gray-600'}`} />
                                </div>
                                <input
                                    type="number"
                                    id="stock"
                                    name="stock"
                                    placeholder="0"
                                    step="1"
                                    min="0"
                                    max="1000000"
                                    value={formData.stock}
                                    onChange={e => handleChange('stock', e.target.value)}
                                    onBlur={() => handleBlur('stock')}
                                    className={fieldClass('stock')}
                                />
                            </div>
                            {errors.stock && meta.stock.touched && (
                                <p className="mt-1.5 text-xs text-rose-400 font-semibold flex items-center gap-1.5 animate-fade-in-up">
                                    <AlertCircle className="w-3 h-3" /> {errors.stock}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-5 sm:px-8 py-4 sm:py-5 border-t border-white/[0.06] flex flex-col sm:flex-row-reverse justify-start gap-3 bg-white/[0.02]">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full sm:w-auto px-8 py-3 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-btn hover:shadow-glow-indigo hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none disabled:transform-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 inline-flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {isEditing ? 'Updating...' : 'Creating...'}
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-4 h-4" />
                                {isEditing ? 'Update Product' : 'Create Product'}
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        disabled={isLoading}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold text-gray-400 glass border border-white/10 hover:bg-white/10 hover:text-gray-200 transition-all disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-white/20"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </form>
    );
}
