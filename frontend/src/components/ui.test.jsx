import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  Button, Card, Badge, Spinner, Input, Select, Textarea,
  IconButton, EmptyState, SectionHeading, Divider, Avatar, Progress,
} from './ui'

describe('UI primitives', () => {
  it('Button renders children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })
  it('Button shows a spinner when loading', () => {
    const { container } = render(<Button loading>Saving…</Button>)
    expect(container.querySelector('svg')).toBeTruthy()
  })
  it('Button supports variants without crashing', () => {
    const { rerender } = render(<Button variant="primary">P</Button>)
    for (const v of ['secondary','ghost','subtle','danger','success','warning','info','outline','soft','link']) {
      rerender(<Button variant={v}>P</Button>)
    }
  })
  it('Card renders children', () => {
    render(<Card><p>hi</p></Card>)
    expect(screen.getByText('hi')).toBeInTheDocument()
  })
  it('Card padding can be disabled', () => {
    const { container } = render(<Card padded={false}><p>x</p></Card>)
    expect(container.firstChild).toBeTruthy()
  })
  it('Badge renders with text', () => {
    render(<Badge color="red">Critical</Badge>)
    expect(screen.getByText('Critical')).toBeInTheDocument()
  })
  it('IconButton renders', () => {
    render(<IconButton aria-label="close">X</IconButton>)
    expect(screen.getByLabelText('close')).toBeInTheDocument()
  })
  it('Spinner renders with given size', () => {
    const { container } = render(<Spinner size={24} />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('width','24')
    expect(svg).toHaveAttribute('height','24')
  })
  it('Input accepts placeholder', () => {
    render(<Input placeholder="Search..." />)
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
  })
  it('Textarea renders', () => {
    render(<Textarea aria-label="note" />)
    expect(screen.getByLabelText('note')).toBeInTheDocument()
  })
  it('Select renders options', () => {
    const { container } = render(
      <Select aria-label="pick">
        <option value="a">A</option>
        <option value="b">B</option>
      </Select>,
    )
    expect(container.querySelectorAll('option').length).toBe(2)
  })
  it('SectionHeading renders eyebrow/title', () => {
    render(<SectionHeading eyebrow="Step 1" title="Hello" sub="world" />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
    expect(screen.getByText('world')).toBeInTheDocument()
    expect(screen.getByText('Step 1')).toBeInTheDocument()
  })
  it('EmptyState renders', () => {
    render(<EmptyState title="Nothing" description="Yet" />)
    expect(screen.getByText('Nothing')).toBeInTheDocument()
    expect(screen.getByText('Yet')).toBeInTheDocument()
  })
  it('Divider renders', () => {
    const { container } = render(<Divider />)
    expect(container.firstChild.tagName.toLowerCase()).toBe('div')
  })
  it('Avatar renders initials', () => {
    render(<Avatar name="Ram Bahadur" />)
    expect(screen.getByText('RB')).toBeInTheDocument()
  })
  it('Progress renders at given value', () => {
    const { container } = render(<Progress value={42} />)
    expect(container.querySelector('[style*="width: 42%"]')).toBeTruthy()
  })
})
