import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
} from "@/components/ui/table";
import { format, utcToZonedTime } from "date-fns-tz";
import { Badge } from "@/components/ui/badge";

// Helper function to format datetime
const formatDateTime = (dateTime) => { // ISO-8601 formatted date returned from server
	var localDate = new Date(dateTime); // Indian format: 'DD/MM/YYYY, HH:mm AM/PM'
    return format(localDate, "dd/MM/yyyy, hh:mm a");
};

// Helper function to render status with colored dots
const renderStatus = (status) => {
	let color = "gray";
	switch (status.toLowerCase()) {
		case "pending":
			color = "yellow";
			break;
		case "rejected":
			color = "red";
			break;
		case "accepted":
			color = "blue";
			break;
		case "completed":
			color = "green";
			break;
		case "claimed":
			color = "white";
			break;
		default:
			color = "gray";
	}

	return (
		<Badge variant="dot" className={`bg-${color}-500`}>
			{status}
		</Badge>
	);
};

const AssignmentTable = ({ assignments }) => {
	return (
		<div className="w-full p-4 bg-gray-100 rounded-lg">
			<Card className="w-full shadow-lg">
				<CardHeader>
					<CardTitle className="text-center text-2xl">Assignments</CardTitle>
				</CardHeader>
				<CardContent>
					<Table className="w-full">
							<TableRow>
								<TableHead>Driver</TableHead>
								<TableHead>Vehicle</TableHead>
								<TableHead>Start Time</TableHead>
								<TableHead>End Time</TableHead>
								<TableHead>Status</TableHead>
							</TableRow>
						<TableBody>
							{assignments.map((assignment, index) => (
								<TableRow key={index}>
									<TableCell>{assignment.driver_id}</TableCell>
									<TableCell>{assignment.vehicle_id}</TableCell>
									<TableCell>{formatDateTime(assignment.start_time)}</TableCell>
									<TableCell>{formatDateTime(assignment.end_time)}</TableCell>
									<TableCell>{renderStatus(assignment.status)}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
};

export default AssignmentTable;
