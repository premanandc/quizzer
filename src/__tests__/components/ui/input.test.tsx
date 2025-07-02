import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '@/components/ui/input'

describe('Input', () => {
  afterEach(() => {
    cleanup()
  })

  it('should render input element', () => {
    render(<Input />)

    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
  })

  it('should apply default classes', () => {
    render(<Input />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('flex', 'h-10', 'w-full', 'rounded-md', 'border')
  })

  it('should merge custom className with default classes', () => {
    render(<Input className="custom-class" />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('flex', 'h-10', 'w-full', 'custom-class')
  })

  it('should pass through input type', () => {
    render(<Input type="password" />)

    const input = document.querySelector('input[type="password"]')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'password')
  })

  it('should pass through all input props', () => {
    render(
      <Input
        placeholder="Enter text"
        disabled
        required
        maxLength={10}
        value="test"
        onChange={() => {}}
      />
    )

    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('placeholder', 'Enter text')
    expect(input).toBeDisabled()
    expect(input).toBeRequired()
    expect(input).toHaveAttribute('maxLength', '10')
    expect(input).toHaveValue('test')
  })

  it('should handle user input', async () => {
    const user = userEvent.setup()
    render(<Input />)

    const input = screen.getByRole('textbox')
    await user.type(input, 'Hello World')

    expect(input).toHaveValue('Hello World')
  })

  it('should support ref forwarding', () => {
    let inputRef: HTMLInputElement | null = null

    const TestComponent = () => (
      <Input
        ref={(el) => {
          inputRef = el
        }}
      />
    )

    render(<TestComponent />)

    expect(inputRef).toBeInstanceOf(HTMLInputElement)
  })

  it('should handle different input types correctly', () => {
    const { rerender } = render(<Input type="email" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email')

    rerender(<Input type="tel" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'tel')

    rerender(<Input type="url" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'url')
  })

  it('should have focus styles when focused', async () => {
    const user = userEvent.setup()
    render(<Input />)

    const input = screen.getByRole('textbox')
    await user.click(input)

    expect(input).toHaveFocus()
    expect(input).toHaveClass(
      'focus-visible:outline-none',
      'focus-visible:ring-2'
    )
  })

  it('should have disabled styles when disabled', () => {
    render(<Input disabled />)

    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
    expect(input).toHaveClass(
      'disabled:cursor-not-allowed',
      'disabled:opacity-50'
    )
  })

  it('should handle placeholder text', () => {
    render(<Input placeholder="Type here..." />)

    const input = screen.getByPlaceholderText('Type here...')
    expect(input).toBeInTheDocument()
    expect(input).toHaveClass('placeholder:text-gray-500')
  })

  it('should support aria attributes', () => {
    render(
      <Input
        aria-label="Search input"
        aria-describedby="search-help"
        aria-invalid={true}
      />
    )

    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('aria-label', 'Search input')
    expect(input).toHaveAttribute('aria-describedby', 'search-help')
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  it('should handle file input type', () => {
    // Note: file inputs don't have textbox role
    render(<Input type="file" />)

    const input = document.querySelector('input[type="file"]')
    expect(input).toBeInTheDocument()
    expect(input).toHaveClass('file:border-0', 'file:bg-transparent')
  })
})
