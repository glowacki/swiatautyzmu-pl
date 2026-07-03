import { createFileRoute } from "@tanstack/react-router";
import { FileCheck, Wallet, GraduationCap, Briefcase } from "lucide-react";
import { SectionLanding } from "./zycie-codzienne";

export const Route = createFileRoute("/prawo-finanse")({
  head: () => ({
    meta: [
      { title: "Prawo i finanse — swiatautyzmu.pl" },
      {
        name: "description",
        content:
          "Orzecznictwo, świadczenie wspierające, renta socjalna, dofinansowania PFRON, prawa w edukacji i pracy — po polsku i prostym językiem.",
      },
    ],
  }),
  component: () => (
    <SectionLanding
      eyebrow="Biurokracja na wyciszenie"
      title="Prawo i finanse — przewodnik po polskim systemie"
      lead="Bez żargonu urzędniczego. Krok po kroku, ze wzorami pism i kalkulatorem uprawnień."
      topics={[
        {
          icon: FileCheck,
          title: "Orzecznictwo",
          desc: "Jak zdobyć orzeczenie o niepełnosprawności, stopnie, PCPR/MOPS.",
        },
        {
          icon: Wallet,
          title: "Świadczenia i zasiłki",
          desc: "Świadczenie wspierające, renta socjalna, zasiłek pielęgnacyjny, Aktywny Samorząd.",
        },
        {
          icon: GraduationCap,
          title: "Prawo w edukacji",
          desc: "Kształcenie specjalne, asystent ucznia, dostosowania na egzaminach.",
        },
        {
          icon: Briefcase,
          title: "Prawo w pracy",
          desc: "Racjonalne usprawnienia, PFRON, dofinansowanie do zatrudnienia.",
        },
      ]}
    />
  ),
});
