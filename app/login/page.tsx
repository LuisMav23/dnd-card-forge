import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import LoginForm from './LoginForm';

/**
 * If already signed in, skip the form: incomplete onboarding → wizard, else app home.
 * (Same rule as app/(main)/layout.tsx for any main app route.)
 */
export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: prof } = await supabase
      .from('user_profiles')
      .select('onboarding_completed_at')
      .eq('id', user.id)
      .maybeSingle();

    if (!prof?.onboarding_completed_at) {
      redirect('/onboarding');
    }
    redirect('/home');
  }

  return <LoginForm />;
}
