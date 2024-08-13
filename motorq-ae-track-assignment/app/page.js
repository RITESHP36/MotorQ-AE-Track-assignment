import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import Dashboard from './components/Dashboard'
import HomePage from './components/HomePage'

export default async function Page() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Fetch driver data
  const { data: drivers } = await supabase.from('driver').select('*')

  // Fetch vehicle data
  const { data: vehicles } = await supabase.from('vehicle').select('*')

  // Fetch assignment data
  const { data: assignments } = await supabase.from('assignment').select('*')

  // Fetch assignment_request data
  const { data: assignmentRequests } = await supabase.from('assignment_request').select('*')

  return (
    <div>
      <HomePage />
      {/* <Dashboard /> */}
      {/*
      <h2>Search Drivers</h2>
      <DriverSearch />
       */}

      {/* <h2>Drivers</h2>
      <pre>{JSON.stringify(drivers, null, 2)}</pre>

      <h2>Vehicles</h2>
      <pre>{JSON.stringify(vehicles, null, 2)}</pre>

      <h2>Assignments</h2>
      <pre>{JSON.stringify(assignments, null, 2)}</pre>

      <h2>Assignment Requests</h2>
      <pre>{JSON.stringify(assignmentRequests, null, 2)}</pre> */}
    </div>
  )
}