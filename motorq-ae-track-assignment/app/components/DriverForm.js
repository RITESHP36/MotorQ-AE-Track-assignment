"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

export default function DriverForm() {
    const [driverid, setDriverid] = useState("");
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [location, setLocation] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		const supabase = createClient();
		const { data, error } = await supabase
			.from("driver")
			.insert([{ driverid, name, driveremail: email, driverphone: phone, location }]);
		if (error) console.error("Error inserting driver:", error);
		else {
			console.log("Driver inserted successfully:", data);
			// Reset form fields
            setDriverid("");
			setName("");
			setEmail("");
			setPhone("");
			setLocation("");
		}
	};

	return (
		<Card className="max-w-md mx-auto mt-10 p-6 shadow-lg">
			<CardHeader>
				<CardTitle>Add New Driver</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<Input
							type="text"
							value={driverid}
							onChange={(e) => setDriverid(e.target.value)}
							placeholder="Driver ID"
							required
							className="w-full"
						/>
					</div>
					<div>
						<Input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="Name"
							required
							className="w-full"
						/>
					</div>
					<div>
						<Input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="Email"
							required
							className="w-full"
						/>
					</div>
					<div>
						<Input
							type="tel"
							value={phone}
							onChange={(e) => setPhone(e.target.value)}
							placeholder="Phone"
							required
							className="w-full"
						/>
					</div>
					<div>
						<Input
							type="text"
							value={location}
							onChange={(e) => setLocation(e.target.value)}
							placeholder="Location"
							required
							className="w-full"
						/>
					</div>
					<Button type="submit" className="w-full mt-4">
						Add Driver
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
