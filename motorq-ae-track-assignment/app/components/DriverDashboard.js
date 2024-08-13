"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { RadialBar, RadialBarChart, PolarGrid, PolarRadiusAxis, Label } from "recharts";
import { ChartContainer } from "@/components/ui/chart";

const DriverDashboard = () => {
    const [driverId, setDriverId] = useState("");
    const [driverName, setDriverName] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [driver, setDriver] = useState(null);
    const [ongoingTask, setOngoingTask] = useState(null);
    const [previousTasks, setPreviousTasks] = useState([]);
    const [pendingTasks, setPendingTasks] = useState([]);
    const [taskFilter, setTaskFilter] = useState("all");

    useEffect(() => {
        if (isLoggedIn) {
            fetchDriverData();
            fetchTasks();
            fetchPendingTasks();
        }
    }, [isLoggedIn, taskFilter]);

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

        setDriver(data);
        setIsLoggedIn(true);
    };

    const fetchDriverData = async () => {
        if (!driverId) return;

        const supabase = createClient();
        // Fetch ongoing tasks
        const { data: tasksData, error } = await supabase
            .from("assignment")
            .select("*")
            .eq("driver_id", driverId)
            .eq("status", "ongoing");

        if (error) {
            console.error("Error fetching ongoing tasks:", error);
            return;
        }

        setOngoingTask(tasksData.length > 0 ? tasksData[0] : null);
    };

    const fetchTasks = async () => {
        if (!driverId) return;

        const supabase = createClient();
        // Fetch previous tasks
        const { data: tasksData, error } = await supabase
            .from("assignment")
            .select("*")
            .eq("driver_id", driverId)
            .or(`status.eq.${taskFilter},status.eq.${taskFilter}`)
            .order("start_time", { ascending: false });

        if (error) {
            console.error("Error fetching previous tasks:", error);
            return;
        }

        setPreviousTasks(tasksData);
    };

    const fetchPendingTasks = async () => {
        if (!driverId) return;

        const supabase = createClient();
        // Fetch pending tasks
        const { data: tasksData, error } = await supabase
            .from("assignment")
            .select("*")
            .eq("driver_id", driverId)
            .eq("status", "pending");

        if (error) {
            console.error("Error fetching pending tasks:", error);
            return;
        }

        setPendingTasks(tasksData);
    };

    const handleTaskAction = async (taskId, action) => {
        const supabase = createClient();
        const { data: currentTask, error: fetchError } = await supabase
            .from("assignment")
            .select("*")
            .eq("id", taskId)
            .single();

        if (fetchError || !currentTask) {
            console.error("Error fetching task:", fetchError);
            return;
        }

        // Update the status of the selected task
        const { error: updateError } = await supabase
            .from("assignment")
            .update({ status: action === 'accept' ? 'accepted' : 'rejected' })
            .eq("id", taskId);

        if (updateError) {
            console.error("Error updating task status:", updateError);
            return;
        }

        // Update other tasks with the same assignment_id
        const { error: updateOthersError } = await supabase
            .from("assignment")
            .update({ status: action === 'accept' ? 'claimed' : 'rejected' })
            .eq("assignment_id", currentTask.assignment_id)
            .neq("id", taskId);

        if (updateOthersError) {
            console.error("Error updating other tasks:", updateOthersError);
            return;
        }

        // Refresh the tasks data
        fetchTasks();
        fetchPendingTasks();
    };

    const renderPieChart = (remainingTime) => {
        const chartData = [
            {
                name: "Remaining Time",
                value: remainingTime,
                fill: "var(--color-remaining-time)",
            },
            {
                name: "Elapsed Time",
                value: 100 - remainingTime,
                fill: "var(--color-elapsed-time)",
            },
        ];

        const chartConfig = {
            remainingTime: {
                label: "Remaining Time",
                color: "hsl(var(--chart-remaining-time))",
            },
            elapsedTime: {
                label: "Elapsed Time",
                color: "hsl(var(--chart-elapsed-time))",
            },
        };

        return (
            <Card className="flex flex-col">
                <CardHeader className="items-center pb-0">
                    <CardTitle>Task Progress</CardTitle>
                    <CardDescription>Time remaining for the task</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-0">
                    <ChartContainer
                        config={chartConfig}
                        className="mx-auto aspect-square max-h-[250px]"
                    >
                        <RadialBarChart
                            data={chartData}
                            startAngle={0}
                            endAngle={360}
                            innerRadius={60}
                            outerRadius={100}
                        >
                            <PolarGrid
                                gridType="circle"
                                radialLines={false}
                                stroke="none"
                                className="first:fill-muted last:fill-background"
                                polarRadius={[66, 56]}
                            />
                            <RadialBar dataKey="value" background cornerRadius={10} />
                            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                                <Label
                                    content={({ viewBox }) => {
                                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                            return (
                                                <text
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                >
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={viewBox.cy}
                                                        className="fill-foreground text-4xl font-bold"
                                                    >
                                                        {remainingTime.toFixed(0)}%
                                                    </tspan>
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={(viewBox.cy || 0) + 24}
                                                        className="fill-muted-foreground"
                                                    >
                                                        Remaining
                                                    </tspan>
                                                </text>
                                            );
                                        }
                                    }}
                                />
                            </PolarRadiusAxis>
                        </RadialBarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
            {!isLoggedIn ? (
                <Card className="w-full max-w-lg shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-center text-2xl">Driver Login</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <Label
                                    htmlFor="driverId"
                                    className="block text-sm font-medium text-gray-700"
                                >
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
                                <Label
                                    htmlFor="driverName"
                                    className="block text-sm font-medium text-gray-700"
                                >
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
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium"
                            >
                                Login
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="w-full max-w-4xl">
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="text-xl">Driver Dashboard</CardTitle>
                            <CardDescription>
                                Welcome, {driver?.name || "Driver"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {ongoingTask ? (
                                <>
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-lg font-bold">Ongoing Task</h2>
                                        {renderPieChart(ongoingTask.remainingTime)}
                                    </div>
                                    <Table className="mt-4">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Task ID</TableCell>
                                                <TableCell>Assignment ID</TableCell>
                                                <TableCell>Status</TableCell>
                                                <TableCell>Start Time</TableCell>
                                                <TableCell>End Time</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell>{ongoingTask.id}</TableCell>
                                                <TableCell>{ongoingTask.assignment_id}</TableCell>
                                                <TableCell>{ongoingTask.status}</TableCell>
                                                <TableCell>{ongoingTask.start_time}</TableCell>
                                                <TableCell>{ongoingTask.end_time}</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </>
                            ) : (
                                <p>No ongoing tasks.</p>
                            )}
                        </CardContent>
                    </Card>
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="text-lg">Pending Tasks</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {pendingTasks.length > 0 ? (
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Task ID</TableCell>
                                            <TableCell>Assignment ID</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Start Time</TableCell>
                                            <TableCell>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {pendingTasks.map((task) => (
                                            <TableRow key={task.id}>
                                                <TableCell>{task.id}</TableCell>
                                                <TableCell>{task.assignment_id}</TableCell>
                                                <TableCell>{task.status}</TableCell>
                                                <TableCell>{task.start_time}</TableCell>
                                                <TableCell>
                                                    <Button
                                                        onClick={() => handleTaskAction(task.id, 'accept')}
                                                        className="mr-2 bg-green-500 hover:bg-green-600 text-white"
                                                    >
                                                        Accept
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleTaskAction(task.id, 'reject')}
                                                        className="bg-red-500 hover:bg-red-600 text-white"
                                                    >
                                                        Reject
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <p>No pending tasks.</p>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Previous Tasks</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between mb-4">
                                <p>Filter by status:</p>
                                <select
                                    value={taskFilter}
                                    onChange={(e) => setTaskFilter(e.target.value)}
                                    className="ml-2 border p-2 rounded"
                                >
                                    <option value="all">All</option>
                                    <option value="completed">Completed</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>
                            {previousTasks.length > 0 ? (
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Task ID</TableCell>
                                            <TableCell>Assignment ID</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Start Time</TableCell>
                                            <TableCell>End Time</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {previousTasks.map((task) => (
                                            <TableRow key={task.id}>
                                                <TableCell>{task.id}</TableCell>
                                                <TableCell>{task.assignment_id}</TableCell>
                                                <TableCell>{task.status}</TableCell>
                                                <TableCell>{task.start_time}</TableCell>
                                                <TableCell>{task.end_time}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <p>No previous tasks.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default DriverDashboard;
