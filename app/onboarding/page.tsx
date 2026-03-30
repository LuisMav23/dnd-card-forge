import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import OnboardingDeck from '@/components/onboarding/OnboardingDeck';

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: prof } = await supabase
    .from('user_profiles')
    .select('onboarding_completed_at')
    .eq('id', user.id)
    .maybeSingle();

  if (prof?.onboarding_completed_at) {
    redirect('/home');
  }

  return <OnboardingDeck />;
}
