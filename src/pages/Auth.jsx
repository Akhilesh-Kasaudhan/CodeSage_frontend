import React, { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, registerUser, clearError } from "@/store/slices/authSlice";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";

//Schemas for validation
const registerSchema = z.object({
  username: z.string().min(3, "Username is too short"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const ErrorMessage = ({ message }) =>
  message ? <p className="text-sm text-red-500 mt-1">{message}</p> : null;

const Auth = () => {
  const [tab, setTab] = useState("login");
  const dispatch = useDispatch();
  const { error, userInfo, loading } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(clearError());
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

      resetLoginForm();
    } catch (err) {
      const msg =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : err?.message || "Login failed";
      toast.error(msg);
    }
  };

  const onRegisterSubmit = async (data) => {
    try {
      await dispatch(registerUser(data)).unwrap();

      resetRegisterForm();
      setTab("login");
    } catch (err) {
      const msg =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : err?.message || "Registration failed";
      toast.error(msg);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 p-4">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl space-y-8">
        <div className=" backdrop-blur-md rounded-lg  border-blue-400/50 shadow-xl shadow-gray-800  p-6 sm:p-8">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Welcome
            </h1>
            <p className="text-gray-900 text-md sm:text-base">
              Sign in to your account or create a new one
            </p>
          </div>

          <Tabs defaultValue="login" value={tab} onValueChange={setTab}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger
                value="login"
                className="text-sm sm:text-base bg-gray-200 hover:bg-gray-300 active:bg-gray-400 focus:outline-none"
              >
                Login
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="text-sm sm:text-base bg-gray-200 hover:bg-gray-300 active:bg-gray-400 focus:outline-none "
              >
                Register
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-6">
              <form
                onSubmit={handleLoginSubmit(onLoginSubmit)}
                className="space-y-4 sm:space-y-6"
              >
                <div className="space-y-2">
                  <Input
                    placeholder="Email"
                    className="h-11 sm:h-12 text-sm sm:text-base"
                    {...registerLogin("email")}
                  />
                  <ErrorMessage message={loginErrors.email?.message} />
                </div>

                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Password"
                    className="h-11 sm:h-12 text-sm sm:text-base"
                    {...registerLogin("password")}
                  />
                  <ErrorMessage message={loginErrors.password?.message} />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 sm:h-12 text-sm sm:text-base font-medium bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 hover:bg-gray-600 "
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="mt-6">
              <form
                onSubmit={handleRegisterSubmit(onRegisterSubmit)}
                className="space-y-4 sm:space-y-6"
              >
                <div className="space-y-2">
                  <Input
                    placeholder="Username"
                    className="h-11 sm:h-12 text-sm sm:text-base"
                    {...registerRegister("username")}
                  />
                  <ErrorMessage message={registerErrors.username?.message} />
                </div>

                <div className="space-y-2">
                  <Input
                    placeholder="Email"
                    className="h-11 sm:h-12 text-sm sm:text-base"
                    {...registerRegister("email")}
                  />
                  <ErrorMessage message={registerErrors.email?.message} />
                </div>

                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Password"
                    className="h-11 sm:h-12 text-sm sm:text-base"
                    {...registerRegister("password")}
                  />
                  <ErrorMessage message={registerErrors.password?.message} />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 sm:h-12 text-sm sm:text-base font-medium bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 hover:bg-gray-600"
                >
                  Register
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Auth;
