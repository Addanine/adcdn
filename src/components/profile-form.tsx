import { FormEvent, useState } from 'react';

interface ProfileFormProps {
  currentUsername?: string | null;
  onSubmit: (username: string) => Promise<void>;
}

export function ProfileForm({ currentUsername, onSubmit }: ProfileFormProps) {
  const [username, setUsername] = useState(currentUsername || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (isLoading) return;

    // Validate inputs
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await onSubmit(username);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
          Username
        </label>
        <p className="text-xs text-gray-500 mb-1">
          This will be displayed when others view your shared files.
        </p>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}
      {success && (
        <div className="text-green-500 text-sm">Username updated successfully!</div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
      >
        {isLoading ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
}