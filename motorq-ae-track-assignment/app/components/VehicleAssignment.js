"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Select from "react-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AssignmentTable from "./AssignmentTable";
import { v4 as uuidv4 } from "uuid";

export default function VehicleAssignment() {
	const [drivers, setDrivers] = useState([]);
	const [vehicles, setVehicles] = useState([]);
	const [assignments, setAssignments] = useState([]);
	const [selectedDrivers, setSelectedDrivers] = useState([]);
	const [selectedVehicle, setSelectedVehicle] = useState(null);
	const [startTime, setStartTime] = useState("");
	const [endTime, setEndTime] = useState("");
	const [searchLocation, setSearchLocation] = useState(null); // Update to hold the whole object
	const [searchResults, setSearchResults] = useState([]);

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
		fetchAssignments();
	}, []);

	const fetchAssignments = async () => {
		const supabase = createClient();
		const { data: assignmentData, error } = await supabase
			.from("assignment")
			.select("*");
		if (error) {
			console.error("Error fetching assignments:", error);
			return;
		}
		setAssignments(assignmentData);
		await fetchVehicles(assignmentData);
		await fetchDrivers(assignmentData);
	};

	const fetchVehicles = async (assignments) => {
		const supabase = createClient();
		const { data: allVehicles, error } = await supabase
			.from("vehicle")
			.select("*");
		if (error) {
			console.error("Error fetching vehicles:", error);
			return;
		}

		// Filter out vehicles that are assigned with status "accepted"
		const assignedVehicleIds = assignments
			.filter((assignment) => assignment.status === "accepted")
			.map((assignment) => assignment.vehicle_id);

		const availableVehicles = allVehicles.filter(
			(vehicle) => !assignedVehicleIds.includes(vehicle.vehicleid)
		);
		setVehicles(availableVehicles);
	};

	const fetchDrivers = async (assignments) => {
		const supabase = createClient();
		const { data: allDrivers, error } = await supabase
			.from("driver")
			.select("*");
		if (error) {
			console.error("Error fetching drivers:", error);
			return;
		}

		// Filter out drivers that are assigned with status "accepted"
		const assignedDriverIds = assignments
			.filter((assignment) => assignment.status === "accepted")
			.map((assignment) => assignment.driver_id);

		const availableDrivers = allDrivers.filter(
			(driver) => !assignedDriverIds.includes(driver.driverid)
		);
		setDrivers(availableDrivers);
	};

	const handleSearch = async () => {
		if (!searchLocation) return;
		setSearchResults([]);

		const supabase = createClient();
		const { data, error } = await supabase
			.from("driver")
			.select("*")
			.eq("location", searchLocation.value);

		if (error) console.error("Error searching drivers:", error);
		else setSearchResults(data);
	};

	const handleAssignment = async () => {
		const supabase = createClient();

		if (!selectedDrivers.length || !selectedVehicle || !startTime || !endTime) {
			alert("Please fill in all the fields");
			return;
		}

		// Convert startTime and endTime to UTC
		const startTimeUTC = new Date(startTime).toISOString();
		const endTimeUTC = new Date(endTime).toISOString();

		// Check if the selected vehicle is already assigned during the selected time
		const { data: vehicleConflicts, error: vehicleConflictError } =
			await supabase
				.from("assignment")
				.select("*")
				.eq("vehicle_id", selectedVehicle.value)
				.eq("status", "accepted")
				.or(`start_time.lte.${endTime},end_time.gte.${startTime}`);

		if (vehicleConflictError) {
			console.error("Error checking vehicle conflicts:", vehicleConflictError);
			return;
		}

		if (vehicleConflicts && vehicleConflicts.length > 0) {
			alert("The selected vehicle is already assigned during this time.");
			return;
		}

		// Check for driver conflicts
		const { data: driverConflicts, error: driverConflictError } = await supabase
			.from("assignment")
			.select("*")
			.in(
				"driver_id",
				selectedDrivers.map((driver) => driver.value)
			)
			.eq("status", "accepted")
			.or(`start_time.lte.${endTime},end_time.gte.${startTime}`);

		if (driverConflictError) {
			console.error("Error checking driver conflicts:", driverConflictError);
			return;
		}

		if (driverConflicts && driverConflicts.length > 0) {
			alert(
				"Some selected drivers have scheduling conflicts. Please choose different drivers or times."
			);
			return;
		}

		let assignmentIdUUID = uuidv4();

		// Create assignments for each selected driver
		const assignments = selectedDrivers.map((driver) => ({
			assignmentid: assignmentIdUUID,
			vehicle_id: selectedVehicle.value,
			driver_id: driver.value,
			start_time: startTimeUTC,
			end_time: endTimeUTC,
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
		setSearchResults([]);
		setSearchLocation(null); // Reset the searchLocation to null
		fetchAssignments(); // Fetch updated assignments
	};

	return (
		<div className="flex flex-row space-x-6 p-6">
			{/* Left side: Form */}
			<div className="w-1/2">
				<Card className="w-full shadow-lg">
					<CardHeader>
						<CardTitle className="text-center text-2xl">
							Search Drivers and Create Vehicle Assignment
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-6">
							<div>
								<h3 className="text-lg font-medium">
									Search Drivers by Location:
								</h3>
								<Select
									value={searchLocation}
									onChange={(selectedOption) =>
										setSearchLocation(selectedOption || null)
									}
									options={drivers.map((driver) => ({
										label: driver.location,
										value: driver.location,
									}))}
									placeholder="Select a location"
									className="w-full"
								/>
								<Button
									onClick={handleSearch}
									className="w-full bg-blue-500 hover:bg-blue-600 mt-2"
								>
									Search
								</Button>
							</div>

							{searchResults.length > 0 && (
								<div>
									<h3 className="text-lg font-medium">Select Drivers:</h3>
									<Select
										isMulti
										value={selectedDrivers}
										onChange={setSelectedDrivers}
										options={searchResults.map((driver) => ({
											label: `${driver.name} (${driver.driverid})`,
											value: driver.driverid,
										}))}
										placeholder="Select drivers"
										styles={customStyles}
									/>
								</div>
							)}

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

			{/* Right side: Assignments Table */}
			<div className="w-1/2">
				<AssignmentTable assignments={assignments} />
			</div>
		</div>
	);
}
