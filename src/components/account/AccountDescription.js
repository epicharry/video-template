import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import Loading from "../Loading";

const AccountDescription = () => {
  const { user, profile } = useUser();
  const imgRef = useRef(null);
  const [preview, setPreview] = useState(
    profile?.avatar_url || "/default-user.jpg"
  );

  const handleClick = () => {
    imgRef.current.click();
  };

  const { mutate, isPending } = useMutation({
    mutationFn: async (e) => {
      const file = e.target.files?.[0];
      if (!file) {
        toast.error("Please upload a file");
        return;
      }

      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Math.random()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: publicUrl })
          .eq('id', user.id);

        if (updateError) throw updateError;

        setPreview(publicUrl);
        toast.success("Avatar updated!");
        return publicUrl;
      } catch (error) {
        console.error(error);
        toast.error("Avatar update failed!");
        throw error;
      }
    },
  });

  return (
    <div className="flex gap-6">
      <div className="relative group w-24 h-24 md:w-[150px] md:h-[150px]">
        <Image
          src={preview}
          alt={`${user?.username}'s avatar`}
          fill
          priority
          className="object-cover rounded-full"
        />
        <button
          onClick={handleClick}
          className={cn(
            "absolute inset-0 rounded-full opacity-0 group-hover:opacity-80 bg-neutral-600 z-10 transition-all duration-200 flex items-center justify-center cursor-pointer",
            isPending && "opacity-80"
          )}
        >
          {isPending ? <Loading size={32} /> : <Pencil size={32} />}
        </button>
      </div>
      <input
        hidden
        type="file"
        ref={imgRef}
        accept="image/png, image/jpeg, image/webp"
        onChange={mutate}
      />
      <div className="space-y-2 flex flex-col justify-center">
        <h1 className="text-xl md:text-3xl font-bold tracking-tight">
          {profile?.username}
        </h1>
        <p className="text-xs text-neutral-400">&#x2022; {user?.email} </p>
      </div>
    </div>
  );
};

export default AccountDescription;
