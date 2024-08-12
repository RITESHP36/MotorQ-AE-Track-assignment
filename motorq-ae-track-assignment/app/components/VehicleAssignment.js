"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { v4 as uuidv4 } from 'uuid';

export default function VehicleAssignment() {
    const [drivers, setDrivers] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [selectedDrivers, setSelectedDrivers] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

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

    const handleDriverSelection = (driverId) => {
        setSelectedDrivers((prev) =>
            prev.includes(driverId)
                ? prev.filter((id) => id !== driverId)
                : [...prev, driverId]
        );
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
            .in("driver_id", selectedDrivers)
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
        const assignments = selectedDrivers.map((driverId) => ({
            vehicle_id: selectedVehicle,
            driver_id: driverId,
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
        setSelectedVehicle("");
        setStartTime("");
        setEndTime("");
    };

    return (
        <div>
            <h2>Create Vehicle Assignment</h2>
            <div>
                <h3>Select Drivers:</h3>
                {drivers.map((driver) => (
                    <div key={driver.driverid}>
                        <label>
                            <input
                                type="checkbox"
                                checked={selectedDrivers.includes(driver.driverid)}
                                onChange={() => handleDriverSelection(driver.driverid)}
                            />
                            {driver.name}
                        </label>
                    </div>
                ))}
            </div>
            <div>
                <label>Select a vehicle:</label>
                <select
                    value={selectedVehicle}
                    onChange={(e) => setSelectedVehicle(e.target.value)}
                >
                    <option value="">Select a vehicle</option>
                    {vehicles.map((vehicle) => (
                        <option key={vehicle.vehicleid} value={vehicle.vehicleid}>
                            {vehicle.makeandmodel} - {vehicle.licenseplate}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label>Start Time:</label>
                <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                />
            </div>
            <div>
                <label>End Time:</label>
                <input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                />
            </div>
            <button onClick={handleAssignment}>Create Assignment</button>
        </div>
    );
}