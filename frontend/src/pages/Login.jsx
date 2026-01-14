import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import Logo from '../components/Logo';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, loginWithPassword, sendPasswordReset } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await loginWithPassword(email, password);
            toast.success('Logged in successfully!');
            navigate('/admin');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            toast.error("Please enter your email to reset password.");
            return;
        }
        setLoading(true);
        try {
            await sendPasswordReset(email);
            toast.success('Password reset link sent to your email!');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
            <div className="w-full max-w-md p-8 space-y-8 glass-card rounded-2xl border border-white/10 animate-fade-in-up">
                <div className="text-center">
                    <div className="flex justify-center mb-6">
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5 shadow-lg shadow-purple-500/10">
                            <Logo className="w-10 h-10" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Admin Login</h1>
                    <p className="text-sm text-gray-400 mt-2">
                        Enter your credentials to access the dashboard
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full h-12 bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-purple-500/50 focus:ring-purple-500/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <Input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full h-12 bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-purple-500/50 focus:ring-purple-500/20"
                            />
                            <div className="flex justify-end pt-1">
                                <button
                                    type="button"
                                    onClick={handleForgotPassword}
                                    className="text-xs text-purple-400 hover:text-purple-300 hover:underline transition-colors"
                                    disabled={loading}
                                >
                                    Forgot Password?
                                </button>
                            </div>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 text-base font-medium bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-900/20"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Sign In'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default Login;
