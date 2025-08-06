import { Component } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Alert, 
  AlertTitle,
  Paper,
  Container
} from '@mui/material';
import { 
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon
} from '@mui/icons-material';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Report error to monitoring service if available
    if (window.reportError) {
      window.reportError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, retryCount } = this.state;
      const { fallback: CustomFallback } = this.props;

      // If a custom fallback is provided, use it
      if (CustomFallback) {
        return (
          <CustomFallback 
            error={error}
            errorInfo={errorInfo}
            onRetry={this.handleRetry}
            retryCount={retryCount}
          />
        );
      }

      // Default error UI
      return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              textAlign: 'center',
              backgroundColor: '#fafafa'
            }}
          >
            <ErrorIcon 
              sx={{ 
                fontSize: 64, 
                color: 'error.main', 
                mb: 2 
              }} 
            />
            
            <Typography variant="h4" component="h1" gutterBottom color="error">
              Oops! Something went wrong
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              We're sorry, but something unexpected happened. 
              {retryCount > 0 && ` (Retry attempt: ${retryCount})`}
            </Typography>

            <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
              <AlertTitle>Error Details</AlertTitle>
              <Typography variant="body2" component="div">
                <strong>Error:</strong> {error?.message || 'Unknown error'}
              </Typography>
              {process.env.NODE_ENV === 'development' && errorInfo && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" component="div">
                    <strong>Stack Trace:</strong>
                  </Typography>
                  <Box 
                    component="pre" 
                    sx={{ 
                      fontSize: '0.75rem',
                      backgroundColor: '#f5f5f5',
                      p: 1,
                      borderRadius: 1,
                      overflow: 'auto',
                      maxHeight: '200px'
                    }}
                  >
                    {errorInfo.componentStack}
                  </Box>
                </Box>
              )}
            </Alert>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<RefreshIcon />}
                onClick={this.handleRetry}
                size="large"
              >
                Try Again
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<HomeIcon />}
                onClick={this.handleGoHome}
                size="large"
              >
                Go Home
              </Button>
            </Box>

            {retryCount > 2 && (
              <Alert severity="info" sx={{ mt: 3 }}>
                <AlertTitle>Still having trouble?</AlertTitle>
                <Typography variant="body2">
                  If this problem persists, try refreshing the page or clearing your browser cache. 
                  You can also contact support for assistance.
                </Typography>
              </Alert>
            )}
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;