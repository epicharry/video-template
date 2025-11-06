import Button from "@/components/Button";
import Layout from "@/components/layouts";
import TextField from "@/components/TextField";
import { yupResolver } from "@hookform/resolvers/yup";
import Link from "next/link";
import { useRouter } from "next/router";
import { FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { login } from "@/lib/auth";
import { useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import * as yup from "yup";

const loginSchema = yup.object().shape({
  username: yup.string().required("Username is required").min(3, "Username must be at least 3 characters"),
  password: yup.string().required("Password is required").min(6, "Password must be at least 6 characters"),
});

const SignIn = () => {
  const router = useRouter();
  const { user, loading, updateUser } = useUser();
  const methods = useForm({
    resolver: yupResolver(loginSchema),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  useEffect(() => {
    if (user && !loading) {
      router.push("/");
    }
  }, [user, loading, router]);

  const onSubmit = async (data) => {
    const { password, username } = data;

    try {
      const result = await login(username, password);
      updateUser(result.user);
      toast.success("Signed in successfully");
      router.push("/");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to sign in");
    }
  };

  return (
    <>
      <div className="min-h-full py-12 lg:px-8 max-w-md mx-auto">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm mb-6">
          <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight">
            Sign in to your account
          </h2>
        </div>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <TextField
              label="Username"
              name="username"
              {...register("username")}
              error={errors.username?.message}
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              {...register("password")}
              error={errors.password?.message}
            />

            <Button type="submit" disabled={isSubmitting} className="block w-full disabled:opacity-50">
              Sign In
            </Button>
          </form>
        </FormProvider>
        <p className="text-neutral-400 text-xs mt-6 text-center">
          Don&apos;t have an account?
          <Link href="/register" className="ml-2 underline">
            Sign Up
          </Link>
        </p>
      </div>
    </>
  );
};

SignIn.getLayout = function getLayout(page) {
  return <Layout variant="clean">{page}</Layout>;
};

export default SignIn;
