
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { useToast } from "../ui/use-toast";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { registerUser } from "../../store/authSlice";
import GoogleSignIn from "./GoogleSignIn";

// Define the form schema
const formSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string(),
    phoneNumber: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof formSchema>;

const RegisterForm = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [includePhone, setIncludePhone] = useState(false);

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    const { name, email, password, phoneNumber } = values;
    
    try {
      await dispatch(registerUser({ name, email, password, phoneNumber })).unwrap();
      navigate("/todos");
    } catch (error) {
      // Error is already handled by the async thunk
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
        <CardDescription className="text-center">
          Sign up to start managing your todos securely
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <GoogleSignIn text="Sign up with Google" />
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or sign up with email
            </span>
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="John Doe" 
                      {...field} 
                      disabled={loading} 
                    />
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="you@example.com" 
                      type="email" 
                      {...field} 
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="••••••••"
                        type={showPassword ? "text" : "password"}
                        {...field}
                        disabled={loading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? "Hide" : "Show"}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="••••••••"
                      type={showPassword ? "text" : "password"}
                      {...field}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="include-phone"
                checked={includePhone}
                onChange={() => setIncludePhone(!includePhone)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="include-phone" className="text-sm text-gray-700">
                Add phone number for enhanced security
              </label>
            </div>

            {includePhone && (
              <FormField
                control={form.control}
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
                    <p className="text-sm text-gray-500">
                      You'll be able to verify your phone after registration
                    </p>
                  </FormItem>
                )}
              />
            )}

            {error && (
              <div className="bg-red-50 p-3 rounded-md border border-red-200 text-red-800 text-sm">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Register"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <Button variant="link" className="p-0" onClick={() => navigate("/login")}>
            Login here
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
};

export default RegisterForm;
