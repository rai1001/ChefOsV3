"use client";

import { ReactNode, useState } from "react";
import {
  QueryClient,
  QueryClientProvider
} from "@tanstack/react-query";

type Props = {
  children: ReactNode;
};

export const Providers = ({ children }: Props) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 1000 * 30
          }
        }
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
