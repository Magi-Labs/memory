import { Component, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'

export class ErrorBoundary extends Component<
  { children: ReactNode; name: string },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div className="view-error" role="alert">
        <h2>{this.props.name} could not be displayed</h2>
        <p className="muted">
          Your saved data is still available. Reopen this view or use another section.
        </p>
        <Button variant="outline" onClick={() => this.setState({ failed: false })}>
          Reopen {this.props.name.toLowerCase()}
        </Button>
      </div>
    )
  }
}
