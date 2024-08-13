"use client"
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import DashboardPage from "../components/Dashboard";

export default function AdminPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(true); // Change this to true to skip login
    const [error, setError] = useState("");

    const handleLogin = () => {
        if (username === "admin" && password === "admin123") {
            setIsLoggedIn(true);
        } else {
            setError("Invalid username or password");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            {isLoggedIn ? (
                <DashboardPage />
            ) : (
                <Card className="w-full max-w-sm">
                    <CardHeader>
                        <CardTitle className="text-center text-xl">Admin Login</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="mt-1"
                                placeholder="Enter your username"
                            />
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1"
                                placeholder="Enter your password"
                            />
                        </div>
                        {error && (
                            <Alert className="mb-4" type="error">
                                {error}
                            </Alert>
                        )}
                        <Button onClick={handleLogin} className="w-full bg-blue-600 text-white">
                            Login
                        </Button>
                        <div className="mt-4 text-sm text-center text-gray-600">
                            Use <strong>admin</strong> as username and <strong>admin123</strong> as password.
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
