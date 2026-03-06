'use client';

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleRetry = (): void => {
        this.setState({ hasError: false, error: null });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4">
                    <div className="max-w-md w-full text-center">
                        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>

                        <h1 className="text-xl font-semibold text-[var(--foreground)] mb-2">
                            Algo salió mal
                        </h1>

                        <p className="text-[var(--foreground-muted)] mb-6">
                            Ha ocurrido un error inesperado. Por favor, intenta de nuevo.
                        </p>

                        {this.state.error && (
                            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 mb-6 text-left">
                                <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                                    {this.state.error.message}
                                </p>
                            </div>
                        )}

                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={this.handleRetry}
                                className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-[var(--foreground)] rounded-lg font-medium hover:opacity-90 transition-opacity"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Reintentar
                            </button>

                            <Link
                                href="/"
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-[var(--foreground)] rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                                <Home className="w-4 h-4" />
                                Inicio
                            </Link>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
