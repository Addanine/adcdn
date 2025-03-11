'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '~/components/layout';
import { ProfileForm } from '~/components/profile-form';

export default function ProfilePage() {
  const [user, setUser] = useState<{
    id: number;
    email: string;
    username: string | null;
    is_admin: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch('/api/user/me');
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('Failed to fetch user data');
        }
        
        const data = await response.json();
        setUser(data.user);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    fetchUser();
  }, [router]);

  async function handleUpdateProfile(username: string) {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update profile');
      }

      const data = await response.json();
      setUser(data.user);
    } catch (err) {
      throw err;
    }
  }

  return (
    <Layout user={user}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Your Profile
            </h2>
          </div>
        </div>

        {isLoading ? (
          <div className="mt-8 text-center">Loading...</div>
        ) : error ? (
          <div className="mt-8 text-red-500">{error}</div>
        ) : (
          <div className="mt-8">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Account Information
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Update your profile details.
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Account type</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {user?.is_admin ? 'Admin (Unlimited storage)' : 'Standard (100MB storage)'}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Update Username</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <ProfileForm
                        currentUsername={user?.username}
                        onSubmit={handleUpdateProfile}
                      />
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}