-- Correct 7 malformed-but-real customer emails (matched by id, so the corrupted
-- bytes in the current value don't need to be reproduced). Run as UTF-8.
UPDATE customer SET
  email = CASE id
    WHEN 'cus_01KXRVBCZ4Z260GSS51VYPEDZS' THEN 'dm.bauer@gmail.com'
    WHEN 'cus_01KXRVBDB61V15G7CCW9N8VQV8' THEN 'horst.darmstädter@googlemail.com'
    WHEN 'cus_01KXRVBE10WD5K233HHQWBBDSB' THEN 'info@ott-schreinerei.de'
    WHEN 'cus_01KXRVBE920BZ95EE4HQ7PNGXX' THEN 'info@zumhirsch-flörsheim.de'
    WHEN 'cus_01KXRVBE9B1ZBKMW2QCTV3QG2M' THEN 'k_feigl@web.de'
    WHEN 'cus_01KXRVBE9SR2QWBP5ABZKXDXVR' THEN 'kundenservice@vnr.de'
    WHEN 'cus_01KXRVBF1C2Y1ZZPK1BQWZ6WQK' THEN 'steffie72@gmx.de'
  END,
  updated_at = now()
WHERE id IN (
  'cus_01KXRVBCZ4Z260GSS51VYPEDZS','cus_01KXRVBDB61V15G7CCW9N8VQV8',
  'cus_01KXRVBE10WD5K233HHQWBBDSB','cus_01KXRVBE920BZ95EE4HQ7PNGXX',
  'cus_01KXRVBE9B1ZBKMW2QCTV3QG2M','cus_01KXRVBE9SR2QWBP5ABZKXDXVR',
  'cus_01KXRVBF1C2Y1ZZPK1BQWZ6WQK'
);
