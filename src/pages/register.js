import Button from "@/components/Button";
import Layout from "@/components/layouts";
import TextField from "@/components/TextField";
import { registerSchema } from "@/schema/registerSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import Link from "next/link";
import { useRouter } from "next/router";
import { FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

const Register = () => {
  const methods = useForm({
    resolver: yupResolver(registerSchema),
  });
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = methods;

  const onSubmit = async (data) => {
    const { cpassword, username, email, password } = data;

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            username,
            avatar_url: null,
          },
        ]);

      if (profileError) throw profileError;

      reset();
      toast.success("Registered successfully, Please sign in.");
      router.push("/sign-in");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Something went wrong!");
    }
  };

  return (
    <>
      <div className="min-h-full lg:px-8 max-w-md mx-auto">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm mb-6">
          <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight">
            Register your account
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
              label="Email"
              name="useremail"
              {...register("email")}
              error={errors.email?.message}
            />
            <TextField
              label="Password"
              name="password"
              {...register("password")}
              error={errors.password?.message}
            />

            <TextField
              label="Confirm Password"
              name="cpassword"
              {...register("cpassword")}
              error={errors.cpassword?.message}
            />

            <Button
              type="submit"
              disabled={isSubmitting || Object.keys(errors).length > 0}
              className="disabled:bg-neutral-800 block w-full disabled:cursor-not-allowed"
            >
              Sign Up
            </Button>
          </form>
        </FormProvider>

        <p className="text-neutral-400 text-xs mt-6 text-right">
          Already have an account?
          <Link href="/sign-in" className="ml-2 underline">
            Sign in
          </Link>
        </p>
      </div>
    </>
  );
};

Register.getLayout = function getLayout(page) {
  return <Layout variant="clean">{page}</Layout>;
};

export default Register;
