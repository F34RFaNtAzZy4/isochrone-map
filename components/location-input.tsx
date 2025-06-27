"use client"
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"

interface LocationInputProps {
  id: string
  value: string
  onChange: (val: string) => void
}

export default function LocationInput({ id, value, onChange }: LocationInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (value.length < 2) {
        setSuggestions([])
        return
      }
      try {
        const res = await fetch("/api/geocode", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address: value }),
        })
        if (res.ok) {
          const data = await res.json()
          const opts = data.features.map((f: any) => f.properties.formatted as string)
          setSuggestions(opts)
        }
      } catch {
        setSuggestions([])
      }
    }, 300)
    return () => clearTimeout(handler)
  }, [value])

  return (
    <div>
      <Input list={`${id}-list`} id={id} value={value} onChange={(e) => onChange(e.target.value)} />
      <datalist id={`${id}-list`}>
        {suggestions.map((s, i) => (
          <option value={s} key={i} />
        ))}
      </datalist>
    </div>
  )
}
