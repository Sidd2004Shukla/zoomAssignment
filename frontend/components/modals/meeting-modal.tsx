import Image from "next/image";
import type { PropsWithChildren } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type MeetingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  className?: string;
  handleClick?: () => void;
  buttonText?: string;
  image?: string;
  buttonIcon?: string;
  isLoading?: boolean;
};

export const MeetingModal = ({
  isOpen,
  onClose,
  title,
  className,
  children,
  handleClick,
  buttonText,
  image,
  buttonIcon,
  isLoading = false,
}: PropsWithChildren<MeetingModalProps>) => {
  return (
    <Dialog open={isOpen || isLoading} onOpenChange={onClose}>
      <DialogContent className="flex w-full max-w-[520px] flex-col gap-6 rounded-2xl border border-[#e7eaf0] bg-white px-7 py-8 text-[#111827] shadow-xl">
        <div className="flex flex-col gap-5">
          {image && (
            <div className="flex justify-center">
              <Image src={image} alt={title} width={64} height={64} />
            </div>
          )}

          <h1 className={cn("text-2xl font-bold leading-tight text-[#111827]", className)}>
            {title}
          </h1>

          {children}

          <Button
            className="mt-2 bg-[#2d6cdf] font-semibold text-white transition hover:bg-[#245bc2]"
            onClick={handleClick}
            disabled={isLoading}
          >
            {buttonIcon && (
              <Image src={buttonIcon} alt={title} width={14} height={14} className="mr-2" />
            )}
            {buttonText || "Schedule Meeting"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
