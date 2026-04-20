import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { messagesApi } from '../api/endpoints.js';

const schema = z.object({
  name: z.string().min(2, 'Please enter your name'),
  email: z.string().email('Enter a valid email'),
  subject: z.string().max(200).optional().or(z.literal('')),
  body: z.string().min(5, 'Message is too short'),
});

export function ContactPage() {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setServerError(null);
    try {
      await messagesApi.send({ ...data, subject: data.subject || '' });
      setSent(true);
      reset();
    } catch (err) {
      setServerError(err?.response?.data?.message || 'Failed to send message');
    }
  };

  return (
    <div className="section max-w-2xl">
      <h1 className="text-4xl font-bold text-white">Contact</h1>
      <p className="mt-2 text-slate-400">
        Have a project or a role in mind? Send me a message.
      </p>

      {sent ? (
        <div className="card mt-8 border-emerald-500/40 bg-emerald-500/10 text-emerald-200">
          Thanks for reaching out — I'll get back to you soon.
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="card mt-8 space-y-4">
          <div>
            <label className="label" htmlFor="name">
              Name
            </label>
            <input id="name" className="input" {...register('name')} />
            {errors.name && (
              <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input id="email" type="email" className="input" {...register('email')} />
            {errors.email && (
              <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="label" htmlFor="subject">
              Subject
            </label>
            <input id="subject" className="input" {...register('subject')} />
          </div>
          <div>
            <label className="label" htmlFor="body">
              Message
            </label>
            <textarea
              id="body"
              rows={6}
              className="input resize-y"
              {...register('body')}
            />
            {errors.body && (
              <p className="mt-1 text-xs text-red-400">{errors.body.message}</p>
            )}
          </div>

          {serverError && (
            <p className="text-sm text-red-400">{serverError}</p>
          )}

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? 'Sending…' : 'Send message'}
          </button>
        </form>
      )}
    </div>
  );
}
