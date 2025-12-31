import React from 'react';

type Props = {
  message: string | null;
};

const ErrorBanner: React.FC<Props> = ({ message }) => {
  if (!message) return null;
  return (
    <div style={{ background: '#ffe6e6', color: '#7a0000', padding: '0.75rem 1rem', borderRadius: 8, margin: '0.5rem 0' }}>
      {message}
    </div>
  );
};

export default ErrorBanner;
