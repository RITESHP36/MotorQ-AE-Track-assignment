"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function DriverAssignmentRequests() {
	const [requests, setRequests] = useState([]);
	const [driverId, setDriverId] = useState("");
	const [driverName, setDriverName] = useState("");
	const [isLoggedIn, setIsLoggedIn] = useState(false);

	const handleLogin = async () => {
		if (!driverId || !driverName) {
			alert("Please enter both Driver ID and Name");
			return;
		}

		const supabase = createClient();
		const { data, error } = await supabase
			.from("driver")
			.select("*")
			.eq("driverid", driverId)
			.single();

		if (error || !data) {
			alert("Invalid Driver ID or Name");
			return;
		}

		if (data.name.toLowerCase() !== driverName.toLowerCase()) {
			alert("Driver Name does not match");
			return;
		}

		setIsLoggedIn(true);
		fetchRequests();
	};

	const fetchRequests = async () => {
		const supabase = createClient();
		const { data, error } = await supabase
			.from("assignment")
			.select("*")
			.eq("driver_id", driverId)
			.eq("status", "pending")
			.order("start_time", { ascending: true });

		if (error) console.error("Error fetching requests:", error);
		else setRequests(data);
	};

	const handleResponse = async (assignmentId, status) => {
		const supabase = createClient();
		const { error } = await supabase
			.from("assignment")
			.update({ status })
			.eq("id", assignmentId)
			.eq("driver_id", driverId);

		if (error) {
			console.error("Error updating assignment:", error);
			return;
		}

		if (status === "accepted") {
			// Reject all other pending assignments for this driver
			await supabase
				.from("assignment")
				.update({ status: "claimed" })
				.eq("driver_id", driverId)
				.eq("status", "pending")
				.neq("id", assignmentId);
		}

		fetchRequests();
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
			<Card className="w-full max-w-lg shadow-lg">
				<CardHeader>
					<CardTitle className="text-center text-2xl">
						{!isLoggedIn ? "Driver Login" : `Welcome, ${driverName}`}
					</CardTitle>
				</CardHeader>
				<CardContent>
					{!isLoggedIn ? (
						<div className="space-y-4">
							<div>
								<Label htmlFor="driverId" className="block text-sm font-medium text-gray-700">
									Driver ID
								</Label>
								<Input
									id="driverId"
									type="text"
									placeholder="Enter your Driver ID"
									value={driverId}
									onChange={(e) => setDriverId(e.target.value)}
									className="w-full mt-1"
								/>
							</div>
							<div>
								<Label htmlFor="driverName" className="block text-sm font-medium text-gray-700">
									Driver Name
								</Label>
								<Input
									id="driverName"
									type="text"
									placeholder="Enter your Name"
									value={driverName}
									onChange={(e) => setDriverName(e.target.value)}
									className="w-full mt-1"
								/>
							</div>
							<Button
								onClick={handleLogin}
								className="w-full bg-blue-500 hover:bg-blue-600"
							>
								Login
							</Button>
						</div>
					) : (
						<div className="space-y-6">
							<h4 className="text-lg font-medium">Your Pending Assignments:</h4>
							{requests.length > 0 ? (
								requests.map((request) => (
									<Card key={request.id} className="bg-white shadow-md p-4">
										<p className="text-sm text-gray-700">Vehicle: {request.vehicle_id}</p>
										<p className="text-sm text-gray-700">Start: {request.start_time}</p>
										<p className="text-sm text-gray-700">End: {request.end_time}</p>
										<div className="flex space-x-4 mt-4">
											<Button
												onClick={() => handleResponse(request.id, "accepted")}
												className="bg-green-500 hover:bg-green-600"
											>
												Accept
											</Button>
											<Button
												onClick={() => handleResponse(request.id, "rejected")}
												className="bg-red-500 hover:bg-red-600"
											>
												Reject
											</Button>
										</div>
									</Card>
								))
							) : (
								<p className="text-sm text-gray-700">No pending assignments.</p>
							)}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
