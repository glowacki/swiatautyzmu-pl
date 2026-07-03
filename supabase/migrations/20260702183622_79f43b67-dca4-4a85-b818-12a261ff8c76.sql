
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'contributor', 'user');
CREATE TYPE public.persona_type AS ENUM ('in_spectrum', 'close_one', 'professional');
CREATE TYPE public.article_category AS ENUM ('baza-wiedzy', 'zycie-codzienne', 'etapy-zycia', 'prawo-finanse', 'terapie', 'historie');
CREATE TYPE public.article_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE public.facility_type AS ENUM ('diagnostyk', 'terapeuta', 'osrodek', 'szkola', 'wtz', 'sds', 'autism_friendly');

-- ============ UPDATED_AT TRIGGER FN ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  persona public.persona_type,
  pref_sensory_mode TEXT NOT NULL DEFAULT 'standard',
  pref_font_scale NUMERIC NOT NULL DEFAULT 1.0,
  pref_dyslexic_font BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- ============ ARTICLES ============
CREATE TABLE public.articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image_url TEXT,
  category public.article_category NOT NULL,
  personas public.persona_type[] NOT NULL DEFAULT '{}',
  reading_minutes INTEGER NOT NULL DEFAULT 5,
  status public.article_status NOT NULL DEFAULT 'draft',
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.articles TO authenticated;
GRANT SELECT ON public.articles TO anon;
GRANT ALL ON public.articles TO service_role;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published articles are viewable by everyone" ON public.articles FOR SELECT USING (status = 'published' OR auth.uid() = author_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));
CREATE POLICY "Contributors can create articles" ON public.articles FOR INSERT WITH CHECK (auth.uid() = author_id AND (public.has_role(auth.uid(), 'contributor') OR public.has_role(auth.uid(), 'admin')));
CREATE POLICY "Authors and admins can update" ON public.articles FOR UPDATE USING (auth.uid() = author_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));
CREATE POLICY "Admins can delete" ON public.articles FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER articles_updated_at BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_articles_published ON public.articles(status, published_at DESC) WHERE status = 'published';
CREATE INDEX idx_articles_category ON public.articles(category);

-- ============ FACILITIES (KATALOG) ============
CREATE TABLE public.facilities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type public.facility_type NOT NULL,
  description TEXT,
  voivodeship TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  postal_code TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  services TEXT[] NOT NULL DEFAULT '{}',
  target_ages TEXT[] NOT NULL DEFAULT '{}',
  is_verified BOOLEAN NOT NULL DEFAULT false,
  submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.facilities TO authenticated;
GRANT SELECT ON public.facilities TO anon;
GRANT ALL ON public.facilities TO service_role;
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Verified facilities are public" ON public.facilities FOR SELECT USING (is_verified = true OR auth.uid() = submitted_by OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));
CREATE POLICY "Authenticated users can submit" ON public.facilities FOR INSERT WITH CHECK (auth.uid() = submitted_by);
CREATE POLICY "Submitters and admins can update" ON public.facilities FOR UPDATE USING (auth.uid() = submitted_by OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));
CREATE POLICY "Admins can delete facilities" ON public.facilities FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER facilities_updated_at BEFORE UPDATE ON public.facilities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_facilities_voivodeship ON public.facilities(voivodeship);
CREATE INDEX idx_facilities_type ON public.facilities(type);

-- ============ GLOSSARY ============
CREATE TABLE public.glossary_terms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  term TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  pronunciation TEXT,
  short_definition TEXT NOT NULL,
  long_definition TEXT,
  related_terms TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.glossary_terms TO authenticated;
GRANT SELECT ON public.glossary_terms TO anon;
GRANT ALL ON public.glossary_terms TO service_role;
ALTER TABLE public.glossary_terms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Glossary is public" ON public.glossary_terms FOR SELECT USING (true);
CREATE POLICY "Contributors can insert glossary" ON public.glossary_terms FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'contributor') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update glossary" ON public.glossary_terms FOR UPDATE USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));
CREATE POLICY "Admins can delete glossary" ON public.glossary_terms FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER glossary_updated_at BEFORE UPDATE ON public.glossary_terms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ FORUM ============
CREATE TABLE public.forum_threads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  body TEXT NOT NULL,
  category TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.forum_threads TO authenticated;
GRANT SELECT ON public.forum_threads TO anon;
GRANT ALL ON public.forum_threads TO service_role;
ALTER TABLE public.forum_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Threads are public" ON public.forum_threads FOR SELECT USING (true);
CREATE POLICY "Authenticated can create threads" ON public.forum_threads FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors and mods can update" ON public.forum_threads FOR UPDATE USING (auth.uid() = author_id OR public.has_role(auth.uid(), 'moderator') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authors and admins can delete" ON public.forum_threads FOR DELETE USING (auth.uid() = author_id OR public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER forum_threads_updated_at BEFORE UPDATE ON public.forum_threads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.forum_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id UUID NOT NULL REFERENCES public.forum_threads(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.forum_replies TO authenticated;
GRANT SELECT ON public.forum_replies TO anon;
GRANT ALL ON public.forum_replies TO service_role;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Replies are public" ON public.forum_replies FOR SELECT USING (true);
CREATE POLICY "Authenticated can reply" ON public.forum_replies FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors and mods can update replies" ON public.forum_replies FOR UPDATE USING (auth.uid() = author_id OR public.has_role(auth.uid(), 'moderator') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authors and admins can delete replies" ON public.forum_replies FOR DELETE USING (auth.uid() = author_id OR public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER forum_replies_updated_at BEFORE UPDATE ON public.forum_replies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_forum_replies_thread ON public.forum_replies(thread_id, created_at);

-- ============ SEED DATA ============
INSERT INTO public.glossary_terms (term, slug, pronunciation, short_definition, long_definition) VALUES
('Stimming', 'stimming', '[stɪm.ɪŋ]', 'Powtarzalne ruchy ciała lub dźwięki służące samoregulacji.', 'Autostymulacja to naturalne zachowanie osób w spektrum, które pomaga regulować napięcie emocjonalne, radzić sobie z nadmiarem bodźców lub wyrażać radość. Nie należy jej powstrzymywać, o ile nie jest szkodliwa.'),
('Meltdown', 'meltdown', '[ˈmɛlt.daʊn]', 'Załamanie sensoryczne — reakcja na przeciążenie, nie kontrolowana świadomie.', 'To utrata kontroli spowodowana przeciążeniem sensorycznym lub emocjonalnym. W przeciwieństwie do napadu złości nie jest świadomym zachowaniem i nie można go „przeczekać dyscypliną".'),
('Shutdown', 'shutdown', '[ˈʃʌt.daʊn]', 'Wycofanie się jako reakcja na przeciążenie.', 'Cichsza forma reakcji na przeciążenie — osoba wycofuje się, milknie, wyłącza komunikację, aby zregenerować układ nerwowy.'),
('Maskowanie', 'maskowanie', NULL, 'Ukrywanie cech spektrum, aby dopasować się do otoczenia neurotypowego.', 'Świadome lub nieświadome tłumienie naturalnych zachowań (np. stymulacji), naśladowanie zachowań społecznych, kosztem ogromnej energii. Prowadzi do wypalenia autystycznego.'),
('Wypalenie autystyczne', 'wypalenie-autystyczne', NULL, 'Głębokie wyczerpanie fizyczne i psychiczne po długim maskowaniu.', 'Stan chronicznego przeciążenia poznawczego, emocjonalnego i sensorycznego, często po latach maskowania. Wymaga długiej regeneracji, redukcji bodźców i akceptacji.'),
('Neuroróżnorodność', 'neuroroznorodnosc', NULL, 'Paradygmat uznający naturalną różnorodność ludzkich mózgów.', 'Termin ukuty przez socjolożkę Judy Singer. Uznaje autyzm, ADHD, dysleksję i inne za naturalne odmiany funkcjonowania, a nie zaburzenia do „naprawienia".');

INSERT INTO public.articles (slug, title, excerpt, content, category, personas, reading_minutes, status, published_at) VALUES
('przygotowanie-domu-sensorycznie', 'Jak przygotować dom na sensoryczne wyzwania?', 'Praktyczny przewodnik po aranżacji wnętrz sprzyjających regulacji zmysłów. Oświetlenie, dźwięk, faktury i strefy wyciszenia.', E'# Jak przygotować dom na sensoryczne wyzwania?\n\nStworzenie środowiska przyjaznego sensorycznie zaczyna się od zrozumienia własnego profilu wrażliwości. W tym artykule przechodzimy przez cztery kluczowe wymiary: światło, dźwięk, dotyk i przestrzeń.\n\n## Światło\n\nOświetlenie punktowe zamiast jarzeniowego. Zasłony blackout w sypialni. Ściemniacze.\n\n## Dźwięk\n\nMiękkie tekstylia pochłaniają echo. Słuchawki wygłuszające jako codzienny sprzęt, nie awaryjny.\n\n## Strefa wyciszenia\n\nKażdy dom powinien mieć jedno miejsce niskobodźcowe — nawet mały namiot lub kącik z poduszkami wystarczy.', 'zycie-codzienne', ARRAY['in_spectrum','close_one']::persona_type[], 6, 'published', now() - interval '2 days'),
('diagnoza-doroslych-kobiet', 'Diagnoza u dorosłych kobiet — co warto wiedzieć?', 'Specyfika maskowania i różnice w procesie diagnostycznym u kobiet w spektrum. Dlaczego tak wiele diagnoz przychodzi po 30. roku życia.', E'# Diagnoza u dorosłych kobiet\n\nKobiety w spektrum bywają diagnozowane znacznie później niż mężczyźni — nie dlatego, że autyzm występuje u nich rzadziej, ale dlatego, że kryteria diagnostyczne przez dekady opierały się na męskim wzorcu prezentacji.\n\n## Dlaczego tak późno?\n\nMaskowanie, mimikra społeczna, „grzeczne dziewczynki" — wszystko to sprawia, że cechy spektrum bywają niewidoczne aż do momentu wypalenia.\n\n## Gdzie szukać diagnozy?\n\nW Polsce diagnostyka dorosłych jest ograniczona. Sprawdź nasz [katalog placówek](/katalog).', 'baza-wiedzy', ARRAY['in_spectrum','professional']::persona_type[], 8, 'published', now() - interval '5 days'),
('prawa-pracownika-neuroroznorodnego', 'Prawa pracownika neuroróżnorodnego w Polsce', 'Przegląd przepisów, wsparcia PFRON i praktycznych dostosowań w miejscu pracy dla osób w spektrum.', E'# Prawa pracownika neuroróżnorodnego w Polsce\n\nZatrudnienie osób z orzeczeniem o niepełnosprawności regulują ustawa o rehabilitacji i przepisy PFRON.\n\n## Dostosowania stanowiska pracy\n\nPracodawca ma obowiązek wprowadzić racjonalne usprawnienia — od słuchawek wygłuszających po elastyczne godziny.\n\n## Dofinansowania PFRON\n\nDofinansowanie do wynagrodzenia, refundacja kosztów adaptacji stanowiska.', 'prawo-finanse', ARRAY['in_spectrum','professional']::persona_type[], 7, 'published', now() - interval '10 days'),
('rozmowa-z-dzieckiem-po-diagnozie', 'Rozmowa z dzieckiem po diagnozie — od czego zacząć?', 'Jak przekazać dziecku informację o spektrum w sposób budujący, bez używania języka „choroby".', E'# Rozmowa z dzieckiem po diagnozie\n\nDiagnoza nie jest wyrokiem. To klucz do zrozumienia siebie.\n\n## Język ma znaczenie\n\nMówimy „jesteś w spektrum", nie „masz autyzm". Mówimy „inaczej odbierasz świat", nie „coś jest z tobą nie tak".', 'etapy-zycia', ARRAY['close_one']::persona_type[], 5, 'published', now() - interval '15 days');

INSERT INTO public.facilities (name, type, description, voivodeship, city, address, phone, latitude, longitude, services, target_ages, is_verified) VALUES
('Fundacja Synapsis', 'osrodek', 'Wiodący ośrodek diagnozy i terapii osób w spektrum autyzmu w Polsce.', 'mazowieckie', 'Warszawa', 'ul. Ondraszka 3', '+48 22 825 87 42', 52.2297, 21.0122, ARRAY['diagnoza','terapia','konsultacje'], ARRAY['dzieci','młodzież','dorośli'], true),
('Centrum Terapii Autyzmu', 'terapeuta', 'Terapia indywidualna oparta na akceptacji i integracji sensorycznej.', 'małopolskie', 'Kraków', 'ul. Karmelicka 12', '+48 12 421 33 55', 50.0647, 19.9450, ARRAY['SI','logopedia','psychoterapia'], ARRAY['dzieci','młodzież'], true),
('Poradnia Diagnozy Dorosłych', 'diagnostyk', 'Specjalistyczna diagnoza spektrum u osób dorosłych, ze szczególnym uwzględnieniem kobiet.', 'wielkopolskie', 'Poznań', 'ul. Święty Marcin 45', '+48 61 852 11 22', 52.4064, 16.9252, ARRAY['diagnoza dorosłych','konsultacje'], ARRAY['dorośli'], true),
('Kawiarnia Cicha Godzina', 'autism_friendly', 'Kawiarnia z wydzielonymi godzinami niskobodźcowymi (wt-czw 10-12): bez muzyki, przygaszone światło.', 'dolnośląskie', 'Wrocław', 'ul. Świdnicka 8', '+48 71 344 55 66', 51.1079, 17.0385, ARRAY['strefa wyciszenia','menu piktogramowe'], ARRAY['wszyscy'], true),
('Szkoła Podstawowa nr 5 z oddziałami terapeutycznymi', 'szkola', 'Publiczna szkoła z klasami terapeutycznymi dla dzieci ze spektrum.', 'pomorskie', 'Gdańsk', 'ul. Kartuska 100', '+48 58 302 44 55', 54.3520, 18.6466, ARRAY['klasa terapeutyczna','asystent ucznia','TUS'], ARRAY['dzieci'], true),
('WTZ Aktywni', 'wtz', 'Warsztat terapii zajęciowej dla dorosłych osób w spektrum.', 'śląskie', 'Katowice', 'ul. Mikołowska 22', '+48 32 251 78 99', 50.2649, 19.0238, ARRAY['warsztaty rękodzieła','trening umiejętności'], ARRAY['dorośli'], true);
