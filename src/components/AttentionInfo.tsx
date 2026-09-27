import { Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function AttentionInfo() {
  return (
    <Popover>
      <PopoverTrigger
        aria-label="O que são pontos de atenção?"
        className="text-muted-foreground transition-colors hover:text-foreground"
      >
        <Info className="size-4" />
      </PopoverTrigger>
      <PopoverContent className="max-w-xs text-sm">
        <p className="font-medium">O que são pontos de atenção?</p>
        <p className="mt-1 text-muted-foreground">
          Observações registradas por você relacionadas a situações como dificuldades, falta de
          atenção ou baixa participação e que podem ser úteis para acompanhamento posterior.
        </p>
      </PopoverContent>
    </Popover>
  );
}
