
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { sendContactMessage } from '@/lib/api';
import { useSearchParams } from 'next/navigation';

const subjectChoices = [
    { value: "general", label: "General Inquiry" },
    { value: "support", label: "Support" },
    { value: "business", label: "Business Inquiry" },
    { value: "feedback", label: "Feedback" },
    { value: "sponsor", label: "Sponsor" },
];

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Please select a subject'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormValues = z.infer<typeof formSchema>;

export function ContactForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const subjectParam = searchParams.get('subject');

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: subjectParam && subjectChoices.some(c => c.value === subjectParam) ? subjectParam : '',
      message: '',
    },
  });
  
  useEffect(() => {
    if (subjectParam && subjectChoices.some(c => c.value === subjectParam)) {
        form.setValue('subject', subjectParam);
    }
  }, [subjectParam, form]);

  async function onSubmit(values: ContactFormValues) {
    setIsLoading(true);
    try {
      await sendContactMessage(values);
      toast({
        title: 'Message Sent!',
        description: "Thank you for contacting us. We'll get back to you shortly.",
      });
      form.reset();
      // After reset, if the param is still in the url, re-apply it.
      if (subjectParam && subjectChoices.some(c => c.value === subjectParam)) {
        form.setValue('subject', subjectParam);
      }

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: error.message || 'An error occurred while sending your message.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send us a Message</CardTitle>
        <CardDescription>We'd love to hear from you!</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="grid gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john.doe@example.com" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subjectChoices.map((choice) => (
                        <SelectItem key={choice.value} value={choice.value}>
                          {choice.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Message</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Type your message here..." {...field} disabled={isLoading} rows={5} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Message
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
