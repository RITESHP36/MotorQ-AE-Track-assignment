"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

export function TypographyList() {
    return (
      <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
        <li>1st level of puns: 5 gold coins</li>
        <li>2nd level of jokes: 10 gold coins</li>
        <li>3rd level of one-liners : 20 gold coins</li>
      </ul>
    )
  }

export default function DriverSearch() {
	const [searchLocation, setSearchLocation] = useState("");
	const [searchResults, setSearchResults] = useState([]);

	const handleSearch = async () => {
		const supabase = createClient();
		const { data, error } = await supabase
			.from("driver")
			.select("*")
			.textSearch("location", searchLocation)
			.order("location");

		if (error) console.error("Error searching drivers:", error);
		else setSearchResults(data);
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
			<Card className="w-full max-w-xl shadow-lg">
				<CardHeader>
					<CardTitle className="text-center text-2xl">
						Search Drivers by Location
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col space-y-4">
						<Input
							type="text"
							value={searchLocation}
							onChange={(e) => setSearchLocation(e.target.value)}
							placeholder="Enter a location"
							className="w-full"
						/>
						<Button
							onClick={handleSearch}
							className="w-full bg-blue-500 hover:bg-blue-600"
						>
							Search
						</Button>
					</div>
				</CardContent>
			</Card>

			{searchResults.length > 0 && (
				<Card className="w-full max-w-xl mt-6 shadow-lg">
					<CardHeader>
						<CardTitle className="text-center text-xl">
							Search Results
						</CardTitle>
					</CardHeader>
					<CardContent>
						<TypographyList>
							{searchResults.map((driver) => (
								<li key={driver.id}>
									<span className="font-medium">{driver.name}</span> -{" "}
									<span className="text-gray-600">{driver.location}</span>
								</li>
							))}
						</TypographyList>
					</CardContent>
				</Card>
			)}

			{searchResults.length === 0 && searchLocation && (
				<div className="text-center mt-6 text-gray-600">
					No drivers found for the location &quot;{searchLocation}&quot;.
				</div>
			)}
		</div>
	);
}
