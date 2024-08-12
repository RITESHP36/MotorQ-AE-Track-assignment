'use client'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function DriverSearch() {
  const [searchLocation, setSearchLocation] = useState('')
  const [searchResults, setSearchResults] = useState([])

  const handleSearch = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('driver')
      .select('*')
      .textSearch('location', searchLocation)
      .order('location')

    if (error) console.error('Error searching drivers:', error)
    else setSearchResults(data)
  }

  return (
    <div>
      <input
        type="text"
        value={searchLocation}
        onChange={(e) => setSearchLocation(e.target.value)}
        placeholder="Search by location"
      />
      <button onClick={handleSearch}>Search</button>
      <ul>
        {searchResults.map((driver) => (
          <li key={driver.id}>
            {driver.name} - {driver.location}
          </li>
        ))}
      </ul>
    </div>
  )
}