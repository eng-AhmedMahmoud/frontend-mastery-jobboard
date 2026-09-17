/**
 * @vitest-environment jsdom
 */
import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Modal } from './modal'

describe('Modal Overlay & Focus Trap', () => {
  it('renders into portal when open and traps focus', () => {
    const handleClose = vi.fn()
    render(
      <div>
        <button type="button" data-testid="external-trigger">
          Open
        </button>
        <Modal isOpen={true} onClose={handleClose} title="Apply to Job">
          <input data-testid="name-input" placeholder="Your name" />
          <button type="button" data-testid="submit-btn">
            Submit
          </button>
        </Modal>
      </div>
    )

    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(dialog).toHaveAttribute('aria-modal', 'true')

    // Close on Escape
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('cycles focus within modal on Tab keydown', () => {
    const handleClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Focus Trap">
        <button type="button" data-testid="btn-1">
          First
        </button>
        <button type="button" data-testid="btn-2">
          Second
        </button>
      </Modal>
    )

    const closeBtn = screen.getByLabelText('Close modal')
    const btn1 = screen.getByTestId('btn-1')
    const btn2 = screen.getByTestId('btn-2')

    // Focus starts on first interactive element (closeBtn)
    expect(document.activeElement).toBe(closeBtn)

    // Focus last button, then press Tab -> should wrap to first
    btn2.focus()
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: false })
    expect(document.activeElement).toBe(closeBtn)

    // Focus first button, then press Shift+Tab -> should wrap to last
    closeBtn.focus()
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(btn2)
  })
})
