'use client';

import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase/auth/use-user';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useFirebaseApp } from '@/firebase';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    width="24px"
    height="24px"
  >
    <path
      fill="#4285F4"
      d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
    />
    <path
      fill="#34A853"
      d="M24 46c5.94 0 10.92-1.96 14.56-5.32l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.38v5.7C7.88 40.5 15.33 46 24 46z"
    />
    <path
      fill="#FBBC05"
      d="M11.69 28.18c-.38-1.13-.6-2.33-.6-3.58s.22-2.45.6-3.58V15.3H4.38C2.69 18.53 1.5 22.14 1.5 26s1.19 7.47 2.88 10.7l7.31-5.72z"
    />
    <path
      fill="#EA4335"
      d="M24 10.73c3.23 0 6.06 1.11 8.31 3.26l6.27-6.27C34.91 3.24 29.93 1 24 1 15.33 1 7.88 6.5 4.38 15.3l7.31 5.72c1.73-5.2 6.58-9.29 12.31-9.29z"
    />
  </svg>
);


export default function LoginPage() {
  const app = useFirebaseApp();
  const router = useRouter();
  const { user, loading } = useUser();

  const handleSignIn = async () => {
    if (!app) return;
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/');
    } catch (error) {
      console.error('Error signing in with Google', error);
    }
  };

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  if (loading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to Advisify AI</CardTitle>
          <CardDescription>Sign in to continue to the community.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSignIn} className="w-full" variant="outline">
            <GoogleIcon className="mr-2" />
            Sign in with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
