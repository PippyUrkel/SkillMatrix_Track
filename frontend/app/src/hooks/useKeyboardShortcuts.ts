import { useEffect } from 'react';
import { useDashboardStore } from '@/stores';

/**
 * Global keyboard shortcuts for power users:
 * - Ctrl+B → Toggle sidebar collapse
 * - Ctrl+/ → Toggle AI assistant
 * - Escape → Close AI panel
 */
export function useKeyboardShortcuts() {
    const { toggleSidebar, toggleChat, isChatOpen, setChatOpen } = useDashboardStore();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore shortcuts when typing in inputs/textareas
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
                if (e.key === 'Escape') {
                    // Allow Escape even in inputs to close panels
                    if (isChatOpen) {
                        setChatOpen(false);
                    }
                }
                return;
            }

            // Ctrl+B → Toggle sidebar
            if (e.ctrlKey && e.key === 'b') {
                e.preventDefault();
                toggleSidebar();
            }

            // Ctrl+/ → Toggle AI assistant
            if (e.ctrlKey && e.key === '/') {
                e.preventDefault();
                toggleChat();
            }

            // Escape → Close AI panel
            if (e.key === 'Escape') {
                if (isChatOpen) {
                    setChatOpen(false);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [toggleSidebar, toggleChat, isChatOpen, setChatOpen]);
}
