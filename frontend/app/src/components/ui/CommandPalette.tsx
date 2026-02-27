import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ArrowRight, Home, Zap, PlayCircle, Briefcase, Bot, BarChart3, Settings, Command } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommandItem {
    id: string;
    label: string;
    category: string;
    icon: React.ElementType;
    path: string;
    keywords?: string[];
}

const commandItems: CommandItem[] = [
    { id: 'dashboard', label: 'Dashboard', category: 'Navigation', icon: Home, path: '/dashboard', keywords: ['home', 'main'] },
    { id: 'skillgap', label: 'Skill Gap Analysis', category: 'Navigation', icon: Zap, path: '/dashboard/skill-gap', keywords: ['skills', 'gap', 'analyze'] },
    { id: 'learning', label: 'My Courses', category: 'Navigation', icon: PlayCircle, path: '/dashboard/learning', keywords: ['course', 'learn', 'video'] },
    { id: 'jobs', label: 'Job Board', category: 'Navigation', icon: Briefcase, path: '/dashboard/jobs', keywords: ['job', 'career', 'apply'] },
    { id: 'aihelper', label: 'AI Assistant', category: 'Navigation', icon: Bot, path: '/dashboard/ai-helper', keywords: ['ai', 'help', 'chat'] },
    { id: 'progress', label: 'Progress & Achievements', category: 'Navigation', icon: BarChart3, path: '/dashboard/progress', keywords: ['progress', 'xp', 'streak'] },
    { id: 'settings', label: 'Settings', category: 'Navigation', icon: Settings, path: '/dashboard/settings', keywords: ['settings', 'profile', 'account'] },
];

interface CommandPaletteProps {
    onNavigate: (path: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ onNavigate }) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const filtered = query.length === 0
        ? commandItems
        : commandItems.filter((item) => {
            const q = query.toLowerCase();
            return (
                item.label.toLowerCase().includes(q) ||
                item.category.toLowerCase().includes(q) ||
                item.keywords?.some((k) => k.includes(q))
            );
        });

    const handleSelect = useCallback((item: CommandItem) => {
        onNavigate(item.path);
        setOpen(false);
        setQuery('');
    }, [onNavigate]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setOpen((prev) => !prev);
            }
            if (e.key === 'Escape') {
                setOpen(false);
                setQuery('');
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 50);
            setActiveIndex(0);
        }
    }, [open]);

    useEffect(() => {
        setActiveIndex(0);
    }, [query]);

    const handleInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((prev) => Math.min(prev + 1, filtered.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((prev) => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && filtered[activeIndex]) {
            handleSelect(filtered[activeIndex]);
        }
    };

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100] flex items-start justify-center pt-[20vh]"
            onClick={() => { setOpen(false); setQuery(''); }}
        >
            <div
                className="w-full max-w-lg bg-white border border-slate-200 rounded-none shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Search Input */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
                    <Search className="w-5 h-5 text-slate-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search pages, courses, actions..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleInputKeyDown}
                        className="flex-1 bg-transparent text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none"
                    />
                    <kbd className="hidden sm:inline-flex px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 rounded border border-slate-200">
                        ESC
                    </kbd>
                </div>

                {/* Results */}
                <div className="max-h-72 overflow-y-auto py-2">
                    {filtered.length === 0 ? (
                        <div className="py-8 text-center text-slate-400 text-sm">
                            No results found for "{query}"
                        </div>
                    ) : (
                        filtered.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleSelect(item)}
                                    onMouseEnter={() => setActiveIndex(index)}
                                    className={cn(
                                        'w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                                        index === activeIndex ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'
                                    )}
                                >
                                    <Icon className={cn('w-4 h-4', index === activeIndex ? 'text-emerald-500' : 'text-slate-400')} />
                                    <span className="flex-1 text-left font-medium">{item.label}</span>
                                    <span className="text-xs text-slate-400">{item.category}</span>
                                    {index === activeIndex && <ArrowRight className="w-3 h-3 text-emerald-500" />}
                                </button>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-4 py-2 border-t border-slate-100 bg-slate-50 text-[10px] text-slate-400">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1"><kbd className="px-1 bg-white border border-slate-200 rounded text-[9px]">↑↓</kbd> navigate</span>
                        <span className="flex items-center gap-1"><kbd className="px-1 bg-white border border-slate-200 rounded text-[9px]">↵</kbd> select</span>
                    </div>
                    <span className="flex items-center gap-1">
                        <Command className="w-3 h-3" />+K to toggle
                    </span>
                </div>
            </div>
        </div>
    );
};
