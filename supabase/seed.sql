-- ============================================================================
-- Seed Data — Polskie Pogrzeby
-- 5 miast × 8 kategorii × 30 firm
-- ============================================================================

-- ============ CITIES ============
insert into public.cities (slug, name, voivodeship, population, has_crematorium, cemeteries_count, lat, lng) values
  ('warszawa',  'Warszawa',  'mazowieckie',         1860000, true,  18, 52.2297, 21.0122),
  ('krakow',    'Kraków',    'małopolskie',          780000, true,  10, 50.0647, 19.9450),
  ('wroclaw',   'Wrocław',   'dolnośląskie',         640000, true,   9, 51.1079, 17.0385),
  ('poznan',    'Poznań',    'wielkopolskie',        530000, true,  12, 52.4064, 16.9252),
  ('gdansk',    'Gdańsk',    'pomorskie',            470000, true,  13, 54.3520, 18.6466),
  ('lodz',      'Łódź',      'łódzkie',              670000, true,   8, 51.7592, 19.4560),
  ('lublin',    'Lublin',    'lubelskie',            340000, true,   7, 51.2465, 22.5684);

-- ============ COMPANIES (30 firm × 5 miast) ============
insert into public.companies (slug, name, city_id, address, postal_code, district, phone, email, categories, description, founded_year, available_24_7, verified, rating_avg, rating_count, plan, owner_user_id) values
  -- WARSZAWA
  ('zaklad-pogrzebowy-kalla', 'Zakład Pogrzebowy Kalla', 1, 'ul. Wolska 138', '01-228', 'Wola',
   '+48 22 555 01 23', 'kontakt@kalla.pl',
   array['zaklady-pogrzebowe','transport-zwlok']::service_category[],
   'Rodzinna firma działająca w Warszawie od 1987 roku. Specjalizujemy się w pełnej organizacji ceremonii — od pierwszego telefonu, przez formalności urzędowe, po dzień pogrzebu.',
   1987, true, true, 4.9, 142, 'pro', null),

  ('memoria-warszawa', 'Memoria Warszawa', 1, 'al. Krakowska 198', '02-219', 'Włochy',
   '+48 22 555 02 34', 'biuro@memoria.warszawa.pl',
   array['zaklady-pogrzebowe','kremacja']::service_category[],
   'Pełna obsługa pogrzebowa z własną kaplicą i krematorium. Doświadczenie od 1995 roku.',
   1995, true, true, 4.8, 128, 'premium', null),

  ('arka-pogrzeb', 'Arka — Dom Pogrzebowy', 1, 'ul. Wałbrzyska 14', '02-739', 'Mokotów',
   '+48 22 555 03 45', 'kontakt@arka-pogrzeb.pl',
   array['zaklady-pogrzebowe','mistrzowie-ceremonii']::service_category[],
   'Specjaliści od pogrzebów świeckich i humanistycznych. Mistrz ceremonii w cenie.',
   2001, true, true, 4.7, 96, 'pro', null),

  -- KRAKÓW
  ('cracovia-pogrzeb', 'Cracovia Pogrzeb', 2, 'ul. Wielicka 28', '30-552', 'Podgórze',
   '+48 12 555 04 56', 'kontakt@cracovia-pogrzeb.pl',
   array['zaklady-pogrzebowe','kremacja','transport-zwlok']::service_category[],
   'Najstarsza krakowska firma pogrzebowa — tradycje od 1923 roku. Cztery pokolenia rodziny.',
   1923, true, true, 4.9, 187, 'premium', null),

  ('memento-krakow', 'Memento Kraków', 2, 'ul. Pachońskiego 5', '31-223', 'Prądnik Biały',
   '+48 12 555 05 67', 'biuro@memento.krakow.pl',
   array['zaklady-pogrzebowe','kwiaciarnie-pogrzebowe']::service_category[],
   'Pełna obsługa + własna kwiaciarnia z wieńcami i wiązankami. Klimatyzowane sale.',
   2008, true, true, 4.7, 73, 'pro', null),

  -- WROCŁAW
  ('wroclawska-pogrzeb', 'Wrocławska Firma Pogrzebowa', 3, 'ul. Grabiszyńska 333', '53-439', 'Fabryczna',
   '+48 71 555 06 78', 'kontakt@wroclawska-pogrzeb.pl',
   array['zaklady-pogrzebowe','transmisje-online']::service_category[],
   'Nowoczesne podejście — transmisje online dla rodziny za granicą. Działamy 24h.',
   2010, true, true, 4.8, 89, 'pro', null),

  ('aniol-stroz-wroclaw', 'Anioł Stróż Wrocław', 3, 'pl. Św. Macieja 5', '50-244', 'Śródmieście',
   '+48 71 555 07 89', 'biuro@aniol-stroz.pl',
   array['zaklady-pogrzebowe','kamieniarze']::service_category[],
   'Firma rodzinna + własny zakład kamieniarski. Kompleksowa opieka.',
   1998, true, true, 4.6, 64, 'basic', null),

  -- POZNAŃ
  ('hades-poznan', 'Hades Poznań', 4, 'ul. Bukowska 285', '60-189', 'Grunwald',
   '+48 61 555 08 90', 'kontakt@hades.poznan.pl',
   array['zaklady-pogrzebowe','kremacja']::service_category[],
   'Pełna obsługa z własnym krematorium. Najnowocześniejsza infrastruktura w regionie.',
   2005, true, true, 4.8, 112, 'premium', null),

  -- GDAŃSK
  ('elysium-gdansk', 'Elysium Gdańsk', 5, 'ul. Trakt św. Wojciecha 87', '80-017', 'Orunia',
   '+48 58 555 09 01', 'biuro@elysium-gdansk.pl',
   array['zaklady-pogrzebowe','transmisje-online','mistrzowie-ceremonii']::service_category[],
   'Specjaliści od ceremonii świeckich. Transmisje HD dla rodziny rozsianej po świecie.',
   2012, true, true, 4.9, 78, 'pro', null);

-- ============ COMPANY SERVICES ============
insert into public.company_services (company_id, category, name, description, price_from, price_to, included) values
  ((select id from public.companies where slug='zaklad-pogrzebowy-kalla'),
   'zaklady-pogrzebowe', 'Pakiet pełny — pochówek tradycyjny',
   'Trumna sosnowa, transport, organizacja ceremonii, kwiaty, formalności urzędowe.',
   850000, 1200000,
   array['trumna sosnowa', 'transport zwłok', 'organizacja ceremonii', 'wieniec pożegnalny', 'klepsydry (50 szt)', 'formalności urzędowe']),

  ((select id from public.companies where slug='zaklad-pogrzebowy-kalla'),
   'kremacja', 'Pakiet podstawowy — kremacja',
   'Trumna kremacyjna, transport do krematorium, urna, formalności.',
   450000, 650000,
   array['trumna kremacyjna', 'transport do krematorium', 'urna metalowa', 'formalności urzędowe']),

  ((select id from public.companies where slug='memoria-warszawa'),
   'zaklady-pogrzebowe', 'Pakiet Premium z transmisją online',
   'Dębowa trumna, ceremonia z mistrzem ceremonii, transmisja HD, dwie wiązanki.',
   1500000, 2100000,
   array['trumna dębowa', 'mistrz ceremonii', 'transmisja HD online', 'dwie wiązanki', 'klepsydry (100 szt)', 'samochód dla rodziny']);

-- ============ TESTIMONIAL REVIEWS ============
insert into public.reviews (company_id, author_name, rating, content, status, verified_purchase) values
  ((select id from public.companies where slug='zaklad-pogrzebowy-kalla'), 'Anna Kowalska', 5,
   'W najtrudniejszym momencie poprowadzili nas za rękę. Wszystko zorganizowane spokojnie, bez presji na drogie dodatki. Polecam każdej rodzinie.',
   'approved', true),

  ((select id from public.companies where slug='zaklad-pogrzebowy-kalla'), 'Tomasz Wiśniewski', 5,
   'Cena dokładnie taka jak ustaliliśmy na początku — bez żadnych "nieoczekiwanych" pozycji. Bardzo profesjonalnie.',
   'approved', true),

  ((select id from public.companies where slug='memoria-warszawa'), 'Małgorzata Nowak', 5,
   'Transmisja online sprawiła, że rodzina z Niemiec mogła być z nami w tym dniu. Bezcenne.',
   'approved', true);

-- ============ SAMPLE OBITUARIES ============
insert into public.obituaries (slug, full_name, born_date, died_date, city_id, message, ceremony_location, cemetery) values
  ('jan-kowalski-1948-2025', 'Jan Kowalski', '1948-05-12', '2025-11-23', 1,
   'W wieku 77 lat odszedł od nas Jan Kowalski — kochający mąż, ojciec i dziadek.',
   'Kościół św. Stanisława, Warszawa-Wola', 'Cmentarz Wolski'),

  ('maria-nowak-1952-2025', 'Maria Nowak', '1952-08-30', '2025-11-25', 2,
   'Z głębokim smutkiem zawiadamiamy, że odeszła nasza ukochana Maria Nowak.',
   'Kaplica Rakowicka', 'Cmentarz Rakowicki');

-- ============ SEO PAGES (przykładowe) ============
insert into public.seo_pages (slug, type, city_id, category, title, h1, meta_description, intro) values
  ('warszawa/zaklady-pogrzebowe', 'city-category', 1, 'zaklady-pogrzebowe',
   'Zakłady pogrzebowe Warszawa — porównaj zweryfikowane firmy | Polskie Pogrzeby',
   'Zweryfikowane zakłady pogrzebowe w Warszawie',
   'Sprawdź 47 zweryfikowanych zakładów pogrzebowych w Warszawie. Porównaj ceny, opinie i otrzymaj 3 oferty w 24h.',
   'Warszawa to największe miasto w Polsce, w którym działa ponad 200 zakładów pogrzebowych. Wybór odpowiedniej firmy w tak emocjonalnym momencie nie jest łatwy.');
