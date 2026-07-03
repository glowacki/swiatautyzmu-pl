import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, XCircle, HeartPulse, PawPrint } from "lucide-react";
import { SectionLanding } from "./zycie-codzienne";

export const Route = createFileRoute("/terapie")({
  head: () => ({
    meta: [
      { title: "Terapie i metody pracy — swiatautyzmu.pl" },
      {
        name: "description",
        content:
          "Terapie wspierające akceptowane przez społeczność (SI, logopedia, psychoterapia, DIR/Floortime, TEACCH) i czerwona lista praktyk szkodliwych.",
      },
    ],
  }),
  component: () => (
    <SectionLanding
      eyebrow="Co działa, a co szkodzi"
      title="Terapie i metody pracy"
      lead="Podejścia wspierające rozwój — bez „naprawiania”. Oraz jasna lista praktyk kontrowersyjnych i niebezpiecznych."
      topics={[
        {
          icon: HeartPulse,
          title: "Terapie wspierające",
          desc: "Logopedia, SI, psychoterapia dostosowana, terapia ręki.",
        },
        {
          icon: PawPrint,
          title: "Podejścia rozwojowe",
          desc: "DIR/Floortime, SCERTS, TEACCH jako organizacja, nie „trening normalności”.",
        },
        {
          icon: CheckCircle2,
          title: "Kryteria dobrej terapii",
          desc: "Zgoda dziecka, brak przymusu, indywidualne tempo, szacunek dla neurologii.",
        },
        {
          icon: XCircle,
          title: "Czerwona lista",
          desc: "Praktyki obiecujące „wyleczenie”: chelatacja, MMS, szkodliwe formy ABA.",
        },
      ]}
    />
  ),
});
