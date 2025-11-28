import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Scrabbble</h1>
        <p className="text-muted-foreground mb-4">
          React + TypeScript + Tailwind + shadcn/ui + Firebase
        </p>
        <button
          onClick={() => setCount((count) => count + 1)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Count is {count}
        </button>
      </div>
    </div>
  )
}

export default App
