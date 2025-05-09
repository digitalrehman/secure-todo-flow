
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import { sendPhoneVerification, verifyPhoneNumber } from "../../store/authSlice";

// Define the form schema
const phoneSchema = z.object({
  phoneNumber: z
    .string()
    .min(10, { message: "Phone number must be at least 10 digits" })
    .regex(/^[0-9+\-\s]+$/, { message: "Please enter a valid phone number" }),
});

const verifySchema = z.object({
  code: z
    .string()
    .length(6, { message: "Verification code must be 6 digits" })
    .regex(/^[0-9]+$/, { message: "Verification code must contain only numbers" }),
});

type PhoneFormValues = z.infer<typeof phoneSchema>;
type VerifyFormValues = z.infer<typeof verifySchema>;

const PhoneVerification = () => {
  const dispatch = useAppDispatch();
  const { user, loading, error, verificationSent } = useAppSelector((state) => state.auth);
  const [stage, setStage] = useState<'phone' | 'verify'>(user?.phoneNumber ? 'verify' : 'phone');
  const [verificationCode, setVerificationCode] = useState<string | null>(null);

  // Initialize phone form
  const phoneForm = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phoneNumber: user?.phoneNumber || "",
    },
  });

  // Initialize verification form
  const verifyForm = useForm<VerifyFormValues>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      code: "",
    },
  });

  const onPhoneSubmit = async (values: PhoneFormValues) => {
    try {
      const resultAction = await dispatch(
        sendPhoneVerification({ phoneNumber: values.phoneNumber, userId: user?.id })
      );
      
      if (sendPhoneVerification.fulfilled.match(resultAction)) {
        setStage('verify');
        // For demo purposes, store the code to show on the UI
        setVerificationCode(resultAction.payload as string);
      }
    } catch (error) {
      console.error("Failed to send verification", error);
    }
  };

  const onVerifySubmit = async (values: VerifyFormValues) => {
    await dispatch(
      verifyPhoneNumber({
        phoneNumber: user?.phoneNumber,
        code: values.code,
        userId: user?.id,
      })
    );
  };

  const handleResend = async () => {
    if (user?.phoneNumber) {
      try {
        const resultAction = await dispatch(
          sendPhoneVerification({ phoneNumber: user.phoneNumber, userId: user.id })
        );
        
        if (sendPhoneVerification.fulfilled.match(resultAction)) {
          // For demo purposes, store the code to show on the UI
          setVerificationCode(resultAction.payload as string);
        }
      } catch (error) {
        console.error("Failed to resend verification", error);
      }
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Phone Verification</CardTitle>
        <CardDescription>
          {user?.isPhoneVerified 
            ? "Your phone is verified" 
            : "Verify your phone number for enhanced security"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {user?.isPhoneVerified ? (
          <div className="bg-green-50 p-4 rounded-md border border-green-200">
            <p className="text-green-700">
              ✓ Your phone number ({user.phoneNumber}) is verified.
            </p>
          </div>
        ) : stage === 'phone' ? (
          <Form {...phoneForm}>
            <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
              <FormField
                control={phoneForm.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. +1 555 123 4567"
                        {...field}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <div className="bg-red-50 p-3 rounded-md border border-red-200 text-red-800 text-sm">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send Verification Code"}
              </Button>
            </form>
          </Form>
        ) : (
          <div className="space-y-4">
            {verificationCode && (
              <div className="bg-blue-50 p-3 rounded-md border border-blue-200 text-blue-800 text-sm mb-4">
                <p className="font-semibold">Demo Mode:</p>
                <p>Your verification code is: {verificationCode}</p>
                <p className="text-xs mt-1">(In production, this would be sent via SMS)</p>
              </div>
            )}

            <Form {...verifyForm}>
              <form onSubmit={verifyForm.handleSubmit(onVerifySubmit)} className="space-y-4">
                <FormField
                  control={verifyForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Verification Code</FormLabel>
                      <FormControl>
                        <div className="flex justify-center">
                          <InputOTP maxLength={6} {...field}>
                            <InputOTPGroup>
                              <InputOTPSlot index={0} />
                              <InputOTPSlot index={1} />
                              <InputOTPSlot index={2} />
                              <InputOTPSlot index={3} />
                              <InputOTPSlot index={4} />
                              <InputOTPSlot index={5} />
                            </InputOTPGroup>
                          </InputOTP>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {error && (
                  <div className="bg-red-50 p-3 rounded-md border border-red-200 text-red-800 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Verifying..." : "Verify Phone"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={handleResend}
                    disabled={loading}
                  >
                    Resend Code
                  </Button>
                  {user?.phoneNumber ? null : (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      className="w-full"
                      onClick={() => setStage('phone')}
                      disabled={loading}
                    >
                      Change Phone Number
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PhoneVerification;
