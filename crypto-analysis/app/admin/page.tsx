'use client';

import { useState } from 'react';

export default function AdminPage() {
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    setImporting(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch('/api/admin/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'import' }),
      });

      const data = await response.json();

      if (data.success) {
        setResults(data);
      } else {
        setError(data.error || 'Import failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="mt-1 text-sm text-gray-500">
            Import cryptocurrency data from CSV files
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Data Import</h2>
          
          <p className="text-gray-600 mb-4">
            This will import all CSV files from the <code className="bg-gray-100 px-2 py-1 rounded">data/raw</code> directory.
            Existing data will be replaced.
          </p>

          <button
            onClick={handleImport}
            disabled={importing}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {importing ? 'Importing...' : 'Import Data'}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">Error:</p>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {results && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Import Results</h3>
              <p className="text-green-600 font-medium mb-4">
                {results.message}
              </p>

              <div className="space-y-2">
                {results.results?.map((result: any, index: number) => (
                  <div
                    key={index}
                    className={`p-3 rounded ${
                      result.success ? 'bg-green-50' : 'bg-red-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {result.file}
                          {result.success && (
                            <span className="ml-2 text-green-600">✓</span>
                          )}
                          {!result.success && (
                            <span className="ml-2 text-red-600">✗</span>
                          )}
                        </p>
                        {result.coinName && (
                          <p className="text-sm text-gray-600">
                            {result.coinName} ({result.symbol})
                          </p>
                        )}
                        {result.error && (
                          <p className="text-sm text-red-600">{result.error}</p>
                        )}
                      </div>
                      {result.recordsImported && (
                        <span className="text-sm font-medium text-gray-600">
                          {result.recordsImported.toLocaleString()} records
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800">
                  <span className="font-medium">Next step:</span> Visit the{' '}
                  <a href="/dashboard" className="underline hover:text-blue-600">
                    dashboard
                  </a>{' '}
                  to view the imported data.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
          <div className="space-y-2">
            <a
              href="/dashboard"
              className="block px-4 py-2 bg-gray-50 rounded hover:bg-gray-100"
            >
              → View Dashboard
            </a>
            <a
              href="/api/cryptocurrencies"
              target="_blank"
              className="block px-4 py-2 bg-gray-50 rounded hover:bg-gray-100"
            >
              → API: Cryptocurrencies List
            </a>
            <a
              href="/api/analysis/trends?days=30"
              target="_blank"
              className="block px-4 py-2 bg-gray-50 rounded hover:bg-gray-100"
            >
              → API: Trends Analysis
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
