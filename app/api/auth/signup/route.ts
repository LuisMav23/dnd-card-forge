import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_AGE_YEARS = 13;

function isValidIsoDate(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const date = new Date(value);
  return !isNaN(date.getTime());
}

function meetsMinimumAge(birthDate: string): boolean {
  const birth = new Date(birthDate);
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - MIN_AGE_YEARS);
  return birth <= cutoff;
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, fullName, birthDate, gender, country } = body ?? {}

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 })
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
    }

    if (!fullName || typeof fullName !== 'string' || fullName.trim().length === 0) {
      return NextResponse.json({ error: 'Full name is required.' }, { status: 400 })
    }

    if (fullName.trim().length > 100) {
      return NextResponse.json({ error: 'Full name must be 100 characters or fewer.' }, { status: 400 })
    }

    if (birthDate !== undefined && birthDate !== null && birthDate !== '') {
      if (!isValidIsoDate(birthDate)) {
        return NextResponse.json({ error: 'Birth date must be a valid date.' }, { status: 400 })
      }
      if (!meetsMinimumAge(birthDate)) {
        return NextResponse.json({ error: 'You must be at least 13 years old to register.' }, { status: 400 })
      }
    }

    if (country !== undefined && country !== null && typeof country !== 'string') {
      return NextResponse.json({ error: 'Country must be a string.' }, { status: 400 })
    }

    if (typeof country === 'string' && country.length > 100) {
      return NextResponse.json({ error: 'Country must be 100 characters or fewer.' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
    })

    if (error) {
      return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 400 })
    }

    if (data.user) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert([{
          id: data.user.id,
          full_name: fullName.trim(),
          birth_date: birthDate ?? null,
          gender: gender ?? null,
          country: typeof country === 'string' ? country.trim() : null,
        }])

      if (profileError) {
        console.error('[signup] Profile creation failed:', profileError)
      }
    }

    return NextResponse.json({ user: data.user, session: data.session })
  } catch {
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
