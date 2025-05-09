
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import EmailVerification from "../components/auth/EmailVerification";
import PhoneVerification from "../components/auth/PhoneVerification";
import { useAppSelector } from "../store/hooks";
import RequireAuth from "../components/auth/RequireAuth";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  return (
    <RequireAuth>
      <Layout>
        <div className="container max-w-4xl mx-auto py-8 px-4 md:px-0">
          <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Name</h3>
                  <p className="mt-1 text-lg">{user?.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <div className="mt-1 flex items-center">
                    <p className="text-lg">{user?.email}</p>
                    {user?.isEmailVerified && (
                      <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Verified</span>
                    )}
                  </div>
                </div>
                {user?.phoneNumber && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                    <div className="mt-1 flex items-center">
                      <p className="text-lg">{user.phoneNumber}</p>
                      {user.isPhoneVerified && (
                        <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Verified</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email">Email Verification</TabsTrigger>
              <TabsTrigger value="phone">Phone Verification</TabsTrigger>
            </TabsList>
            <TabsContent value="email">
              <EmailVerification />
            </TabsContent>
            <TabsContent value="phone">
              <PhoneVerification />
            </TabsContent>
          </Tabs>
        </div>
      </Layout>
    </RequireAuth>
  );
};

export default ProfilePage;
