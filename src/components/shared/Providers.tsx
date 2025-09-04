"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { queryClient } from "@/lib/queryClient";

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  // Create a client instance that persists across re-renders
  const [client] = useState(() => queryClient);

  return (
    <QueryClientProvider client={client}>
      {children}
      <ReactQueryDevtools
        initialIsOpen={false}
        buttonPosition="bottom-left"
        position="bottom"
      />
    </QueryClientProvider>
  );
}
