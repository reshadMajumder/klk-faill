import { ContactForm } from "@/components/contact-form";
import { PageHeader } from "@/components/page-header";
import { Mail, Phone } from "lucide-react";
import { Suspense } from "react";

export default function ContactPage() {
    return (
        <div className="container mx-auto">
            <PageHeader
                title="Contact Us"
                description="Have a question or feedback? Fill out the form below to get in touch with us."
            />

            <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-8">
                    <div className="p-6 rounded-lg bg-muted border">
                        <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
                        <p className="text-muted-foreground mb-6">
                            For any inquiries, you can also reach us through the following channels. We typically respond within 24 hours.
                        </p>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Mail className="h-5 w-5 text-primary" />
                                <a href="mailto:hi@reshad.dev" className="hover:underline">hi@reshad.dev</a>
                            </div>
                            <div className="flex items-center gap-4">
                                <Phone className="h-5 w-5 text-primary" />
                                <span>+8801627076527</span>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 rounded-lg bg-muted border">
                        <h3 className="text-xl font-semibold mb-4">Our Office</h3>
                        <p className="text-muted-foreground mb-6">
                            Daffodil Smart City, Birulia 1216                        </p>
                        <div className="aspect-video rounded-md bg-gray-300 overflow-hidden">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d58373.739359028725!2d90.24394154863282!3d23.8768956!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b8ada2664e21%3A0x3c872fd17bc11ddb!2sDaffodil%20International%20University!5e0!3m2!1sen!2sbd!4v1764564224950!5m2!1sen!2sbd"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen={false}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>
                    </div>
                </div>

                <div>
                    <Suspense fallback={<div className="p-6 rounded-lg bg-muted border animate-pulse h-96"></div>}>
                        <ContactForm />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
