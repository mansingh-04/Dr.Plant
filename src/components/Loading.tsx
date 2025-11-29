import React from 'react';
import { Leaf } from 'lucide-react';

interface LoadingProps {
    message?: string;
    fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
    message = "Nurturing your plants...",
    fullScreen = true
}) => {
    const containerClasses = fullScreen
        ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm"
        : "flex flex-col items-center justify-center p-8";

    return (
        <div className={containerClasses}>
            <div className="relative">
                {/* Pulse Ring Effect */}
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-ring" />

                {/* Floating Leaf Icon */}
                <div className="relative z-10 p-4 bg-background rounded-full shadow-lg border border-primary/20 animate-float">
                    <Leaf className="w-12 h-12 text-primary animate-grow-up" />
                </div>
            </div>

            {/* Loading Message */}
            <div className="mt-8 text-center space-y-2">
                <h3 className="text-xl font-semibold text-primary animate-pulse">
                    {message}
                </h3>
                <div className="flex gap-1 justify-center">
                    <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" />
                </div>
            </div>
        </div>
    );
};
