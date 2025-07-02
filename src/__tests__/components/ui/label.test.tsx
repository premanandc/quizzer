import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { Label } from '@/components/ui/label'

describe('Label', () => {
  afterEach(() => {
    cleanup()
  })
  it('should render label element', () => {
    render(<Label>Test Label</Label>)

    const label = screen.getByText('Test Label')
    expect(label).toBeInTheDocument()
    expect(label.tagName).toBe('LABEL')
  })

  it('should apply default classes', () => {
    render(<Label>Test Label</Label>)

    const label = screen.getByText('Test Label')
    expect(label).toHaveClass('text-sm', 'font-medium', 'leading-none')
  })

  it('should merge custom className with default classes', () => {
    render(<Label className="custom-class">Test Label</Label>)

    const label = screen.getByText('Test Label')
    expect(label).toHaveClass('text-sm', 'font-medium', 'custom-class')
  })

  it('should pass through label props', () => {
    render(<Label htmlFor="input-id">Test Label</Label>)

    const label = screen.getByText('Test Label')
    expect(label).toHaveAttribute('for', 'input-id')
  })

  it('should support ref forwarding', () => {
    let labelRef: HTMLLabelElement | null = null

    const TestComponent = () => (
      <Label
        ref={(el) => {
          labelRef = el
        }}
      >
        Test Label
      </Label>
    )

    render(<TestComponent />)

    expect(labelRef).toBeInstanceOf(HTMLLabelElement)
  })

  it('should handle children content', () => {
    render(
      <Label data-testid="complex-label">
        <span>Complex</span> Content
      </Label>
    )

    expect(screen.getByText('Complex')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
    const label = screen.getByTestId('complex-label')
    expect(label).toBeInTheDocument()
  })

  it('should support aria attributes', () => {
    render(
      <Label aria-label="Form label" aria-describedby="label-help">
        Test Label
      </Label>
    )

    const label = screen.getByText('Test Label')
    expect(label).toHaveAttribute('aria-label', 'Form label')
    expect(label).toHaveAttribute('aria-describedby', 'label-help')
  })

  it('should handle empty content', () => {
    render(<Label />)

    const label = document.querySelector('label')
    expect(label).toBeInTheDocument()
    expect(label).toBeEmptyDOMElement()
  })

  it('should associate with form controls correctly', () => {
    render(
      <div>
        <Label htmlFor="test-input">Username</Label>
        <input id="test-input" />
      </div>
    )

    const label = screen.getByText('Username')
    const input = screen.getByRole('textbox')

    expect(label).toHaveAttribute('for', 'test-input')
    expect(input).toHaveAttribute('id', 'test-input')
  })

  it('should have peer-disabled styles', () => {
    render(<Label>Test Label</Label>)

    const label = screen.getByText('Test Label')
    expect(label).toHaveClass(
      'peer-disabled:cursor-not-allowed',
      'peer-disabled:opacity-70'
    )
  })

  it('should handle multiple class names', () => {
    render(<Label className="text-red-500 font-bold bg-blue-100">Test</Label>)

    const label = screen.getByText('Test')
    expect(label).toHaveClass('text-red-500', 'font-bold', 'bg-blue-100')
    expect(label).toHaveClass(
      'text-sm',
      'leading-none',
      'peer-disabled:cursor-not-allowed'
    )
  })

  it('should support data attributes', () => {
    render(
      <Label data-testid="custom-label" data-custom="value">
        Test
      </Label>
    )

    const label = screen.getByTestId('custom-label')
    expect(label).toHaveAttribute('data-custom', 'value')
  })

  it('should support event handlers', () => {
    const handleClick = vi.fn()
    render(<Label onClick={handleClick}>Clickable Label</Label>)

    const label = screen.getByText('Clickable Label')
    label.click()

    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
