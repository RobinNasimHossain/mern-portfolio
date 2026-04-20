import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext.jsx';

const schema = z.object({
  name: z.string().min(2, 'Enter your name'),
  email: z.string().email(),
  password: z.string().min(8, 'Use at least 8 characters'),
});

export function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setServerError(null);
    try {
      const user = await registerUser(data.name, data.email, data.password);
      navigate(user.role === 'admin' ? '/admin' : '/', { replace: true });
    } catch (err) {
      setServerError(err?.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="section max-w-md">
      <h1 className="text-3xl font-bold text-white">Create an account</h1>
      <p className="mt-2 text-sm text-slate-400">
        Sign up to leave messages and track updates.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="card mt-8 space-y-4">
        <div>
          <label className="label" htmlFor="name">Name</label>
          <input id="name" className="input" autoComplete="name" {...register('name')} />
          {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
        </div>
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
            autoComplete="new-password"
            {...register('password')}
          />
          {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
        </div>
        {serverError && <p className="text-sm text-red-400">{serverError}</p>}
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>
        <p className="text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
