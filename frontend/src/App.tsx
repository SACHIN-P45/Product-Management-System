import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Package } from 'lucide-react';
import ProductList from './pages/ProductList';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans">
                {/* Abstract Premium Background */}
                <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-0 left-0 -ml-32 -mt-32 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

                <div className="relative z-10 flex flex-col min-h-screen">
                    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-slate-200/60 transition-all duration-300">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex h-16 items-center justify-between">
                                <Link to="/" className="flex items-center gap-3 group">
                                    <div className="p-2 bg-indigo-600 rounded-xl group-hover:bg-indigo-700 transition-colors shadow-sm">
                                        <Package className="h-5 w-5 text-white" />
                                    </div>
                                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
                                        ProDash
                                    </h1>
                                </Link>
                                <div className="flex items-center gap-4">
                                    <div className="h-8 w-8 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center text-sm font-semibold text-slate-600">
                                        A
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>
                    <main className="flex-1 w-full max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
                        <Routes>
                            <Route path="/" element={<ProductList />} />
                            <Route path="/add" element={<AddProduct />} />
                            <Route path="/edit/:id" element={<EditProduct />} />
                        </Routes>
                    </main>
                </div>
            </div>
            <Toaster position="top-center" toastOptions={{
                className: 'backdrop-blur-md bg-white/90 shadow-glass border border-slate-100 rounded-2xl text-slate-800 font-medium',
                duration: 4000,
            }} />
        </Router>
    );
}

export default App;
