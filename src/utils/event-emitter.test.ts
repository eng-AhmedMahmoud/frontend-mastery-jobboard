import { describe, expect, it, vi } from 'vitest'
import { EventEmitter } from './event-emitter'

type ToastEvents = {
  show: { message: string }
  dismiss: { id: string }
}

describe('EventEmitter', () => {
  it('calls a listener when its event is emitted', () => {
    const emitter = new EventEmitter<ToastEvents>()
    const spy = vi.fn()

    emitter.on('show', spy)
    emitter.emit('show', { message: 'Application sent' })

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith({ message: 'Application sent' })
  })

  it('does not call listeners of other events', () => {
    const emitter = new EventEmitter<ToastEvents>()
    const spy = vi.fn()

    emitter.on('dismiss', spy)
    emitter.emit('show', { message: 'Application sent' })

    expect(spy).not.toHaveBeenCalled()
  })

  it('calls every listener registered for an event', () => {
    const emitter = new EventEmitter<ToastEvents>()
    const first = vi.fn()
    const second = vi.fn()

    emitter.on('show', first)
    emitter.on('show', second)
    emitter.emit('show', { message: 'Saved' })

    expect(first).toHaveBeenCalledTimes(1)
    expect(second).toHaveBeenCalledTimes(1)
  })

  it('returns an unsubscribe function from on()', () => {
    const emitter = new EventEmitter<ToastEvents>()
    const spy = vi.fn()

    const unsubscribe = emitter.on('show', spy)
    unsubscribe()
    emitter.emit('show', { message: 'Saved' })

    expect(spy).not.toHaveBeenCalled()
  })

  it('off() removes a listener', () => {
    const emitter = new EventEmitter<ToastEvents>()
    const spy = vi.fn()

    emitter.on('show', spy)
    emitter.off('show', spy)
    emitter.emit('show', { message: 'Saved' })

    expect(spy).not.toHaveBeenCalled()
  })

  it('once() fires exactly one time', () => {
    const emitter = new EventEmitter<ToastEvents>()
    const spy = vi.fn()

    emitter.once('show', spy)
    emitter.emit('show', { message: 'first' })
    emitter.emit('show', { message: 'second' })

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith({ message: 'first' })
  })

  it('tracks how many listeners an event has', () => {
    const emitter = new EventEmitter<ToastEvents>()
    const spy = vi.fn()

    expect(emitter.listenerCount('show')).toBe(0)
    const unsubscribe = emitter.on('show', spy)
    expect(emitter.listenerCount('show')).toBe(1)
    unsubscribe()
    expect(emitter.listenerCount('show')).toBe(0)
  })

  it('lets a listener unsubscribe during emit without skipping the others', () => {
    const emitter = new EventEmitter<ToastEvents>()
    const order: string[] = []

    const unsubscribeFirst = emitter.on('show', () => {
      order.push('first')
      unsubscribeFirst()
    })
    emitter.on('show', () => order.push('second'))

    emitter.emit('show', { message: 'Saved' })

    expect(order).toEqual(['first', 'second'])
    expect(emitter.listenerCount('show')).toBe(1)
  })

  it('emitting an event nobody listens to is a no-op', () => {
    const emitter = new EventEmitter<ToastEvents>()
    expect(() => emitter.emit('show', { message: 'Saved' })).not.toThrow()
  })
})
