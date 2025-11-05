import Layout from "@/components/layouts";
import { UserProvider } from "@/contexts/UserContext";
import "@/styles/globals.css";
import "@/styles/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NextNProgress from "nextjs-progressbar";
import { Toaster } from "react-hot-toast";

const toastStyle = {
  background: "#363636",
  color: "#fff",
};

const queryClient = new QueryClient();

export default function App({ Component, pageProps }) {
  const getLayout = Component.getLayout ?? ((page) => <Layout>{page}</Layout>);
  return (
    <>
      <NextNProgress
        color="red"
        startPosition={0.2}
        stopDelayMs={100}
        height={2}
        showOnShallow={true}
      />
      <UserProvider>
        <QueryClientProvider client={queryClient}>
          <Toaster toastOptions={{ style: toastStyle }} />
          {getLayout(<Component {...pageProps} />)}
        </QueryClientProvider>
      </UserProvider>
    </>
  );
}
