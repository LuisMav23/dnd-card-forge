import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { internalError } from '@/lib/apiError'

export async function POST() {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      return internalError(error, 'auth/logout')
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return internalError(err, 'auth/logout')
  }
}
