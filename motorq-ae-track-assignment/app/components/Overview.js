"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableRow,
	TableHead,
	TableBody,
	TableCell,
} from "@/components/ui/table";

export default function Overview() {
	const [drivers, setDrivers] = useState([]);
	const [vehicles, setVehicles] = useState([]);
	const [searchDriverName, setSearchDriverName] = useState("");
	const [searchDriverPhone, setSearchDriverPhone] = useState("");
	const [searchVehicleMakeModel, setSearchVehicleMakeModel] = useState("");
	const [searchVehicleLicensePlate, setSearchVehicleLicensePlate] =
		useState("");
	const [showMoreDrivers, setShowMoreDrivers] = useState(false);
	const [showMoreVehicles, setShowMoreVehicles] = useState(false);

	useEffect(() => {
		fetchData();
	}, [
		searchDriverName,
		searchDriverPhone,
		searchVehicleMakeModel,
		searchVehicleLicensePlate,
	]);

	const fetchData = async () => {
		const supabase = createClient();

		// Fetch drivers data
		const { data: driversData, error: driversError } = await supabase
			.from("driver")
			.select("*")
			.ilike("name", `%${searchDriverName}%`)
			.ilike("driverphone", `%${searchDriverPhone}%`);

		if (driversError) {
			console.error("Error fetching drivers:", driversError);
			return;
		}

		// Fetch vehicles data
		const { data: vehiclesData, error: vehiclesError } = await supabase
			.from("vehicle")
			.select("*")
			.ilike("makeandmodel", `%${searchVehicleMakeModel}%`)
			.ilike("licenseplate", `%${searchVehicleLicensePlate}%`);

		if (vehiclesError) {
			console.error("Error fetching vehicles:", vehiclesError);
			return;
		}

		setDrivers(driversData || []);
		setVehicles(vehiclesData || []);
	};

	const handleShowMoreDrivers = () => {
		setShowMoreDrivers(!showMoreDrivers);
	};

	const handleShowMoreVehicles = () => {
		setShowMoreVehicles(!showMoreVehicles);
	};

	return (
		<div className="flex flex-col space-y-6 p-6">
			{/* Drivers Section */}
			<Card className="shadow-lg">
				<CardHeader>
					<CardTitle className="text-xl">Drivers</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex space-x-4 mb-4">
						<Input
							type="text"
							placeholder="Search by name"
							value={searchDriverName}
							onChange={(e) => setSearchDriverName(e.target.value)}
							className="flex-1"
						/>
						<Input
							type="text"
							placeholder="Search by phone number"
							value={searchDriverPhone}
							onChange={(e) => setSearchDriverPhone(e.target.value)}
							className="flex-1"
						/>
					</div>
					<Table>
						<TableRow>
							<TableHead>Driver ID</TableHead>
							<TableHead>Name</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Phone Number</TableHead>
							<TableHead>Location</TableHead>
							{/* To be implemented in future version */}
							{/* <TableHead>Work Hours Start</TableHead>
							<TableHead>Work Hours End</TableHead> */}
						</TableRow>
						<TableBody>
							{(showMoreDrivers ? drivers : drivers.slice(0, 10)).map(
								(driver) => (
									<TableRow key={driver.driverid}>
										<TableCell>{driver.driverid}</TableCell>
										<TableCell>{driver.name}</TableCell>
										<TableCell>{driver.drivermail}</TableCell>
										<TableCell>{driver.driverphone}</TableCell>
										<TableCell>{driver.location}</TableCell>
										{/* To be implemented in future version */}
										{/* <TableCell>{driver.work_hours_start}</TableCell>  
										<TableCell>{driver.work_hours_end}</TableCell> */}
									</TableRow>
								)
							)}
						</TableBody>
					</Table>
					{drivers.length > 10 && (
						<Button
							onClick={handleShowMoreDrivers}
							className="mt-4 w-full bg-blue-500 hover:bg-blue-600"
						>
							{showMoreDrivers ? "Show Less" : "Show More"}
						</Button>
					)}
				</CardContent>
			</Card>

			{/* Vehicles Section */}
			<Card className="shadow-lg">
				<CardHeader>
					<CardTitle className="text-xl">Vehicles</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex space-x-4 mb-4">
						<Input
							type="text"
							placeholder="Search by make and model"
							value={searchVehicleMakeModel}
							onChange={(e) => setSearchVehicleMakeModel(e.target.value)}
							className="mb-4"
						/>
						<Input
							type="text"
							placeholder="Search by license plate"
							value={searchVehicleLicensePlate}
							onChange={(e) => setSearchVehicleLicensePlate(e.target.value)}
							className="mb-4"
						/>
					</div>
					<Table>
						<TableRow>
							<TableHead>Vehicle ID</TableHead>
							<TableHead>Make & Model</TableHead>
							<TableHead>License Plate</TableHead>
						</TableRow>
						<TableBody>
							{(showMoreVehicles ? vehicles : vehicles.slice(0, 10)).map(
								(vehicle) => (
									<TableRow key={vehicle.vehicleid}>
										<TableCell>{vehicle.vehicleid}</TableCell>
										<TableCell>{vehicle.makeandmodel}</TableCell>
										<TableCell>{vehicle.licenseplate}</TableCell>
									</TableRow>
								)
							)}
						</TableBody>
					</Table>
					{vehicles.length > 10 && (
						<Button
							onClick={handleShowMoreVehicles}
							className="mt-4 w-full bg-blue-500 hover:bg-blue-600"
						>
							{showMoreVehicles ? "Show Less" : "Show More"}
						</Button>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
