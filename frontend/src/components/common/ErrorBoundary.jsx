import { Component } from 'react';

/**
 * Catches render-time errors anywhere below it.
 *
 * Without a boundary a single thrown error unmounts the whole tree and the user
 * is left staring at a blank page with no way forward.
 *
 * Must be a class: there is no hook equivalent of componentDidCatch.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info?.componentStack);
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center px-4">
        <div className="max-w-lg w-full bg-gray-800 bg-opacity-70 border border-gray-700 rounded-2xl p-8 text-center">
          <div className="text-5xl mb-4" aria-hidden="true">
            ⚠️
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
          <p className="text-gray-400 mb-6">
            The page hit an unexpected error. You can try again, or go back to your dashboard.
          </p>

          {import.meta.env.DEV && (
            <pre className="text-left text-xs text-red-300 bg-black bg-opacity-50 rounded-lg p-3 mb-6 overflow-x-auto">
              {error.message}
            </pre>
          )}

          <div className="flex gap-3 justify-center">
            <button
              onClick={this.handleReset}
              className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
            >
              Try again
            </button>
            <a
              href="/dashboard"
              className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-100 font-semibold rounded-lg transition-colors"
            >
              Go to dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
