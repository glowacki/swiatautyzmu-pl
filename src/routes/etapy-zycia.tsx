import { createFileRoute } from "@tanstack/react-router";
import { Baby, School, Users, Briefcase } from "lucide-react";
import { SectionLanding } from "./zycie-codzienne";

export const Route = createFileRoute("/etapy-zycia")({
  head: () => ({
    meta: [
      { title: "Etapy życia — swiatautyzmu.pl" },
      {
        name: "description",
        content:
          "Wsparcie na każdym etapie: wczesne dzieciństwo, edukacja szkolna, dojrzewanie, dorosłość, praca i związki.",
      },
    ],
  }),
  component: () => (
    <SectionLanding
      eyebrow="Rozwój"
      title="Etapy życia — od pierwszych oznak po dorosłość"
      lead="Każdy etap ma swoje wyzwania. Zbieramy sprawdzone strategie i prawa, które przysługują na każdym z nich."
      categoryKey="etapy-zycia"
      topics={[
        {
          icon: Baby,
          title: "Wczesne dzieciństwo",
          desc: "Pierwsze oznaki, wczesna interwencja, wsparcie rodzica bez presji „normalizacji”.",
        },
        {
          icon: School,
          title: "Wiek szkolny",
          desc: "Orzeczenie, WOPFU, klasa terapeutyczna vs masowa, relacje rówieśnicze.",
        },
        {
          icon: Users,
          title: "Dojrzewanie i dorosłość",
          desc: "Tożsamość, seksualność, granice, studia i życie akademickie.",
        },
        {
          icon: Briefcase,
          title: "Praca i związki",
          desc: "Rynek pracy dopasowany do profilu, mieszane pary neurologiczne, rodzicielstwo w spektrum.",
        },
      ]}
    />
  ),
});
