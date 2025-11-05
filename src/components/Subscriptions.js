import { useUser } from "@/contexts/UserContext";
import { getMySubscriptions } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";

const Subscriptions = () => {
  const { user } = useUser();
  const { data: subscriptions } = useQuery({
    queryKey: ['my-subscriptions', user?.id],
    queryFn: () => getMySubscriptions(user?.id),
    enabled: !!user?.id,
  });

  if (!subscriptions || subscriptions.length === 0) {
    return null;
  }

  let paths = subscriptions.map((sub) => {
    const { avatar_url, username, id } = sub.channel;
    return (
      <li
        key={id}
        className={`text-xs rounded-lg font-medium cursor-pointer select-none`}
      >
        <Link
          className="flex items-center gap-2 px-2 py-1"
          href={"/sub/" + id}
        >
          <Image
            src={avatar_url || "/default-user.jpg"}
            alt={username + "- avatar"}
            width={28}
            height={28}
            className="rounded-full"
          />
          {username}
        </Link>
      </li>
    );
  });

  return (
    <div className="mt-4 space-y-2 text-xs font-medium tracking-wide">
      <h3>Subscriptions</h3>
      <ul className="list-none space-y-0">{paths}</ul>
    </div>
  );
};

export default Subscriptions;
