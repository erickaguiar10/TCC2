import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = Omit<
  React.ComponentPropsWithoutRef<typeof Sonner>,
  "key"
>;

const Toaster = ({ ...props }: ToasterProps) => {
  // se quiser alternar dark/light depois, dá pra passar por props
  const theme: ToasterProps["theme"] = "light";

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
