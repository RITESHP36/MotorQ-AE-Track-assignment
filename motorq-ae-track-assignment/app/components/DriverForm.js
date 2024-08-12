"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

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
			.insert([{driverid, name, driveremail: email, driverphone: phone, location }]);
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
		<form onSubmit={handleSubmit}>
            <input
                type="text"
                value={driverid}
                onChange={(e) => setDriverid(e.target.value)}
                placeholder="Driver ID"
                required
            />
			<input
				type="text"
				value={name}
				onChange={(e) => setName(e.target.value)}
				placeholder="Name"
				required
			/>
			<input
				type="email"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				placeholder="Email"
				required
			/>
			<input
				type="tel"
				value={phone}
				onChange={(e) => setPhone(e.target.value)}
				placeholder="Phone"
				required
			/>
			<input
				type="text"
				value={location}
				onChange={(e) => setLocation(e.target.value)}
				placeholder="Location"
				required
			/>
			<button type="submit">Add Driver</button>
		</form>
	);
}
