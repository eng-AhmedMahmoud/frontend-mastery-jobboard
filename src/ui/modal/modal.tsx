/**
 * Accessible Modal Component with Focus Trap & Escape Handling
 *
 * Implements:
 * 1. Portal mounting to avoid CSS stacking context clobbering
 * 2. Focus trapping within modal (Tab / Shift+Tab cycling)
 * 3. Escape key closure
 * 4. Focus restoration to trigger element upon closing
 */

import React, { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isOpen) return

    previousActiveElement.current = document.activeElement as HTMLElement

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }

      if (e.key === 'Tab') {
        const node = modalRef.current
        if (!node) return

        const focusables = node.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (focusables.length === 0) return

        const first = focusables[0]
        const last = focusables[focusables.length - 1]

        if (first && last) {
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault()
            last.focus()
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    // Initial focus on first interactive element or modal itself
    const node = modalRef.current
    if (node) {
      const first = node.querySelector<HTMLElement>('button, [href], input')
      if (first) {
        first.focus()
      } else {
        node.focus()
      }
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previousActiveElement.current?.focus()
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)' }}>
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="modal-container"
        style={{ background: '#fff', padding: '24px', maxWidth: '500px', margin: '100px auto' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>,
    document.body
  )
}
