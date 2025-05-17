'use client'

import { useState } from 'react'
import { apiClient } from '@/lib/api-client'

export default function DummyPage() {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const handleCreateDummy = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiClient.createSingleDummy()
      setResult(JSON.stringify(data, null, 2))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dummy Data Creator</h1>
      <button
        onClick={handleCreateDummy}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create Dummy Quest'}
      </button>
      
      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {result && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Result:</h2>
          <pre className="p-4 bg-gray-100 overflow-auto rounded">{result}</pre>
        </div>
      )}
    </div>
  )
} 