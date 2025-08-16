SELECT 
  cn1.name AS `Delivery-Gravida`,
  COUNT(CASE 
           WHEN CAST(o2.value_text AS UNSIGNED) BETWEEN 22 AND 27 THEN 1 
       END) AS `22-27`,
  COUNT(CASE 
           WHEN CAST(o2.value_text AS UNSIGNED) BETWEEN 28 AND 36 THEN 1 
       END) AS `28-36`,
  COUNT(CASE 
           WHEN CAST(o2.value_text AS UNSIGNED) BETWEEN 37 AND 41 THEN 1 
       END) AS `37-41`,
  COUNT(CASE 
           WHEN CAST(o2.value_text AS UNSIGNED) >= 42 THEN 1 
       END) AS `>=42`
FROM obs o
INNER JOIN concept_name cn 
  ON o.concept_id = cn.concept_id
  AND cn.name = 'Delivery-Gravida'
  AND cn.concept_name_type = 'FULLY_SPECIFIED'
  AND o.voided = 0
INNER JOIN concept_name cn1 
  ON o.value_coded = cn1.concept_id
  AND cn1.concept_name_type = 'FULLY_SPECIFIED'
LEFT JOIN obs o2 
  ON o.encounter_id = o2.encounter_id
INNER JOIN concept_name cn2
  ON o2.concept_id = cn2.concept_id
  AND cn2.name = 'Delivery, Gestation period'
  AND cn2.concept_name_type = 'FULLY_SPECIFIED'
  AND o2.voided = 0
  where date(o.obs_datetime) between '#startDate#' and '#endDate#'
GROUP BY cn1.name
ORDER BY cn1.name;
