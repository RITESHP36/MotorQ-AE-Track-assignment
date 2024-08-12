"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Select from "react-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function VehicleAssignment() {
	const [drivers, setDrivers] = useState([]);
	const [vehicles, setVehicles] = useState([]);
	const [selectedDrivers, setSelectedDrivers] = useState([]);
	const [selectedVehicle, setSelectedVehicle] = useState(null);
	const [startTime, setStartTime] = useState("");
	const [endTime, setEndTime] = useState("");

	const customStyles = {
		control: (provided) => ({
			...provided,
			backgroundColor: "#f9fafb",
			borderColor: "#e5e7eb",
			minHeight: "48px",
			boxShadow: "none",
			"&:hover": {
				borderColor: "#d1d5db",
			},
		}),
		option: (provided, state) => ({
			...provided,
			backgroundColor: state.isSelected
				? "#3b82f6"
				: state.isFocused
				? "#e5e7eb"
				: "white",
			color: state.isSelected ? "white" : "black",
		}),
	};

	useEffect(() => {
		fetchDriversAndVehicles();
	}, []);

	const fetchDriversAndVehicles = async () => {
		const supabase = createClient();
		const { data: driversData } = await supabase.from("driver").select("*");
		const { data: vehiclesData } = await supabase.from("vehicle").select("*");
		setDrivers(driversData);
		setVehicles(vehiclesData);
	};

	const handleAssignment = async () => {
		const supabase = createClient();

		if (!selectedDrivers.length) {
			alert("Please select at least one driver");
			return;
		}

		// Check for conflicts
		const { data: conflicts, error: conflictError } = await supabase
			.from("assignment")
			.select("*")
			.in(
				"driver_id",
				selectedDrivers.map((driver) => driver.value)
			)
			.or(`start_time.lte.${endTime},end_time.gte.${startTime}`);

		if (conflictError) {
			console.error("Error checking conflicts:", conflictError);
			return;
		}

		if (conflicts && conflicts.length > 0) {
			alert(
				"There is a scheduling conflict. Please choose different times or drivers."
			);
			return;
		}

		// Create assignments for each selected driver
		const assignments = selectedDrivers.map((driver) => ({
			vehicle_id: selectedVehicle.value,
			driver_id: driver.value,
			start_time: startTime,
			end_time: endTime,
			status: "pending",
		}));

		const { data: assignmentData, error: assignmentError } = await supabase
			.from("assignment")
			.insert(assignments)
			.select();

		if (assignmentError) {
			console.error("Error creating assignments:", assignmentError);
			return;
		}

		console.log("Assignments created successfully");
		// Reset form
		setSelectedDrivers([]);
		setSelectedVehicle(null);
		setStartTime("");
		setEndTime("");
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
			<Card className="w-full max-w-2xl shadow-lg">
				<CardHeader>
					<CardTitle className="text-center text-2xl">
						Create Vehicle Assignment
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-6">
						<div>
							<h3 className="text-lg font-medium">Select Drivers:</h3>
							<Select
								isMulti
								value={selectedDrivers}
								onChange={setSelectedDrivers}
								options={drivers.map((driver) => ({
									label: driver.name,
									value: driver.driverid,
								}))}
								placeholder="Select drivers"
								styles={customStyles}
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700">
								Select a vehicle:
							</label>
							<Select
								value={selectedVehicle}
								onChange={setSelectedVehicle}
								options={vehicles.map((vehicle) => ({
									label: `${vehicle.makeandmodel} - ${vehicle.licenseplate}`,
									value: vehicle.vehicleid,
								}))}
								placeholder="Select a vehicle"
								styles={customStyles}
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700">
								Start Time:
							</label>
							<Input
								type="datetime-local"
								value={startTime}
								onChange={(e) => setStartTime(e.target.value)}
								className="w-full mt-2"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700">
								End Time:
							</label>
							<Input
								type="datetime-local"
								value={endTime}
								onChange={(e) => setEndTime(e.target.value)}
								className="w-full mt-2"
							/>
						</div>

						<Button
							onClick={handleAssignment}
							className="w-full bg-blue-500 hover:bg-blue-600"
						>
							Create Assignment
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
