SELECT 
  sbt.StillBirthType AS "Still Birth Type",
  IFNULL(COUNT(o.person_id), 0) AS "Number"
FROM (
  SELECT 'Fresh stillbirth' AS StillBirthType
  UNION ALL
  SELECT 'Macerated'
) sbt
LEFT JOIN (
  SELECT o.person_id, cn1.name AS StillBirthType
  FROM obs o
  INNER JOIN concept_name cn ON o.concept_id = cn.concept_id
    AND o.voided = 0
    AND cn.concept_name_type = 'FULLY_SPECIFIED'
    AND cn.name = 'Delivery-Stillbirth type'
  INNER JOIN concept_name cn1 ON o.value_coded = cn1.concept_id
    AND cn1.concept_name_type = 'FULLY_SPECIFIED'
      WHERE DATE(o.obs_datetime) BETWEEN '#startDate#' AND '#endDate#'
) o ON sbt.StillBirthType = o.StillBirthType
GROUP BY sbt.StillBirthType;
