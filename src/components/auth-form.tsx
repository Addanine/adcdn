import { FormEvent, useState } from 'react';

type AuthMode = 'login' | 'register';

interface AuthFormProps {
  mode: AuthMode;
  onSubmit: (email: string, password: string) => Promise<void>;
  error?: string;
}

export function AuthForm({ mode, onSubmit, error }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (isLoading) return;

    // Validate inputs
    if (!email || !password) {
      setLocalError('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    setLocalError('');

    try {
      await onSubmit(email, password);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {(error || localError) && (
        <div className="text-red-500 text-sm">{error || localError}</div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
      >
        {isLoading
          ? 'Loading...'
          : mode === 'login'
          ? 'Sign In'
          : 'Create Account'}
      </button>
    </form>
  );
}