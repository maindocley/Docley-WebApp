import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardFooter } from '../../components/ui/Card';
import { Mail, Lock, User } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';

// Google Icon Component
const GoogleIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

export default function Signup() {
    const navigate = useNavigate();
    const { signUp, signInWithGoogle } = useAuth();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
    });

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
        setError('');
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await signUp(formData.email, formData.password, formData.fullName);
            setSuccess(true);
        } catch (err) {
            setError(err.message || 'Failed to create account');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        setIsGoogleLoading(true);
        setError('');

        try {
            await signInWithGoogle();
            // Redirect happens automatically via OAuth
        } catch (err) {
            setError(err.message || 'Failed to sign up with Google');
            setIsGoogleLoading(false);
        }
    };

    // Show success message after signup
    if (success) {
        return (
            <div className={cn(
                "min-h-screen flex items-center justify-center p-4 transition-colors duration-300",
                isDark ? "bg-slate-950" : "bg-slate-50"
            )}>
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    {isDark ? (
                        <>
                            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-green-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-orange-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
                        </>
                    ) : (
                        <>
                            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
                        </>
                    )}
                </div>

                <div className="w-full max-w-md relative z-10">
                    <Card className={cn(
                        "shadow-2xl backdrop-blur-sm border transition-all duration-300",
                        isDark
                            ? "bg-slate-900/50 border-white/10 shadow-black/20"
                            : "border-slate-200/60 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.05)]"
                    )}>
                        <CardContent className="pt-8 pb-8 text-center">
                            <div className={cn(
                                "mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4",
                                isDark ? "bg-green-500/20" : "bg-green-100"
                            )}>
                                <Mail className={cn(
                                    "h-8 w-8",
                                    isDark ? "text-green-400" : "text-green-600"
                                )} />
                            </div>
                            <h2 className={cn(
                                "text-2xl font-bold mb-2",
                                isDark ? "text-white" : "text-slate-900"
                            )}>
                                Check Your Email
                            </h2>
                            <p className={cn(
                                "mb-4",
                                isDark ? "text-slate-300" : "text-slate-600"
                            )}>
                                We've sent a verification link to<br />
                                <span className={cn(
                                    "font-semibold",
                                    isDark ? "text-white" : "text-slate-900"
                                )}>
                                    {formData.email}
                                </span>
                            </p>
                            <p className={cn(
                                "text-sm mb-6",
                                isDark ? "text-slate-400" : "text-slate-500"
                            )}>
                                Click the link in the email to verify your account and start transforming your assignments.
                            </p>
                            <Link to="/login">
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full",
                                        isDark && "border-white/10 bg-white/5 text-white hover:bg-white/10"
                                    )}
                                >
                                    Back to Login
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className={cn(
            "min-h-screen flex items-center justify-center p-4 transition-colors duration-300",
            isDark ? "bg-slate-950" : "bg-slate-50"
        )}>
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                {isDark ? (
                    <>
                        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-green-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-orange-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
                    </>
                ) : (
                    <>
                        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
                    </>
                )}
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl overflow-hidden shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
                            <img src="/docley-logo.png" alt="Docley" className="h-full w-full object-contain" />
                        </div>
                    </Link>
                    <h2 className={cn(
                        "text-3xl font-bold",
                        isDark ? "text-white" : "text-slate-900"
                    )}>
                        Create Account
                    </h2>
                    <p className={cn(
                        "mt-2",
                        isDark ? "text-slate-400" : "text-slate-500"
                    )}>
                        Start transforming your grades today.
                    </p>
                </div>

                <Card className={cn(
                    "shadow-2xl backdrop-blur-sm border transition-all duration-300",
                    isDark
                        ? "bg-slate-900/50 border-white/10 shadow-black/20"
                        : "border-slate-200/60 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.05)]"
                )}>
                    <CardContent className="pt-6">
                        {error && (
                            <div className={cn(
                                "mb-4 p-3 border text-sm rounded-lg",
                                isDark
                                    ? "bg-red-500/20 border-red-500/30 text-red-400"
                                    : "bg-red-50 border-red-200 text-red-700"
                            )}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSignup} className="space-y-4">
                            <div className="space-y-2">
                                <label className={cn(
                                    "text-sm font-medium",
                                    isDark ? "text-slate-300" : "text-slate-700"
                                )}>
                                    Full Name
                                </label>
                                <div className="relative">
                                    <User className={cn(
                                        "absolute left-3 top-2.5 h-5 w-5",
                                        isDark ? "text-slate-500" : "text-slate-400"
                                    )} />
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        placeholder="John Doe"
                                        className={cn(
                                            "w-full pl-10 h-10 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all",
                                            isDark
                                                ? "bg-white/5 border-white/10 text-white placeholder-slate-500"
                                                : "border-slate-200 bg-white text-slate-900"
                                        )}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className={cn(
                                    "text-sm font-medium",
                                    isDark ? "text-slate-300" : "text-slate-700"
                                )}>
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className={cn(
                                        "absolute left-3 top-2.5 h-5 w-5",
                                        isDark ? "text-slate-500" : "text-slate-400"
                                    )} />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="student@university.edu"
                                        className={cn(
                                            "w-full pl-10 h-10 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all",
                                            isDark
                                                ? "bg-white/5 border-white/10 text-white placeholder-slate-500"
                                                : "border-slate-200 bg-white text-slate-900"
                                        )}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className={cn(
                                    "text-sm font-medium",
                                    isDark ? "text-slate-300" : "text-slate-700"
                                )}>
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className={cn(
                                        "absolute left-3 top-2.5 h-5 w-5",
                                        isDark ? "text-slate-500" : "text-slate-400"
                                    )} />
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        minLength={6}
                                        className={cn(
                                            "w-full pl-10 h-10 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all",
                                            isDark
                                                ? "bg-white/5 border-white/10 text-white placeholder-slate-500"
                                                : "border-slate-200 bg-white text-slate-900"
                                        )}
                                        required
                                    />
                                </div>
                                <p className={cn(
                                    "text-xs",
                                    isDark ? "text-slate-500" : "text-slate-500"
                                )}>
                                    Minimum 6 characters
                                </p>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/25"
                                disabled={isLoading}
                                isLoading={isLoading}
                            >
                                Create Free Account
                            </Button>
                        </form>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <span className={cn(
                                    "w-full border-t",
                                    isDark ? "border-white/10" : "border-slate-200"
                                )} />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className={cn(
                                    "px-2",
                                    isDark ? "bg-slate-800 text-slate-400" : "bg-white text-slate-500"
                                )}>
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            className={cn(
                                "w-full",
                                isDark && "border-white/10 bg-white/5 text-white hover:bg-white/10"
                            )}
                            type="button"
                            onClick={handleGoogleSignup}
                            disabled={isGoogleLoading}
                            isLoading={isGoogleLoading}
                        >
                            <GoogleIcon className="mr-2 h-4 w-4" /> Google
                        </Button>
                    </CardContent>
                    <CardFooter className={cn(
                        "justify-center border-t py-4",
                        isDark
                            ? "border-white/10 bg-white/5"
                            : "border-slate-100 bg-slate-50/50"
                    )}>
                        <p className={cn(
                            "text-sm",
                            isDark ? "text-slate-400" : "text-slate-500"
                        )}>
                            Already have an account?{' '}
                            <Link to="/login" className={cn(
                                "font-semibold hover:underline",
                                isDark ? "text-orange-400 hover:text-orange-300" : "text-orange-600 hover:text-orange-500"
                            )}>
                                Log in
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
