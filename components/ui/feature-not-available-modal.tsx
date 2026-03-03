'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Construction } from 'lucide-react'

interface FeatureNotAvailableModalProps {
  open: boolean
  onClose: () => void
  featureName?: string
}

export function FeatureNotAvailableModal({
  open,
  onClose,
  featureName = 'This feature',
}: FeatureNotAvailableModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Construction className="h-8 w-8 text-muted-foreground" />
          </div>
          <DialogTitle className="text-xl">Feature Coming Soon</DialogTitle>
          <DialogDescription className="text-center">
            {featureName} is currently under development and will be available
            in a future release. We appreciate your patience as we work to bring
            you this functionality.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={onClose}>
            Go Back
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
