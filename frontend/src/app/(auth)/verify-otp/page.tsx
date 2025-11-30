
"use client";

import { Suspense } from 'react';
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/api";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const OTPSchema = z.object({
  otp: z.string().min(4, "Your OTP must be at least 4 characters."),
});

function VerifyOTPForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const email = searchParams.get("email");

  const form = useForm<z.infer<typeof OTPSchema>>({
    resolver: zodResolver(OTPSchema),
    defaultValues: {
      otp: "",
    },
  });

  async function onSubmit(values: z.infer<typeof OTPSchema>) {
    if (!email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No email address found. Please try signing up again.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/accounts/verify-otp/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp: values.otp }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.detail || "Invalid OTP. Please try again.");
      }
      
      if (responseData.access && responseData.refresh) {
        localStorage.setItem('accessToken', responseData.access);
        localStorage.setItem('refreshToken', responseData.refresh);

        toast({
            title: "Success!",
            description: "Your account has been verified. Welcome!",
        });
        router.push("/dashboard");
        router.refresh();
      } else {
        throw new Error("Login failed. Please try again.");
      }

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <div className="flex flex-col space-y-2 text-center mb-6">
        <h1 className="text-2xl font-semibold tracking-tight font-headline">
          Verify Your Account
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter the 4-digit code sent to {email}
        </p>
      </div>
      <div className="grid gap-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>One-Time Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="_ _ _ _"
                      {...field}
                      className="text-center text-2xl tracking-[1.5rem]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify Account
            </Button>
          </form>
        </Form>
      </div>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Didn't receive a code?{" "}
        <Link
          href="#"
          className="underline underline-offset-4 hover:text-primary font-semibold"
        >
          Resend
        </Link>
      </p>
    </>
  );
}


export default function VerifyOTPPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyOTPForm />
        </Suspense>
    )
}
