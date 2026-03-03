'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { FeatureNotAvailableModal } from '@/components/ui/feature-not-available-modal'

export default function SettingsPage() {
  const router = useRouter()
  const [open, setOpen] = React.useState(true)

  const handleClose = () => {
    setOpen(false)
    router.push('/')
  }

  return (
    <FeatureNotAvailableModal
      open={open}
      onClose={handleClose}
      featureName="Settings"
    />
  )
}
