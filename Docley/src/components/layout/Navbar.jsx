import { Link, useLocation } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';
import { DocleyLogo } from '../ui/DocleyLogo';

export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const navLinks = [
        { name: 'Features', href: '/#features' },
        { name: 'Pricing', href: '/pricing' },
        { name: 'Blog', href: '/blog' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <nav className={cn(
            "sticky top-0 z-50 w-full border-b backdrop-blur-xl transition-colors duration-300",
            isDark
                ? "border-white/10 bg-slate-950/80"
                : "border-blue-100/50 bg-white/80 shadow-sm"
        )}>
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link to="/">
                        <DocleyLogo size="default" />
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-6">
                        <div className="flex items-center gap-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.href}
                                    className={cn(
                                        "px-4 py-2 text-sm font-medium rounded-full transition-all duration-300",
                                        isActive(link.href)
                                            ? isDark
                                                ? "bg-white/10 text-white border border-white/20"
                                                : "bg-blue-50 text-blue-700 border border-blue-200"
                                            : isDark
                                                ? "text-slate-400 hover:text-white hover:bg-white/5"
                                                : "text-slate-600 hover:text-blue-600 hover:bg-blue-50/50"
                                    )}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                        <div className={cn(
                            "flex items-center gap-3 pl-2 border-l",
                            isDark ? "border-white/10" : "border-blue-100"
                        )}>
                            <ThemeToggle />
                            <Link to="/login">
                                <Button variant="ghost" size="sm" className={isDark ? "text-slate-300 hover:text-white hover:bg-white/5" : "text-slate-600 hover:text-slate-900"}>Log in</Button>
                            </Link>
                            <Link to="/signup">
                                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white border-0 shadow-sm">Get Started</Button>
                            </Link>
                        </div>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="md:hidden flex items-center gap-2">
                        <ThemeToggle />
                        <button
                            className={cn(
                                "p-2 transition-colors",
                                isDark ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-900"
                            )}
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className={cn(
                    "md:hidden border-t backdrop-blur-xl px-4 py-6 shadow-2xl animate-in slide-in-from-top-2",
                    isDark
                        ? "border-white/10 bg-slate-950/95"
                        : "border-blue-100 bg-white/95"
                )}>
                    <div className="flex flex-col space-y-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.href}
                                className={cn(
                                    "text-base font-medium transition-colors",
                                    isDark ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-blue-600"
                                )}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <hr className={isDark ? "border-white/10" : "border-blue-100"} />
                        <div className="flex flex-col gap-3">
                            <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                                <Button variant="outline" className={cn(
                                    "w-full justify-center",
                                    isDark
                                        ? "bg-white/5 border-white/20 text-white hover:bg-white/10"
                                        : "bg-white border-blue-200 text-slate-700 hover:bg-blue-50"
                                )}>Log in</Button>
                            </Link>
                            <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                                <Button className="w-full justify-center bg-indigo-600 hover:bg-indigo-700 text-white border-0 shadow-sm">Get Started</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
