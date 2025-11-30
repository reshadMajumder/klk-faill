
import { MyContributions } from "@/components/dashboard/my-contributions";
import { PageHeader } from "@/components/page-header";

export default function MyContributionsPage() {
    return (
        <div className="container mx-auto">
            <PageHeader 
                title="My Contributions" 
                description="Manage all the contributions you have created." 
            />
            <MyContributions />
        </div>
    )
}
