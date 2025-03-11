import Link from "next/link";
import { getUserFromCookies } from "~/lib/auth";

export default async function HomePage() {
  const user = await getUserFromCookies();
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-600 to-blue-800 text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem] text-center">
          ADCDN
        </h1>
        <p className="text-2xl text-center max-w-2xl">
          A simple and secure platform for content delivery and file sharing
        </p>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 max-w-4xl">
          {user ? (
            <Link
              className="flex flex-col gap-4 rounded-xl bg-white/10 p-6 text-white hover:bg-white/20 transition"
              href="/dashboard"
            >
              <h3 className="text-2xl font-bold">Go to Dashboard →</h3>
              <div className="text-lg">
                Access your files, upload new content, and manage your account.
              </div>
            </Link>
          ) : (
            <>
              <Link
                className="flex flex-col gap-4 rounded-xl bg-white/10 p-6 text-white hover:bg-white/20 transition"
                href="/login"
              >
                <h3 className="text-2xl font-bold">Sign In →</h3>
                <div className="text-lg">
                  Already have an account? Sign in to access your dashboard and manage your files.
                </div>
              </Link>
              
              <Link
                className="flex flex-col gap-4 rounded-xl bg-white/10 p-6 text-white hover:bg-white/20 transition"
                href="/register"
              >
                <h3 className="text-2xl font-bold">Create Account →</h3>
                <div className="text-lg">
                  New to ADCDN? Sign up to start uploading and sharing your files securely.
                </div>
              </Link>
            </>
          )}
          
          <Link
            className="flex flex-col gap-4 rounded-xl bg-white/10 p-6 text-white hover:bg-white/20 transition"
            href="#features"
          >
            <h3 className="text-2xl font-bold">Features →</h3>
            <div className="text-lg">
              Learn about our platform's capabilities, including file sharing, storage management, and more.
            </div>
          </Link>
        </div>
        
        <section id="features" className="py-16 max-w-4xl">
          <h2 className="text-3xl font-bold mb-8 text-center">Platform Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/10 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-3">Secure File Hosting</h3>
              <p>Upload and store your files securely with our platform. Each file gets a unique, shareable link.</p>
            </div>
            
            <div className="bg-white/10 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-3">100MB Free Storage</h3>
              <p>Every user gets 100MB of free storage space, with unlimited storage available for admin users.</p>
            </div>
            
            <div className="bg-white/10 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-3">Permanent Links</h3>
              <p>Your file links never expire - they remain active until you choose to delete the file.</p>
            </div>
            
            <div className="bg-white/10 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-3">Custom Profiles</h3>
              <p>Set your username to personalize your presence when others view your shared files.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
