// src/components/auth/SignUpForm.tsx

import React, { useRef, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import HCaptcha from '@hcaptcha/react-hcaptcha'
import { useToast } from '@/components/ui/use-toast'
import { format } from 'date-fns'

interface SignUpFormProps {
  onToggleForm: () => void
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onToggleForm }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [birthDateString, setBirthDateString] = useState('')
  const [gender, setGender] = useState('')
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const captchaRef = useRef<any>(null)
  const { toast } = useToast()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!captchaToken) {
      toast({ title: 'Captcha Required', description: 'Please complete the CAPTCHA.', variant: 'destructive' })
      return
    }

    if (!birthDateString || !gender) {
      toast({ title: 'Missing Information', description: 'Please fill in all required fields.', variant: 'destructive' })
      return
    }

    const birthdate = new Date(birthDateString)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        captchaToken,
        data: {
          first_name: firstName,
          last_name: lastName,
          gender,
          birthdate: format(birthdate, 'yyyy-MM-dd'),
        },
        emailRedirectTo: `${window.location.origin}/email-confirmed`
      }
    })

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
      return
    }

    // Manually insert signup data into auth_signups table
    if (data.user) {
      try {
        const { error: insertError } = await supabase
          .from('auth_signups')
          .insert({
            user_id: data.user.id,
            email: email,
            birthdate: format(birthdate, 'yyyy-MM-dd'),
            gender: gender,
            signup_time: new Date().toISOString(),
            ip_address: null, // Could be populated from request headers
            user_agent: navigator.userAgent,
            device_type: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop',
            country: null, // Could be populated from IP geolocation
            referral_source: null // Could be populated from URL parameters
          });

        if (insertError) {
          console.warn("Failed to insert auth_signups data:", insertError);
          // Don't fail the signup process if this fails
        }
      } catch (insertError) {
        console.warn("Error inserting auth_signups data:", insertError);
        // Don't fail the signup process if this fails
      }
    }

    toast({ title: 'Check Your Email', description: 'Confirm your email to finish signing up.' })

    // Reset CAPTCHA after submission
    captchaRef.current?.resetCaptcha()
  }

  return (
    <form onSubmit={handleSignUp} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-biblenow-beige mb-1 block">First Name</label>
          <input type="text" required className="auth-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-biblenow-beige mb-1 block">Last Name</label>
          <input type="text" required className="auth-input" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="text-sm text-biblenow-beige mb-1 block">Email</label>
        <input type="email" required className="auth-input" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>

      <div>
        <label className="text-sm text-biblenow-beige mb-1 block">Password</label>
        <input type="password" required className="auth-input" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>

      <div>
        <label className="text-sm text-biblenow-beige mb-1 block">Birth Date</label>
        <input type="date" required className="auth-input" value={birthDateString} onChange={(e) => setBirthDateString(e.target.value)} />
      </div>

      <div>
        <label className="text-sm text-biblenow-beige mb-1 block">Gender</label>
        <select required className="auth-input" value={gender} onChange={(e) => setGender(e.target.value)}>
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* ✅ hCaptcha widget */}
      <div>
        <HCaptcha
          sitekey="8900e0d8-d718-4e6a-9aea-6c565f5e0ea2"
          onVerify={(token) => setCaptchaToken(token)}
          ref={captchaRef}
        />
      </div>

      <Button type="submit" className="w-full auth-btn-primary">Create Account</Button>

      <p className="text-center text-sm text-biblenow-beige/60 mt-4">
        Already have an account?{' '}
        <button type="button" onClick={onToggleForm} className="auth-link">Sign In</button>
      </p>
    </form>
  )
}

export default SignUpForm
