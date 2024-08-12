import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import DriverForm from './components/DriverForm'
import DriverSearch from './components/DriverSearch'
import VehicleAssignment from './components/VehicleAssignment'
import Dashboard from './components/Dashboard'

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
      <h2>Dashboard</h2>
      <Dashboard />

      <h2>Add New Driver</h2>
      <DriverForm />

      <h2>Search Drivers</h2>
      <DriverSearch />

      <h2>Assign Vehicle to Driver</h2>
      <VehicleAssignment />

      <h2>Drivers</h2>
      {/* Your existing drivers table */}
      <pre>{JSON.stringify(drivers, null, 2)}</pre>

      <h2>Vehicles</h2>
      {/* Your existing vehicles table */}
      <pre>{JSON.stringify(vehicles, null, 2)}</pre>

      <h2>Assignments</h2>
      {/* Your existing assignments table */}
      <pre>{JSON.stringify(assignments, null, 2)}</pre>

      <h2>Assignment Requests</h2>
      {/* Your existing assignment_requests table */}
      <pre>{JSON.stringify(assignmentRequests, null, 2)}</pre>
    </div>
  )
}