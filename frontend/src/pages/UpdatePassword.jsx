import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';

const UpdatePassword = () => {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Ensure user is authenticated (via the reset link token)
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                toast.error("Invalid or expired link. Please try again.");
                navigate('/login');
            }
        });
    }, [navigate]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;

            toast.success("Password updated successfully!");
            navigate('/admin');
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
                    <h1 className="text-3xl font-bold tracking-tight text-white">Set New Password</h1>
                    <p className="text-sm text-gray-400 mt-2">
                        Enter your new password below
                    </p>
                </div>

                <form onSubmit={handleUpdate} className="space-y-6">
                    <div className="space-y-2">
                        <Input
                            type="password"
                            placeholder="New Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="w-full h-12 bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-purple-500/50 focus:ring-purple-500/20"
                        />
                    </div>
                    <Button
                        type="submit"
                        className="w-full h-12 text-base font-medium bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-900/20"
                        disabled={loading}
                    >
                        {loading ? 'Updating...' : 'Update Password'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default UpdatePassword;
