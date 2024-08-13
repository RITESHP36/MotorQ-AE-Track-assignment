"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { format } from 'date-fns'; // Import format from date-fns

// Helper function to format datetime
const formatDateTime = (dateTime) => {
    var localDate = new Date(dateTime);
    return format(localDate, "dd/MM/yyyy, hh:mm a");
};

export default function DriverDashboard() {
    const [requests, setRequests] = useState([]);
    const [previousAssignments, setPreviousAssignments] = useState([]);
    const [driverId, setDriverId] = useState("");
    const [driverName, setDriverName] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [filterStatus, setFilterStatus] = useState("all");

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
        fetchPreviousAssignments();
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

    const fetchPreviousAssignments = async () => {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("assignment")
            .select("*")
            .eq("driver_id", driverId)
            .order("start_time", { ascending: false });

        if (error) console.error("Error fetching previous assignments:", error);
        else setPreviousAssignments(data);
    };

    const handleResponse = async (assignmentId, status) => {
        const supabase = createClient();

        // Check if the assignment is still pending
        const { data: assignmentData, error: assignmentError } = await supabase
            .from("assignment")
            .select("*")
            .eq("assignmentid", assignmentId);

        if (assignmentError) {
            console.error("Error fetching assignment:", assignmentError);
            return;
        }

        // Check all the assignment status for all assignments with the same id
        const isPending = assignmentData.every((assignment) => assignment.status === "pending");

        if (!isPending) {
            alert("This assignment is no longer pending");
            fetchRequests();
            return;
        }

        const { error } = await supabase
            .from("assignment")
            .update({ status })
            .eq("assignmentid", assignmentId)
            .eq("driver_id", driverId);

        if (error) {
            console.error("Error updating assignment:", error);
            return;
        }

        if (status === "accepted") {
            // Reject all other pending assignments for this assignmentid
            await supabase
                .from("assignment")
                .update({ status: "claimed" })
                .eq("assignmentid", assignmentId)
                .neq("driver_id", driverId);
        }

        fetchRequests();
        fetchPreviousAssignments();
    };

    const filteredAssignments = previousAssignments.filter(assignment => {
        if (filterStatus === "all") return true;
        return assignment.status === filterStatus;
    });

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
            <Card className="w-full max-w-lg shadow-lg">
                <CardHeader>
                    <CardTitle className="text-center text-2xl">
                        {isLoggedIn ? `Welcome, ${driverName}` : "Driver Login"}
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
                            <div className="flex items-center space-x-4">
                                <img
                                    src="https://beforeigosolutions.com/wp-content/uploads/2021/12/dummy-profile-pic-300x300-1.png" // Replace with actual profile picture URL
                                    alt="Profile"
                                    className="w-16 h-16 rounded-full"
                                />
                                <div>
                                    <p className="text-lg font-semibold">{driverName}</p>
                                    <p className="text-sm text-gray-600">Phone: DriverPhone</p>
                                    <p className="text-sm text-gray-600">Email: DriverEmail</p>
                                </div>
                            </div>
                            <h4 className="text-lg font-medium">Your Pending Assignments:</h4>
                            {requests.length > 0 ? (
                                requests.map((request) => (
                                    <Card key={request.assignmentid} className="bg-white shadow-md p-4">
                                        <p className="text-sm text-gray-700">Vehicle: {request.vehicle_id}</p>
                                        <p className="text-sm text-gray-700">Start: {formatDateTime(request.start_time)}</p>
                                        <p className="text-sm text-gray-700">End: {formatDateTime(request.end_time)}</p>
                                        <div className="flex space-x-4 mt-4">
                                            <Button
                                                onClick={() => handleResponse(request.assignmentid, "accepted")}
                                                className="bg-green-500 hover:bg-green-600"
                                            >
                                                Accept
                                            </Button>
                                            <Button
                                                onClick={() => handleResponse(request.assignmentid, "rejected")}
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

                            <div className="space-y-6 mt-6">
                                <h4 className="text-lg font-medium">Previous Assignments:</h4>
                                <div className="mb-4">
                                    <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700">
                                        Filter by Status:
                                    </label>
                                    <select
                                        id="statusFilter"
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="w-full mt-1 border border-gray-300 rounded-md"
                                    >
                                        <option value="all">All</option>
                                        <option value="accepted">Accepted</option>
                                        <option value="rejected">Rejected</option>
                                        <option value="completed">Completed</option>
                                        <option value="claimed">Claimed</option>
                                    </select>
                                </div>
                                {filteredAssignments.length > 0 ? (
                                    filteredAssignments.map((assignment) => (
                                        <Card key={assignment.assignmentid} className="bg-white shadow-md p-4">
                                            <p className="text-sm text-gray-700">Vehicle: {assignment.vehicle_id}</p>
                                            <p className="text-sm text-gray-700">Start: {formatDateTime(assignment.start_time)}</p>
                                            <p className="text-sm text-gray-700">End: {formatDateTime(assignment.end_time)}</p>
                                            <p className="text-sm text-gray-700">Status: {assignment.status}</p>
                                        </Card>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-700">No previous assignments.</p>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
