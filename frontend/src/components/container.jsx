import React from 'react'

export default function Container({ children, className = "" }) {
  return <div className={`w-full max-w-7xl mx-auto px-3 sm:px-6 ${className}`}>{children}</div>;
}
