
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import Layout from "../components/layout/Layout";
import { useAppSelector } from "../store/hooks";
import { Check, Lock, Shield, List } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector(state => state.auth);

  const features = [
    {
      icon: <Lock className="h-8 w-8 text-primary" />,
      title: "Secure Authentication",
      description: "Your data is protected with JWT authentication and secure cookie storage."
    },
    {
      icon: <List className="h-8 w-8 text-primary" />,
      title: "Task Management",
      description: "Create, organize, and track your todos with priority levels and due dates."
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Data Security",
      description: "Rest easy knowing your personal information and tasks are encrypted."
    },
  ];

  return (
    <Layout>
      <div className="py-12">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-6">
            Secure Task Management <span className="text-primary">Made Simple</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Keep track of your tasks with enhanced security features.
            Your data is encrypted, protected, and accessible only to you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Button size="lg" onClick={() => navigate("/todos")}>
                View My Tasks
              </Button>
            ) : (
              <>
                <Button size="lg" onClick={() => navigate("/register")}>
                  Get Started
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/login")}>
                  Log In
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose SecureTodo?</h2>
            <p className="mt-4 text-lg text-gray-600">
              Our platform offers the perfect balance of security and usability
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-medium text-gray-900 text-center mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-center">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-primary rounded-2xl mt-20 py-12 px-6 max-w-5xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to get organized securely?
            </h2>
            <p className="text-lg text-primary-foreground opacity-90 mb-8 max-w-2xl mx-auto">
              Join thousands of users who trust SecureTodo with their task management needs.
              Your data stays private, secure, and accessible.
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate(isAuthenticated ? "/todos" : "/register")}
            >
              {isAuthenticated ? "Go to My Tasks" : "Sign Up for Free"}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
