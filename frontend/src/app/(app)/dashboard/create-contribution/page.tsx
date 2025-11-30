
import { CreateContributionForm } from "@/components/dashboard/create-contribution-form";
import { PageHeader } from "@/components/page-header";

export default function CreateContributionPage() {
    return (
        <div className="container mx-auto">
            <PageHeader 
                title="Create a New Contribution" 
                description="Fill out the details below to share your knowledge with the community." 
            />
            <CreateContributionForm />
        </div>
    )
}
