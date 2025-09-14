import React from 'react'
import { Check, X } from 'lucide-react'

interface PasswordValidationProps {
  password: string
  className?: string
}

export interface PasswordCriteria {
  length: boolean
  uppercase: boolean
  lowercase: boolean
  special: boolean
}

export const validatePassword = (password: string): PasswordCriteria => {
  return {
    length: password.length >= 8 && password.length <= 32,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    special: /[!@#$%]/.test(password)
  }
}

export const isPasswordValid = (criteria: PasswordCriteria): boolean => {
  return criteria.length && criteria.uppercase && criteria.lowercase && criteria.special
}

export default function PasswordValidation({ password, className = '' }: PasswordValidationProps) {
  const criteria = validatePassword(password)

  const CriteriaItem = ({ met, text }: { met: boolean; text: string }) => (
    <div className={`flex items-center gap-2 text-sm ${met ? 'text-success' : 'text-muted-foreground'}`}>
      {met ? (
        <Check className="h-4 w-4 text-success" />
      ) : (
        <X className="h-4 w-4 text-muted-foreground" />
      )}
      <span>{text}</span>
    </div>
  )

  return (
    <div className={`space-y-2 ${className}`}>
      <p className="text-sm font-medium text-muted-foreground">Password Requirements:</p>
      <div className="space-y-1">
        <CriteriaItem met={criteria.length} text="8 to 32 characters" />
        <CriteriaItem met={criteria.uppercase} text="At least one uppercase letter (A-Z)" />
        <CriteriaItem met={criteria.lowercase} text="At least one lowercase letter (a-z)" />
        <CriteriaItem met={criteria.special} text="At least one special character (!@#$%)" />
      </div>
    </div>
  )
}