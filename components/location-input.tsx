"use client"
import { useEffect, useState } from "react"
import { Input } from "@/components/atoms/input"
import { MapPin, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LocationInputProps {
  id: string
  value: string
  onChange: (val: string) => void
  onSelectOnMap?: () => void
  onDelete?: () => void
}

export default function LocationInput({
  id,
  value,
  onChange,
  onSelectOnMap,
  onDelete,
}: LocationInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false)

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
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={cn("pr-14")}  
        autoComplete="off"
      />

      {/* right-aligned icons */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
        {onSelectOnMap && (
          <MapPin
            className="h-4 w-4 cursor-pointer text-muted-foreground"
            onClick={onSelectOnMap}
          />
        )}
        {value && !loading && (
          <X
            className="h-4 w-4 cursor-pointer text-muted-foreground"
            onClick={onDelete}
          />
        )}
        {loading && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* dropdown suggestions */}
      {focused && suggestions.length > 0 && (
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
