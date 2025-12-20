import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { LetterLiteral, SpecialLetterLiteral } from "@/model/core.model";
import { LanguageTemplate } from "@/services/collections/letterValueMap/languageTemplate.model";
import { Info, Star } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Props {
  template: LanguageTemplate;
  small?: boolean;
}
export const LanguageInfoModal = ({ template, small = false }: Props) => {
  const { t } = useTranslation();

  const scoreRange: number[] = Array.from(
    new Set(Object.values(template.scoreMap).map(Number))
  ).sort((a, b) => a - b);
  const quantityRange: number[] = Array.from(
    new Set(Object.values(template.quantityMap).map(Number))
  ).sort((a, b) => a - b);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Info
          className={cn(
            "text-red-600 cursor-pointer",
            small ? "h-5 w-5" : "h-8 w-8"
          )}
        />
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogTitle>
          {t("languageInfo.title")} — {template.name}
        </DialogTitle>
        <DialogDescription></DialogDescription>
        <div className="w-full border rounded-md">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead className="text-end">
                  {t("languageInfo.quantity")}
                </TableHead>
                {quantityRange.map((q) => (
                  <TableHead
                    className="border-l align-top pt-4"
                    rowSpan={2}
                    key={q}
                  >
                    {q}
                  </TableHead>
                ))}
              </TableRow>
              <TableRow>
                <TableHead>{t("languageInfo.score")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scoreRange.map((score, i) => (
                <TableRow
                  key={score}
                  className={i % 2 === 0 ? "bg-gray-50" : "bg-gray-100"}
                >
                  <TableCell className="bg-muted text-muted-foreground font-semibold">
                    {score}
                  </TableCell>
                  {quantityRange.map((q) => {
                    const letters = (
                      Object.entries(template.scoreMap) as [
                        LetterLiteral,
                        number
                      ][]
                    )
                      .filter(
                        ([l, s]) => score === s && template.quantityMap[l] === q
                      )
                      .map(([l]) => l.toUpperCase())
                      .sort((a, b) => a.localeCompare(b));

                    return (
                      <TableCell key={q} className="border-l">
                        <div className="whitespace-nowrap text-xs tracking-tight w-fit p-1">
                          {/* Skip the wildcard */}
                          {letters
                            .filter(
                              (l) => l !== ("0" satisfies SpecialLetterLiteral)
                            )
                            .join(", ")}
                          {letters.includes(
                            "0" satisfies SpecialLetterLiteral
                          ) && <Star className="text-yellow-500 h-4 w-4" />}
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};
