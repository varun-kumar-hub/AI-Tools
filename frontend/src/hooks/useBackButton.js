import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Root paths — pressing back here means "exit the app"
const ROOT_PATHS = ['/', '/home'];

/**
 * useBackButton
 * Handles Android hardware back button via Capacitor.
 * - On root pages: calls onExitRequest (show exit dialog)
 * - On other pages: navigates back in history
 */
export const useBackButton = (onExitRequest) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleBack = useCallback(() => {
        const isRoot = ROOT_PATHS.includes(location.pathname) || location.pathname === '/';

        if (isRoot) {
            // Ask user to confirm exit
            onExitRequest?.();
        } else {
            // Navigate back in history
            navigate(-1);
        }
    }, [location.pathname, navigate, onExitRequest]);

    useEffect(() => {
        let unlisten = null;

        const setupCapacitorBackButton = async () => {
            try {
                // Dynamically import Capacitor — safe on web too (no-op on non-native)
                const { App: CapApp } = await import('@capacitor/app');
                const listener = await CapApp.addListener('backButton', ({ canGoBack }) => {
                    handleBack();
                });
                unlisten = () => listener.remove();
            } catch {
                // Not running in Capacitor — set up browser popstate fallback
                const handlePopState = () => handleBack();
                window.addEventListener('popstate', handlePopState);
                unlisten = () => window.removeEventListener('popstate', handlePopState);
            }
        };

        setupCapacitorBackButton();
        return () => unlisten?.();
    }, [handleBack]);
};
