
import { MyEnrollments } from "@/components/dashboard/my-enrollments";
import { PageHeader } from "@/components/page-header";

export default function MyEnrollmentsPage() {
    return (
        <div className="container mx-auto">
            <PageHeader 
                title="My Enrollments" 
                description="Here are all the contributions you are currently enrolled in." 
            />
            <MyEnrollments />
        </div>
    )
}
