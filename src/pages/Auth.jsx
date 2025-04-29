import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, registerUser, clearError } from "@/store/slices/authSlice";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";

const registerSchema = z.object({
  username: z.string().min(3, "Username is too short"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const Auth = () => {
  const [tab, setTab] = useState("login");
  const [apiError, setApiError] = useState(null);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const dispatch = useDispatch();
  const { loading, error, userInfo } = useSelector((state) => state.auth);

  const navigate = useNavigate();

  useEffect(() => {
    dispatch(clearError());
    setApiError(null);
    setRegisterSuccess(false);
  }, [tab, dispatch]);

  useEffect(() => {
    if (userInfo) {
      navigate("/code-reviewer");
    }
  }, [userInfo, navigate]);

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    reset: resetLoginForm,
    formState: { errors: loginErrors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: registerRegister,
    handleSubmit: handleRegisterSubmit,
    reset: resetRegisterForm,
    formState: { errors: registerErrors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onLoginSubmit = async (data) => {
    try {
      await dispatch(loginUser(data)).unwrap();
      toast.success("Login successful!");
      resetLoginForm();
    } catch (error) {
      // Handle error if needed
      if (error) {
        toast.error(error.response?.data?.message || "Login failed");
      }
    }
  };

  const onRegisterSubmit = async (data) => {
    try {
      await dispatch(registerUser(data)).unwrap();
      toast.success("Registration successful!");
      setApiError(null);
      setRegisterSuccess(true);
      setIsRegistering(true);
      resetRegisterForm();
      setTimeout(() => {
        setRegisterSuccess(false);
        setIsRegistering(false);
        setTab("login");
      }, 2000); // Redirect to login tab after 2 seconds
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Registration failed");
        setApiError(error.response?.data?.message || "Registration failed");
      } else {
        setApiError("An unexpected error occurred");
      }
      setRegisterSuccess(false);
      setIsRegistering(false);
      setTimeout(() => {
        setApiError(null);
      }, 2000); // Clear error message after 2 seconds
    }
  };

  const renderErrorAlert = (message) => (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );

  const renderSuccessAlert = () => (
    <Alert variant="success" className="mb-4">
      <CheckCircle className="h-4 w-4" />
      <AlertTitle>Success!</AlertTitle>
      <AlertDescription>
        Registration successful! Redirecting to login...
      </AlertDescription>
    </Alert>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-400">
      <div className="w-96 space-y-8">
        <Tabs defaultValue="login" value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form
              onSubmit={handleLoginSubmit(onLoginSubmit)}
              className="space-y-6"
            >
              {error && renderErrorAlert(error)}
              <div className="space-y-2">
                <Input placeholder="Email" {...registerLogin("email")} />
                {loginErrors.email && (
                  <p className="text-sm text-red-500">
                    {loginErrors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Password"
                  {...registerLogin("password")}
                />
                {loginErrors.password && (
                  <p className="text-sm text-red-500">
                    {loginErrors.password.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form
              onSubmit={handleRegisterSubmit(onRegisterSubmit)}
              className="space-y-6"
            >
              {registerSuccess && renderSuccessAlert()}
              {apiError && renderErrorAlert(apiError)}

              <div className="space-y-2">
                <Input
                  placeholder="Username"
                  {...registerRegister("username")}
                />
                {registerErrors.username && (
                  <p className="text-sm text-red-500">
                    {registerErrors.username.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Input placeholder="Email" {...registerRegister("email")} />
                {registerErrors.email && (
                  <p className="text-sm text-red-500">
                    {registerErrors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Password"
                  {...registerRegister("password")}
                />
                {registerErrors.password && (
                  <p className="text-sm text-red-500">
                    {registerErrors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isRegistering || registerSuccess}
              >
                {isRegistering
                  ? "Registering..."
                  : registerSuccess
                  ? "Success!"
                  : "Register"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
