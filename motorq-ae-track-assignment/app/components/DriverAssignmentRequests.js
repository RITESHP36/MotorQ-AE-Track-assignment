"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

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
				.update({ status: "rejected" })
				.eq("driver_id", driverId)
				.eq("status", "pending")
				.neq("id", assignmentId);
		}

		fetchRequests();
	};

	return (
		<div>
			<h2>Driver Assignment Requests</h2>
			{!isLoggedIn ? (
				<div>
					<input
						type="text"
						placeholder="Driver ID"
						value={driverId}
						onChange={(e) => setDriverId(e.target.value)}
					/>
					<input
						type="text"
						placeholder="Driver Name"
						value={driverName}
						onChange={(e) => setDriverName(e.target.value)}
					/>
					<button onClick={handleLogin}>Login</button>
				</div>
			) : (
				<div>
					<h3>Welcome, {driverName}</h3>
					<h4>Your Pending Assignments:</h4>
					{requests.map((request) => (
						<div key={request.id}>
							<p>Vehicle: {request.vehicle_id}</p>
							<p>Start: {request.start_time}</p>
							<p>End: {request.end_time}</p>
							<button onClick={() => handleResponse(request.id, "accepted")}>
								Accept
							</button>
							<button onClick={() => handleResponse(request.id, "rejected")}>
								Reject
							</button>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
