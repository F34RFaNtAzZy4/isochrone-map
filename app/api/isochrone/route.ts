import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { lat, lon, type, mode, range } = await request.json()
  const apiKey = process.env.GEOAPIFY_API_KEY

  if (!apiKey) {
    return NextResponse.json({ message: "API key not configured on server" }, { status: 500 })
  }

  if (!lat || !lon || !type || !mode || !range) {
    return NextResponse.json({ message: "Missing required parameters for isoline" }, { status: 400 })
  }

  try {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lon.toString(),
      type,
      mode,
      range: range.toString(),
      apiKey,
    })

    const geoapifyUrl = `https://api.geoapify.com/v1/isoline?${params.toString()}`
    const geoapifyResponse = await fetch(geoapifyUrl)

    // First, check if the request was successful
    if (!geoapifyResponse.ok) {
      // If not, get the error text and return a proper error response
      const errorText = await geoapifyResponse.text()
      console.error("Geoapify Isoline Error:", errorText)
      return NextResponse.json(
        { message: `Failed to fetch isoline: ${geoapifyResponse.statusText}` },
        { status: geoapifyResponse.status },
      )
    }

    // Only parse JSON if the request was successful
    const data = await geoapifyResponse.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Isoline API route error:", error)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
  }
}
