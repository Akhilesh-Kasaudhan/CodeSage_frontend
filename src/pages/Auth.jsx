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
  message ? <p className="text-sm text-red-500">{message}</p> : null;

const Auth = () => {
  const [tab, setTab] = useState("login");
  // const [apiError, setApiError] = useState(null);
  // const [registerSuccess, setRegisterSuccess] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const dispatch = useDispatch();
  const { loading, error, userInfo } = useSelector((state) => state.auth);

  const navigate = useNavigate();

  useEffect(() => {
    dispatch(clearError());
  }, [tab, dispatch]);

  useEffect(() => {
    if (userInfo) {
      navigate("/code-reviewer");
    }
  }, [userInfo, navigate]);

  //Form:login

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    reset: resetLoginForm,
    formState: { errors: loginErrors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  //form:register
  const {
    register: registerRegister,
    handleSubmit: handleRegisterSubmit,
    reset: resetRegisterForm,
    formState: { errors: registerErrors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onLoginSubmit = useCallback(
    async (data) => {
      try {
        await dispatch(loginUser(data)).unwrap();
        toast.success("Login successful!");
        resetLoginForm();
        navigate("/code-reviewer");
      } catch (err) {
        const msg =
          axios.isAxiosError(err) && err.response?.data?.message
            ? err.response.data.message
            : err?.message || "Login failed";
        toast.error(msg);
      }
    },
    [dispatch, resetLoginForm, navigate]
  );

  const onRegisterSubmit = useCallback(
    async (data) => {
      setIsRegistering(true);
      try {
        await dispatch(registerUser(data)).unwrap();
        toast.success("Registration successful!");
        resetRegisterForm();
        setTab("login");
        setIsRegistering(false);
      } catch (err) {
        const msg =
          axios.isAxiosError(err) && err.response?.data?.message
            ? err.response.data.message
            : err?.message || "Registration failed";
        toast.error(msg);
        setIsRegistering(false);
      }
    },
    [dispatch, resetRegisterForm]
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-400">
      <div className="w-[600px] space-y-8">
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
              <div className="space-y-2">
                <Input placeholder="Email" {...registerLogin("email")} />
                <ErrorMessage message={loginErrors.email?.message} />
              </div>

              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Password"
                  {...registerLogin("password")}
                />
                <ErrorMessage message={loginErrors.password?.message} />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </TabsContent>

          {/* Register Tab */}

          <TabsContent value="register">
            <form
              onSubmit={handleRegisterSubmit(onRegisterSubmit)}
              className="space-y-6"
            >
              <div className="space-y-2">
                <Input
                  placeholder="Username"
                  {...registerRegister("username")}
                />
                <ErrorMessage message={registerErrors.username?.message} />
              </div>

              <div className="space-y-2">
                <Input placeholder="Email" {...registerRegister("email")} />
                <ErrorMessage message={registerErrors.email?.message} />
              </div>

              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Password"
                  {...registerRegister("password")}
                />
                <ErrorMessage message={registerErrors.password?.message} />
              </div>

              <Button type="submit" className="w-full" disabled={isRegistering}>
                {isRegistering ? "Registering..." : "Register"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
