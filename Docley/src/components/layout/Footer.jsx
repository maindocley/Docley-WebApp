import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { DocleyLogo } from '../ui/DocleyLogo';
import { cn } from '../../lib/utils';

export function Footer() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <footer className={cn(
            "w-full border-t transition-colors duration-300",
            isDark 
                ? "border-white/10 bg-slate-950" 
                : "border-blue-100 bg-gradient-to-b from-white to-blue-50/30"
        )}>
            <div className="container mx-auto px-4 py-12 md:px-6">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                    {/* Brand */}
                    <div className="space-y-4">
                        <DocleyLogo size="default" />
                        <p className={cn(
                            "text-sm max-w-xs",
                            isDark ? "text-slate-400" : "text-slate-600"
                        )}>
                            Transform rough academic work into professional, submission-ready assignments with AI.
                        </p>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h3 className={cn(
                            "mb-4 text-sm font-semibold",
                            isDark ? "text-white" : "text-slate-900"
                        )}>Product</h3>
                        <ul className={cn(
                            "space-y-3 text-sm",
                            isDark ? "text-slate-400" : "text-slate-600"
                        )}>
                            <li><Link to="/#features" className={cn(
                                "transition-colors",
                                isDark ? "hover:text-white" : "hover:text-blue-600"
                            )}>Features</Link></li>
                            <li><Link to="/pricing" className={cn(
                                "transition-colors",
                                isDark ? "hover:text-white" : "hover:text-blue-600"
                            )}>Pricing</Link></li>
                            <li><Link to="/blog" className={cn(
                                "transition-colors",
                                isDark ? "hover:text-white" : "hover:text-blue-600"
                            )}>Blog</Link></li>
                            <li><Link to="/dashboard" className={cn(
                                "transition-colors",
                                isDark ? "hover:text-white" : "hover:text-blue-600"
                            )}>Dashboard</Link></li>
                        </ul>
                    </div>

                    {/* Resources Links */}
                    <div>
                        <h3 className={cn(
                            "mb-4 text-sm font-semibold",
                            isDark ? "text-white" : "text-slate-900"
                        )}>Resources</h3>
                        <ul className={cn(
                            "space-y-3 text-sm",
                            isDark ? "text-slate-400" : "text-slate-600"
                        )}>
                            <li><a href="#" className={cn(
                                "transition-colors",
                                isDark ? "hover:text-white" : "hover:text-blue-600"
                            )}>Documentation</a></li>
                            <li><a href="#" className={cn(
                                "transition-colors",
                                isDark ? "hover:text-white" : "hover:text-blue-600"
                            )}>Guides</a></li>
                            <li><a href="#" className={cn(
                                "transition-colors",
                                isDark ? "hover:text-white" : "hover:text-blue-600"
                            )}>Help Center</a></li>
                            <li><a href="#" className={cn(
                                "transition-colors",
                                isDark ? "hover:text-white" : "hover:text-blue-600"
                            )}>Academic Integrity</a></li>
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h3 className={cn(
                            "mb-4 text-sm font-semibold",
                            isDark ? "text-white" : "text-slate-900"
                        )}>Legal</h3>
                        <ul className={cn(
                            "space-y-3 text-sm",
                            isDark ? "text-slate-400" : "text-slate-600"
                        )}>
                            <li><a href="#" className={cn(
                                "transition-colors",
                                isDark ? "hover:text-white" : "hover:text-blue-600"
                            )}>Privacy Policy</a></li>
                            <li><a href="#" className={cn(
                                "transition-colors",
                                isDark ? "hover:text-white" : "hover:text-blue-600"
                            )}>Terms of Service</a></li>
                            <li><a href="#" className={cn(
                                "transition-colors",
                                isDark ? "hover:text-white" : "hover:text-blue-600"
                            )}>Cookie Policy</a></li>
                        </ul>
                    </div>
                </div>

                <div className={cn(
                    "mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 md:flex-row",
                    isDark ? "border-white/10" : "border-blue-100"
                )}>
                    <p className={cn(
                        "text-sm",
                        isDark ? "text-slate-400" : "text-slate-500"
                    )}>
                        © {new Date().getFullYear()} Docley Inc. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4">
                        <a href="#" className={cn(
                            "transition-colors",
                            isDark ? "text-slate-400 hover:text-white" : "text-slate-400 hover:text-blue-600"
                        )}>
                            <Twitter className="h-5 w-5" />
                        </a>
                        <a href="#" className={cn(
                            "transition-colors",
                            isDark ? "text-slate-400 hover:text-white" : "text-slate-400 hover:text-blue-600"
                        )}>
                            <Github className="h-5 w-5" />
                        </a>
                        <a href="#" className={cn(
                            "transition-colors",
                            isDark ? "text-slate-400 hover:text-white" : "text-slate-400 hover:text-blue-600"
                        )}>
                            <Linkedin className="h-5 w-5" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
