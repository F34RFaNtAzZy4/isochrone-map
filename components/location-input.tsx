"use client"
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { MapPin, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LocationInputProps {
  id: string
  value: string
  onChange: (val: string) => void
  onSelectOnMap?: () => void
}

export default function LocationInput({ id, value, onChange, onSelectOnMap }: LocationInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (value.length < 2) {
        setSuggestions([])
        return
      }
      setLoading(true)
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
        } else {
          setSuggestions([])
        }
      } catch {
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(handler)
  }, [value])

  return (
    <div className="relative">
      <Input
        list={undefined}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn('pr-10')}
        autoComplete="off"
      />
      {onSelectOnMap && (
        <MapPin
          className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 cursor-pointer text-muted-foreground"
          onClick={onSelectOnMap}
        />
      )}
      {loading && (
        <Loader2 className="absolute right-8 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
      )}
      {suggestions.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-40 w-full overflow-auto rounded-md border bg-popover text-sm shadow">
          {suggestions.map((s, i) => (
            <li
              key={i}
              className="cursor-pointer px-2 py-1 hover:bg-accent"
              onMouseDown={() => onChange(s)}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
