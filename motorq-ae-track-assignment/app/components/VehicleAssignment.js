'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function VehicleAssignment() {
  const [drivers, setDrivers] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [selectedDriver, setSelectedDriver] = useState('')
  const [selectedVehicle, setSelectedVehicle] = useState('')

  useEffect(() => {
    fetchDriversAndVehicles()
  }, [])

  const fetchDriversAndVehicles = async () => {
    const supabase = createClient()
    const { data: driversData } = await supabase.from('driver').select('*')
    const { data: vehiclesData } = await supabase.from('vehicle').select('*')
    setDrivers(driversData)
    setVehicles(vehiclesData)
  }

  const handleAssignment = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('vehicle')
      .update({ assigned_driver: selectedDriver })
      .eq('vehicleid', selectedVehicle)
    if (error) console.error('Error assigning vehicle:', error)
    else console.log('Vehicle assigned successfully:', data)
  }

  return (
    <div>
      <select
        value={selectedDriver}
        onChange={(e) => setSelectedDriver(e.target.value)}
      >
        <option value="">Select a driver</option>
        {drivers.map((driver) => (
          <option key={driver.driverid} value={driver.driverid}>
            {driver.name}
          </option>
        ))}
      </select>
      <select
        value={selectedVehicle}
        onChange={(e) => setSelectedVehicle(e.target.value)}
      >
        <option value="">Select a vehicle</option>
        {vehicles.map((vehicle) => (
          <option key={vehicle.vehicleid} value={vehicle.vehicleid}>
            {vehicle.makeandmodel} - {vehicle.licenseplate}
          </option>
        ))}
      </select>
      <button onClick={handleAssignment}>Assign Vehicle</button>
    </div>
  )
}