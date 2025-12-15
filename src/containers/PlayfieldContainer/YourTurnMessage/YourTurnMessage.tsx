import { useTranslation } from "react-i18next";

export const YourTurnMessage = () => {
  const { t } = useTranslation();
  return (
    <div className="tracking-tight text-xs font-black text-red-600 animate-pulse-scale">
      {t("scoreBoard.yourTurn")}
    </div>
  );
};
