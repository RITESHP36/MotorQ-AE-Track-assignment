'use client'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function DriverSearch() {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])

  const handleSearch = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('driver')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,driverphone.ilike.%${searchTerm}%`)
    if (error) console.error('Error searching drivers:', error)
    else setSearchResults(data)
  }

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search by name or phone"
      />
      <button onClick={handleSearch}>Search</button>
      <ul>
        {searchResults.map((driver) => (
          <li key={driver.driverid}>
            {driver.name} - {driver.driverphone}
          </li>
        ))}
      </ul>
    </div>
  )
}