import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import DriverForm from './components/DriverForm'
import DriverSearch from './components/DriverSearch'
import VehicleAssignment from './components/VehicleAssignment'

export default async function Page() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Fetch driver data
  const { data: drivers } = await supabase.from('driver').select('*')

  // Fetch vehicle data
  const { data: vehicles } = await supabase.from('vehicle').select('*')

  return (
    <div>
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
    </div>
  )
}