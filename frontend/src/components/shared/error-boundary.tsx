import { Component, type ReactNode } from 'react'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
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
      <Alert variant="destructive" className="my-6">
        <AlertTitle>{this.props.name} could not be displayed</AlertTitle>
        <AlertDescription>
          Your saved data is still available. Reopen this view or use another section.
        </AlertDescription>
        <Button variant="outline" onClick={() => this.setState({ failed: false })}>
          Reopen {this.props.name.toLowerCase()}
        </Button>
      </Alert>
    )
  }
}
