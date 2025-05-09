
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { sendVerificationEmail, verifyEmail } from "../../store/authSlice";

// Define the form schema
const verifySchema = z.object({
  token: z.string().min(1, { message: "Verification token is required" }),
});

type VerifyFormValues = z.infer<typeof verifySchema>;

const EmailVerification = () => {
  const dispatch = useAppDispatch();
  const { user, loading, error, verificationSent } = useAppSelector((state) => state.auth);
  const [mode, setMode] = useState<'verify' | 'send'>('verify');

  // Initialize verification form
  const verifyForm = useForm<VerifyFormValues>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      token: "",
    },
  });

  const onVerifySubmit = async (values: VerifyFormValues) => {
    await dispatch(verifyEmail({ token: values.token }));
  };

  const onSendVerification = async () => {
    if (user?.email) {
      await dispatch(sendVerificationEmail(user.email));
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Email Verification</CardTitle>
        <CardDescription>
          {user?.isEmailVerified 
            ? "Your email is verified" 
            : "Verify your email address to secure your account"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {user?.isEmailVerified ? (
          <div className="bg-green-50 p-4 rounded-md border border-green-200">
            <p className="text-green-700">
              ✓ Your email address ({user.email}) is verified.
            </p>
          </div>
        ) : (
          <>
            <div className="flex gap-2 mb-6">
              <Button
                type="button"
                variant={mode === 'verify' ? "default" : "outline"}
                onClick={() => setMode('verify')}
              >
                Enter Verification Code
              </Button>
              <Button
                type="button"
                variant={mode === 'send' ? "default" : "outline"}
                onClick={() => setMode('send')}
              >
                Resend Verification
              </Button>
            </div>

            {mode === 'verify' ? (
              <Form {...verifyForm}>
                <form onSubmit={verifyForm.handleSubmit(onVerifySubmit)} className="space-y-4">
                  <FormField
                    control={verifyForm.control}
                    name="token"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Verification Token</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter the token sent to your email"
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
                    {loading ? "Verifying..." : "Verify Email"}
                  </Button>
                </form>
              </Form>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  We'll send a verification link to your email address: {user?.email}
                </p>

                {verificationSent && (
                  <div className="bg-green-50 p-3 rounded-md border border-green-200 text-green-800 text-sm">
                    Verification email sent! Check your inbox.
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 p-3 rounded-md border border-red-200 text-red-800 text-sm">
                    {error}
                  </div>
                )}

                <Button 
                  onClick={onSendVerification} 
                  className="w-full"
                  disabled={loading || verificationSent}
                >
                  {loading ? "Sending..." : "Send Verification Email"}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default EmailVerification;
