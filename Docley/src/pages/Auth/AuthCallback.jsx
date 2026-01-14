import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Sparkles, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';

export default function AuthCallback() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
    const [message, setMessage] = useState('');

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Supabase JS SDK handles the hash/query params automatically 
                // when detectSessionInUrl is true (which it is in our lib/supabase.js)
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) throw error;

                if (session) {
                    // Sync user profile with backend to ensure usage records etc. exist
                    try {
                        const { syncUserProfile } = await import('../../services/usersService');
                        await syncUserProfile();
                    } catch (e) {
                        console.error('[AuthCallback] Profile sync failed:', e);
                        // We don't block the user if sync fails, but we log it
                    }

                    setStatus('success');
                    setMessage('Successfully authenticated!');

                    // Small delay for UX then redirect
                    setTimeout(() => {
                        navigate('/dashboard');
                    }, 1000);
                } else {
                    // If no session is found immediately, it might be an error in the URL
                    const hashParams = new URLSearchParams(window.location.hash.substring(1));
                    const errorDescription = hashParams.get('error_description');
                    if (errorDescription) {
                        throw new Error(errorDescription);
                    }
                    throw new Error('No active session found. Please try logging in again.');
                }
            } catch (err) {
                console.error('Auth callback error:', err);
                setStatus('error');
                setMessage(err.message || 'Authentication failed. Please try again.');
            }
        };

        handleCallback();
    }, [navigate]);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                            <Sparkles className="h-5 w-5 text-white" />
                        </div>
                    </Link>
                </div>

                <Card className="border-slate-200 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm">
                    <CardContent className="pt-8 pb-8 text-center">
                        {status === 'loading' && (
                            <>
                                <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                                    <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 mb-2">Verifying...</h2>
                                <p className="text-slate-600">Please wait while we verify your request.</p>
                            </>
                        )}

                        {status === 'success' && (
                            <>
                                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle className="h-8 w-8 text-green-600" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 mb-2">{message}</h2>
                                <p className="text-slate-600">Redirecting you to the dashboard...</p>
                            </>
                        )}

                        {status === 'error' && (
                            <>
                                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                    <XCircle className="h-8 w-8 text-red-600" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 mb-2">Verification Failed</h2>
                                <p className="text-slate-600 mb-6">{message}</p>
                                <div className="space-y-3">
                                    <Link to="/login" className="block">
                                        <Button className="w-full bg-slate-900 hover:bg-slate-800">
                                            Go to Login
                                        </Button>
                                    </Link>
                                    <Link to="/signup" className="block">
                                        <Button variant="outline" className="w-full">
                                            Create Account
                                        </Button>
                                    </Link>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
