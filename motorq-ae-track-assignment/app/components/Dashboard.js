'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'

// Typography components
const TypographyH1 = ({ children, className }) => (
  <h1 className={`scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl ${className}`}>
    {children}
  </h1>
)

const TypographyP = ({ children, className }) => (
  <p className={`leading-7 mt-6 ${className}`}>
    {children}
  </p>
)

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
    <div className="p-6 bg-gray-100 min-h-screen">
      <TypographyH1 className="text-gray-800 mb-6">Fleet Dashboard</TypographyH1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-md bg-white">
          <CardHeader>
            <CardTitle>Total Drivers</CardTitle>
          </CardHeader>
          <CardContent>
            <TypographyP className="text-2xl font-semibold">{metrics.totalDrivers}</TypographyP>
          </CardContent>
        </Card>
        <Card className="shadow-md bg-white">
          <CardHeader>
            <CardTitle>Total Vehicles</CardTitle>
          </CardHeader>
          <CardContent>
            <TypographyP className="text-2xl font-semibold">{metrics.totalVehicles}</TypographyP>
          </CardContent>
        </Card>
        <Card className="shadow-md bg-white">
          <CardHeader>
            <CardTitle>Active Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <TypographyP className="text-2xl font-semibold">{metrics.activeAssignments}</TypographyP>
          </CardContent>
        </Card>
        <Card className="shadow-md bg-white">
          <CardHeader>
            <CardTitle>Completed Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <TypographyP className="text-2xl font-semibold">{metrics.completedAssignments}</TypographyP>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
