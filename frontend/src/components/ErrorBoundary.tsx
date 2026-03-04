import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('ErrorBoundary caught:', error, info.componentStack);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
                    {/* Background orbs */}
                    <div className="orb orb-1" />
                    <div className="orb orb-2" />

                    <div className="glass-card rounded-3xl p-10 max-w-lg w-full text-center animate-scale-in shadow-glass">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-rose-500/10 border border-rose-500/20 mb-6 mx-auto">
                            <AlertTriangle className="w-10 h-10 text-rose-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
                        <p className="text-gray-400 text-sm mb-4 font-medium">
                            An unexpected error occurred in the application. You can try refreshing or go back to the home page.
                        </p>
                        {this.state.error && (
                            <pre className="text-xs text-left text-rose-300 bg-rose-900/20 border border-rose-800/30 rounded-xl p-4 mb-6 overflow-x-auto font-mono">
                                {this.state.error.message}
                            </pre>
                        )}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={this.handleReset}
                                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/10 transition-all duration-200"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Try Again
                            </button>
                            <a
                                href="/"
                                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all duration-200 shadow-btn"
                            >
                                <Home className="w-4 h-4" />
                                Back to Home
                            </a>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
