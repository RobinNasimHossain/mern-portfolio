import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext.jsx';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Enter your password'),
});

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setServerError(null);
    try {
      const user = await login(data.email, data.password);
      const to = location.state?.from?.pathname ||
        (user.role === 'admin' ? '/admin' : '/');
      navigate(to, { replace: true });
    } catch (err) {
      setServerError(err?.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="section max-w-md">
      <h1 className="text-3xl font-bold text-white">Log in</h1>
      <p className="mt-2 text-sm text-slate-400">
        Sign in to access your account.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="card mt-8 space-y-4">
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" className="input" autoComplete="email" {...register('email')} />
          {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="input"
            autoComplete="current-password"
            {...register('password')}
          />
          {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
        </div>
        {serverError && <p className="text-sm text-red-400">{serverError}</p>}
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
        <p className="text-center text-sm text-slate-400">
          Need an account?{' '}
          <Link to="/register" className="font-semibold">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
