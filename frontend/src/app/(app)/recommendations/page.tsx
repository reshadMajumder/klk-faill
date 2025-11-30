"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { recommendResources, RecommendResourcesInput } from "@/ai/flows/recommend-relevant-resources";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles } from "lucide-react";

const formSchema = z.object({
  academicHistory: z.string().min(10, "Please provide more details about your academic history."),
  enrolledContributions: z.string().min(5, "Please list at least one contribution or topic."),
  learningNeeds: z.string().min(10, "Please describe your learning needs in more detail."),
});

export default function RecommendationsPage() {
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      academicHistory: "",
      enrolledContributions: "",
      learningNeeds: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setRecommendation(null);
    try {
      const result = await recommendResources(values as RecommendResourcesInput);
      setRecommendation(result.recommendedResources);
    } catch (error) {
      console.error("Failed to get recommendations:", error);
      // Here you would typically show a toast notification
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto">
      <PageHeader 
        title="AI Resource Recommender"
        description="Let our AI help you find the perfect study materials for your needs."
      />
      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardHeader>
                <CardTitle>Tell Us About Yourself</CardTitle>
                <CardDescription>The more details you provide, the better the recommendations will be.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="academicHistory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Academic History</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g., 'Completed Calculus I with a B, currently struggling with Physics II.'" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="enrolledContributions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Enrolled Contributions or Topics</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g., 'Data Structures & Algorithms, Organic Chemistry.'" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="learningNeeds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specific Learning Needs</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g., 'I need more practice problems for electromagnetism. I prefer video explanations.'" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Get Recommendations"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
        
        <div className="space-y-4">
          <Card className="min-h-[300px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent" />
                Your Recommended Resources
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center">
              {isLoading && (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <p>Analyzing your needs...</p>
                </div>
              )}
              {!isLoading && !recommendation && (
                <p className="text-muted-foreground text-center">Your personalized recommendations will appear here.</p>
              )}
              {recommendation && (
                <div className="prose prose-sm dark:prose-invert max-w-none text-foreground whitespace-pre-wrap">
                  {recommendation}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
