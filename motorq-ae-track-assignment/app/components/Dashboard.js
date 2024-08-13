"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DriverForm from "./DriverForm";
import VehicleAssignment from "./VehicleAssignment";
import Overview from "./Overview";

export default function DashboardPage() {
	const [metrics, setMetrics] = useState({
		totalDrivers: 0,
		totalVehicles: 0,
		activeAssignments: 0,
		completedAssignments: 0,
	});

	useEffect(() => {
		fetchMetrics();
	}, []);

	const fetchMetrics = async () => {
		const supabase = createClient();

		// Fetch total drivers
		const { count: driversCount } = await supabase
			.from("driver")
			.select("*", { count: "exact", head: true });

		// Fetch total vehicles
		const { count: vehiclesCount } = await supabase
			.from("vehicle")
			.select("*", { count: "exact", head: true });

		// Fetch active assignments
		const { count: activeAssignmentsCount } = await supabase
			.from("assignment")
			.select("*", { count: "exact", head: true })
			.eq("status", "accepted");

		// Fetch completed assignments
		const { count: completedAssignmentsCount } = await supabase
			.from("assignment")
			.select("*", { count: "exact", head: true })
			.eq("status", "completed");

		setMetrics({
			totalDrivers: driversCount,
			totalVehicles: vehiclesCount,
			activeAssignments: activeAssignmentsCount,
			completedAssignments: completedAssignmentsCount,
		});
	};
	return (
		<>
			<div className="hidden flex-col md:flex">
				<div className="flex-1 space-y-4 p-8 pt-6">
					<div className="flex items-center justify-between space-y-2">
						<h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
					</div>
					<Tabs defaultValue="overview" className="space-y-4">
						<TabsList>
							<TabsTrigger value="overview">Overview</TabsTrigger>
							<TabsTrigger value="driver">Driver</TabsTrigger>
							<TabsTrigger value="assign">Assign</TabsTrigger>
						</TabsList>
						<TabsContent value="overview" className="space-y-4">
							<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
								<Card>
									<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
										<CardTitle className="text-sm font-medium">
											Total Drivers
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="text-2xl font-bold">
											{metrics.totalDrivers}
										</div>
									</CardContent>
								</Card>
								<Card>
									<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
										<CardTitle className="text-sm font-medium">
											Vehicles
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="text-2xl font-bold">
											{metrics.totalVehicles}
										</div>
									</CardContent>
								</Card>
								<Card>
									<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
										<CardTitle className="text-sm font-medium">
											Active Assignments
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="text-2xl font-bold">
											{metrics.activeAssignments}
										</div>
									</CardContent>
								</Card>
								<Card>
									<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
										<CardTitle className="text-sm font-medium">
											Active Now
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="text-2xl font-bold">
											{metrics.completedAssignments}
										</div>
									</CardContent>
								</Card>
							</div>
							<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
								<Card className="col-span-7">
									<CardHeader>
										<CardTitle>Overview</CardTitle>
									</CardHeader>
									<CardContent className="pl-2">
										<Overview />
									</CardContent>
								</Card>
							</div>
						</TabsContent>
						<TabsContent value="driver" className="flex flex-wrap w-full">
							<DriverForm />
						</TabsContent>
						<TabsContent value="assign">
							<VehicleAssignment />
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</>
	);
}
