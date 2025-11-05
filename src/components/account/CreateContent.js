import { schema } from "@/schema/validationSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Backdrop from "../Backdrop";
import Loading from "../Loading";
import TextField from "../TextField";
import UploadVideo from "./UploadVideo";
import Button from "../Button";
import { useState } from "react";

const defaultValues = {
  video: null,
  title: "",
  description: "",
};

const CreateContent = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues,
  });

  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user"))
      : null;
  const userId = user.userId || null;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = methods;

  const onSubmit = async (data) => {
    toast.error("Video upload functionality needs to be implemented with Supabase Storage");
  };

  return (
    <div className="relative">
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 max-w-md lg:p-4"
        >
          <UploadVideo />

          <TextField
            label="Title*"
            name="title"
            {...register("title")}
            error={errors.title?.message}
          />
          <TextField
            label="Description"
            name="description"
            type="text"
            elem="textarea"
            rows={5}
            className="resize-none"
            {...register("description")}
            error={errors.description?.message}
          />
          <Button type="submit">Upload</Button>
        </form>
      </FormProvider>
      {isSubmitting && (
        <Backdrop>
          <Loading />
          <span className="ml-2 text-lg font-medium">
            {uploadProgress}% Upload completed...
          </span>
        </Backdrop>
      )}
    </div>
  );
};

export default CreateContent;
