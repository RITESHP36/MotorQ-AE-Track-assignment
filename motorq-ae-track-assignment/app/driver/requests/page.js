import DriverDashboard from "../../components/DriverDashboard";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DriverRequestsPage() {
	return (
	<div className="bg-gray-100">
			<Link href="/" className="m-8">
				<Button className="mb-4" variant="default">
					Back to Home
				</Button>
			</Link>
			<DriverDashboard />
		</div>
	);
}
