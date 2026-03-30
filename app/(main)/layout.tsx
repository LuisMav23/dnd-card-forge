import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import { createClient } from '@/lib/supabase/server';

/**
 * Single persistent header for all authenticated app routes; only page content swaps on navigation.
 * Logged-in users without onboarding_completed_at are sent to the wizard first.
 */
export default async function MainAppLayout({ children }: { children: React.ReactNode }) {
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
  }

  return (
    <div className="flex min-h-screen min-h-[100dvh] flex-col overflow-x-hidden bg-bg">
      <Header />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
