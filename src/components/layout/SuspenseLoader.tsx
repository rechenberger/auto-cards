import { Suspense, type ReactNode } from "react";

export const SuspenseLoader = ({ children }: { children?: ReactNode }) => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center text-sm text-muted-foreground">
          Loading...
        </div>
      }
    >
      {children}
    </Suspense>
  );
};
