'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    totalDrivers: 0,
    totalVehicles: 0,
    activeAssignments: 0,
    completedAssignments: 0,
  })

  useEffect(() => {
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    const supabase = createClient()

    // Fetch total drivers
    const { count: driversCount } = await supabase
      .from('driver')
      .select('*', { count: 'exact', head: true })

    // Fetch total vehicles
    const { count: vehiclesCount } = await supabase
      .from('vehicle')
      .select('*', { count: 'exact', head: true })

    // Fetch active assignments
    const { count: activeAssignmentsCount } = await supabase
      .from('assignment')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'accepted')

    // Fetch completed assignments
    const { count: completedAssignmentsCount } = await supabase
      .from('assignment')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')

    setMetrics({
      totalDrivers: driversCount,
      totalVehicles: vehiclesCount,
      activeAssignments: activeAssignmentsCount,
      completedAssignments: completedAssignmentsCount,
    })
  }

  return (
    <div>
      <h2>Fleet Dashboard</h2>
      <div>
        <p>Total Drivers: {metrics.totalDrivers}</p>
        <p>Total Vehicles: {metrics.totalVehicles}</p>
        <p>Active Assignments: {metrics.activeAssignments}</p>
        <p>Completed Assignments: {metrics.completedAssignments}</p>
      </div>
    </div>
  )
}