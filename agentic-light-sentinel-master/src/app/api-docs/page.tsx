'use client';

import { useEffect, useState } from 'react';

export default function ApiDocsPage() {
  const [spec, setSpec] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/docs/openapi.json')
      .then(res => res.json())
      .then(data => {
        setSpec(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading API Documentation</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            INFINITY LOOP - Light Pollution Monitoring API
          </h1>
          <p className="text-gray-600">
            Interactive API documentation for the INFINITY LOOP Light Pollution Monitoring System
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">API Specification</h2>
          <p className="text-gray-600 mb-4">
            View the complete OpenAPI 3.0 specification for our API endpoints.
          </p>
          <div className="flex space-x-4">
            <a 
              href="/api/docs/openapi.json" 
              target="_blank"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              View OpenAPI JSON
            </a>
            <a 
              href="https://petstore.swagger.io/?url=/api/docs/openapi.json" 
              target="_blank"
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Open in Swagger UI
            </a>
          </div>
        </div>

        {spec && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">API Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">API Information</h3>
                <ul className="space-y-2 text-gray-600">
                  <li><strong>Title:</strong> {spec.info?.title}</li>
                  <li><strong>Version:</strong> {spec.info?.version}</li>
                  <li><strong>Description:</strong> {spec.info?.description}</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Endpoints</h3>
                <div className="space-y-1 text-gray-600">
                  {Object.keys(spec.paths || {}).map(path => (
                    <div key={path} className="text-sm font-mono">
                      {path}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-3 text-blue-600">Quick Start</h3>
            <p className="text-gray-600 mb-4">
              Get started with our API in minutes using our comprehensive endpoints.
            </p>
            <a 
              href="/api/health" 
              target="_blank"
              className="text-blue-500 hover:text-blue-700 font-medium"
            >
              Try Health Check →
            </a>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-3 text-green-600">Authentication</h3>
            <p className="text-gray-600 mb-4">
              Secure your API calls with our authentication system.
            </p>
            <div className="text-sm text-gray-500">
              <div>Bearer Token Authentication</div>
              <div>API Key Support</div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-3 text-purple-600">Rate Limits</h3>
            <p className="text-gray-600 mb-4">
              Understand our rate limiting to optimize your API usage.
            </p>
            <div className="text-sm text-gray-500">
              <div>100 requests/minute</div>
              <div>1000 requests/hour</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}