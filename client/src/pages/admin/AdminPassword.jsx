import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '../../api/endpoints.js';
import { setTokens } from '../../api/client.js';

const schema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8, 'Use at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export function AdminPassword() {
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    setError(null);
    setMessage(null);
    try {
      const res = await authApi.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      if (res.accessToken) {
        setTokens({
          accessToken: res.accessToken,
          refreshToken: res.refreshToken,
        });
      }
      setMessage('Password updated');
      reset();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update password');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card max-w-lg space-y-4">
      <h2 className="text-xl font-semibold text-white">Change password</h2>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {message && <p className="text-sm text-emerald-400">{message}</p>}

      <div>
        <label className="label">Current password</label>
        <input type="password" className="input" {...register('currentPassword')} />
        {errors.currentPassword && (
          <p className="mt-1 text-xs text-red-400">{errors.currentPassword.message}</p>
        )}
      </div>
      <div>
        <label className="label">New password</label>
        <input type="password" className="input" {...register('newPassword')} />
        {errors.newPassword && (
          <p className="mt-1 text-xs text-red-400">{errors.newPassword.message}</p>
        )}
      </div>
      <div>
        <label className="label">Confirm new password</label>
        <input type="password" className="input" {...register('confirmPassword')} />
        {errors.confirmPassword && (
          <p className="mt-1 text-xs text-red-400">{errors.confirmPassword.message}</p>
        )}
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-primary">
        {isSubmitting ? 'Updating…' : 'Update password'}
      </button>
    </form>
  );
}
