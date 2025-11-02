// components/providers/SafeTooltipProvider.tsx
"use client";

import * as React from "react";
import type { ReactNode } from "react";
import { TooltipProvider as RadixTooltipProvider } from "@radix-ui/react-tooltip";

interface SafeTooltipProviderProps {
  children: ReactNode;
  delayDuration?: number;
}

export function SafeTooltipProvider({
  children,
  delayDuration = 0,
  ...props
}: SafeTooltipProviderProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Durante SSR, só renderiza children
  if (!mounted) return <>{children}</>;

  return (
    <RadixTooltipProvider delayDuration={delayDuration} {...props}>
      {children}
    </RadixTooltipProvider>
  );
}
