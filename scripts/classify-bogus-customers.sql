-- Flag almost-certainly-bogus customer emails (disposable, bot-gmail, repeated-name,
-- malformed, typo domains, spam TLDs). High precision; REVIEW before deleting.
WITH c AS (
  SELECT id, email,
         lower(split_part(email,'@',1)) AS loc,
         lower(split_part(email,'@',2)) AS dom
  FROM customer
  WHERE deleted_at IS NULL
),
classified AS (
  SELECT id, email, loc, dom,
    CASE
      -- 1. Malformed / undeliverable (bad chars, trailing dot/_, mojibake, no TLD)
      WHEN email !~* '^[[:alnum:]._%+-]+@[[:alnum:]-]+(\.[[:alnum:]-]+)*\.[[:alpha:]]{2,}$' THEN 'malformed'
      -- 2. Disposable / known throwaway & SEO-spam domains (match domain or any parent)
      WHEN dom ~* '(^|\.)(1secmail\.(com|net|org)|discardmail\.com|discard\.email|spambog\.(ru|com)|mailmenot\.io|anonmails\.de|mailcatch\.com|tempr\.email|tempr-mail\.line\.pm|line\.pm|oonmail\.com|maillv\.com|maillsk\.com|mailkv\.com|znemail\.com|vargosmail\.com|coffeescerini\.com|domhost\.website|klop67\.online|dnsabr\.com|dns-cloud\.net|cloudns\.asia|halaradress\.net|websend\.net|hostpost\.uk|aaru-link\.com|1cryptodarkmarket\.com|alldarknetmarkets\.com|alldarkmarkets\.com|alldarkwebmarkets\.com|asapmarketurls\.com|asapmarket-onion\.com|seoneo\.(info|app|biz|online)|seo-neo\.net|rockstarseo\.net|aghayeseo\.com|hardseo\.store|indexing\.store|cosmiccircuit\.store|muscle-building\.club|thegreenliving\.world|giveblood\.bar|wheninrome\.rest|itchydog\.store|stopstress\.shop|awsome-gadgets\.com|drown\.(college|institute)|payforqualityporn\.com|soulvow\.com|smilietoys\.com|savedaday\.com|corebux\.com|bheps\.com|qiott\.com|qouracu\.com|cyovroc\.com|boybicy\.com|hoihhi\.com|frupia\.com|pibidic\.com|drolocy\.com|helpmeto\.host|tazza\.me|freundin\.ru|omskvulkan\.ru|oluta\.ru|cartador\.ru|engperinatal\.ru|yuristsochi24\.ru|androsapp\.ru|larpan-mobi4omes\.ru|b9-club\.(store|ru)|privbibl\.store|stelisimo\.store|biznesonlajn360\.store|2-construction\.store|effekt-avto\.store|umnyjdomspb\.store|nebulanexus\.site|ducatisigma\.site|openlandguide\.xyz|fpsrealm\.xyz|nestifysites\.com|slgdaily\.xyz|blogwebsite\.top|thodianamdu\.com|pertomail\.top|gmail2\.gq|jenocop\.ga|mongadustfi\.tk|storebotmail\.joonix\.net|joeymx\.com|andindoc\.com|tekisto\.com|makekaos\.com|wuuvo\.com|wunway\.com|raymarts\.com|sabesmail\.com|tacoblastmail\.com|directinboxs\.com|inboxmailer\.org|travel-e-store\.com|travel4all\.org|codepb\.com|hivoltz\.org|ivolix\.(com|org)|lyvix\.org|ylixo\.com|rixyle\.com|claxyn\.com|unylix\.com|xylzen\.com|ecoue\.com|cdfaq\.com|muzaco\.com|dewuch\.com|glinxy\.com|dravix\.org|ehomu\.com|ernsys\.com|xlping\.com|elyquin\.com|blyxen\.(com|org)|lumbermilltricks\.com|timminsgoldminetour\.com|themanlythings\.com|delhinightqueen\.com|carnivalday\.click|feastday\.click|beachmotel\.click|travelhub\.click|getjourney\.click|tryhike\.click|fuc\.best|pos\.coupons|swissbank\.cc|orville\.pro|topgun\.fit|polka\.fit|woz\.golf|wins\.guru|pasta\.beer|3mail\.info|supermail\.space|socialmail\.sbs|goodmail\.world|krvamail\.my|mailbox\.mom|loop\.mom|carport\.mom|camels\.online|pokemonica\.online|freecam\.info|mycam\.pro|xcam\.one|xcams\.(pro|info)|vcams\.info|mexicans\.pro|icew\.store|nmail\.work|carshop\.work|greenweed\.sbs|messages\.sbs|mailbook\.xyz|wish\.rest|banter\.cv|fckmail\.online|pretoria\.pro|indialove\.shop|dontstress\.online|astroaxis\.online|astroarch\.online|fruitingbodymushrooms\.online|razore100\.fans|rapmail\.store|storebotmail\.|rambler\.ru|mail\.ru)$' THEN 'disposable'
      -- 3. Bot-generated Gmail: many dots or trailing dot
      WHEN dom IN ('gmail.com','googlemail.com')
           AND ( loc ~ '\.$'
              OR (length(loc) - length(replace(loc,'.',''))) >= 3 ) THEN 'gmail_bot'
      -- 4. Repeated-name local part (name.name / name-name / name_name [digits])
      WHEN loc ~ '^([a-z]{3,})[._-]\1[0-9]{0,4}$' THEN 'repeated_name'
      -- 5. Typo'd provider domains (undeliverable)
      WHEN dom IN ('t-onine.de','t-onlie.de','t-onnline.de','t.online.de','gmx.nez',
                   'iclud.com','yaho.de','autlook.de','hmx.de','2t-online.de','freent.de',
                   'ouhook.com','mx.de','gmax.net','vodafon.de','telefon.de','bleuwin.ch',
                   'yahо.de') THEN 'typo_domain'
      -- 6. Spam-only TLDs (never legit German B2C here)
      WHEN dom ~* '\.(click|xyz|top|site|world|rest|bar|makeup|fit|host|space|work|guru|mom|sbs|beer|golf|cv|hair|one|ga|tk|gq|best|lat|icu|fans|store|shop|online|club|pro|ru)$' THEN 'spam_tld'
      ELSE NULL
    END AS reason
  FROM c
)
SELECT id, email, reason FROM classified WHERE reason IS NOT NULL
ORDER BY reason, email;
