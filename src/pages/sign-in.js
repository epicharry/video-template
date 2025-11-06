import Button from "@/components/Button";
import Layout from "@/components/layouts";
import TextField from "@/components/TextField";
import { loginSchema } from "@/schema/loginSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import Link from "next/link";
import { useRouter } from "next/router";
import { FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";
import { useUser } from "@/contexts/UserContext";

const SignIn = () => {
  const router = useRouter();
  const { user, loading } = useUser();
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
    const { password, email } = data;

    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success("Signed in successfully");

      setTimeout(() => {
        router.push("/");
      }, 500);
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
              label="Email"
              name="email"
              {...register("email")}
              error={errors.email?.message}
            />
            <TextField
              label="Password"
              name="password"
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
