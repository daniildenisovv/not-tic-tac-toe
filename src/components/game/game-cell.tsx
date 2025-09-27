"use client";

import { cn } from "@/lib/utils";
import { CellValue } from "@/types/game";
import { Button } from "@/components/ui/button";

interface GameCellProps {
  value: CellValue;
  onClick: () => void;
  disabled?: boolean;
  isWinningCell?: boolean;
  isToBeRemoved?: boolean;
  moveNumber?: number | null;
  className?: string;
}

export function GameCell({
  value,
  onClick,
  disabled = false,
  isWinningCell = false,
  isToBeRemoved = false,
  moveNumber,
  className,
}: GameCellProps) {
  return (
    <Button
      variant="outline"
      className={cn(
        "h-20 w-20 text-3xl font-bold border-2 relative m-auto",
        "hover:bg-gray-100 dark:hover:bg-gray-800",
        "transition-all duration-200",
        isWinningCell &&
          "bg-green-100 border-green-500 dark:bg-green-900/20 dark:border-green-400",
        isToBeRemoved &&
          "bg-red-100 border-red-500 dark:bg-red-900/20 dark:border-red-400 animate-pulse",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
      onClick={onClick}
      disabled={disabled || value !== null}
    >
      {value && (
        <div className="flex flex-col items-center justify-center">
          <span
            className={cn(
              "text-2xl font-bold",
              value === "X"
                ? "text-blue-600 dark:text-blue-400"
                : "text-red-600 dark:text-red-400"
            )}
          >
            {value}
          </span>
          {moveNumber && (
            <span className="text-xs text-gray-500 absolute bottom-1 right-1">
              {moveNumber}
            </span>
          )}
        </div>
      )}
      {isToBeRemoved && (
        <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-bounce" />
      )}
    </Button>
  );
}
