SELECT
  final.BirthWeight AS 'Birth Weight',
  sum(final.TotalNo) AS 'Total',
  sum(final.Asphyxia) AS Asphyxia,
  sum(final.Defect) AS Defect,
  sum(final.Defect_Minor) AS Defect_Minor,
  sum(final.Defect_Major) AS Defect_Major,
  sum(final.Defect_Other) AS Defect_Other,
  sum(final.Infected) AS Infected

FROM
-- ----------------------------------------------
(SELECT T1.Weight_Category AS BirthWeight,
Sum(IF(InfantStatus IN ('Defect','Asphyxia','Normal','Hypothermia','Jaundice','Caput','Disabled Minor','Disabled Others','Disabled Major'), 1, 0)) AS TotalNo,
Sum(IF(InfantStatus = 'Asphyxia', 1, 0)) AS Asphyxia,
Sum(IF(InfantStatus IN ('Defect', 'Disabled Minor','Disabled Others','Disabled Major') , 1, 0)) AS Defect,
Sum(IF(InfantStatus =   'Disabled Minor'  , 1, 0)) AS Defect_Minor,
Sum(IF(InfantStatus =   'Disabled Major'  , 1, 0)) AS Defect_Major,
Sum(IF(InfantStatus =  'Disabled Others'  , 1, 0)) AS Defect_Other,
Sum(IF(InfantStatus = 'Jaundice', 1, 0)) AS Infected

FROM
(SELECT
InfantBirthWeights.Weight_Category,
InfantBirthStatus.InfantStatus
FROM
(SELECT  t1.encounter_id,CASE
WHEN t1.value_numeric < 1500 THEN 'Very low (< 1.5 kg)'
WHEN t1.value_numeric >= 1500 AND t1.value_numeric < 2500 THEN 'Low (1.5 to < 2.5 kg)'
ELSE 'Normal (>= 2.5 kg)'
END AS Weight_Category
FROM obs t1
INNER JOIN encounter t3 ON t1.encounter_id = t3.encounter_id
INNER JOIN visit t4 ON t3.visit_id = t4.visit_id
INNER JOIN concept_name t5 ON t1.concept_id = t5.concept_id AND t5.voided = 0
AND t5.concept_name_type = 'FULLY_SPECIFIED'
WHERE t5.name IN ('NBA-Neonate weight')
AND t1.voided = 0 AND (DATE(t1.obs_datetime) BETWEEN '#startDate#' AND '#endDate#')) AS InfantBirthWeights
INNER JOIN
(SELECT distinct t1.encounter_id, CASE
WHEN t2.name = 'Asphyxiated' THEN 'Asphyxia'
WHEN t2.name ='Normal' THEN 'Normal'
WHEN t2.name ='New born status, Hypothermia' THEN 'New born status, Hypothermia'
WHEN t2.name ='Jaundice' THEN 'Jaundice'
WHEN t2.name ='Disabled' THEN 'Defect'
WHEN t2.name ='Newborn Note, Disabled Minor' THEN 'Disabled Minor'
WHEN t2.name ='Newborn Note, Disabled Others' THEN 'Disabled Others'
WHEN t2.name ='Newborn Note, Disabled Major' THEN 'Disabled Major'
when t2.name ='Caput' then 'Caput'

ELSE 0
END
AS InfantStatus FROM obs t1
INNER JOIN concept_name t2 ON t1.value_coded = t2.concept_id
AND t2.voided = 0 AND t2.concept_name_type = 'FULLY_SPECIFIED' AND t2.Name <> 'Stillbirth'
INNER JOIN encounter t3 ON t1.encounter_id = t3.encounter_id
INNER JOIN visit t4 ON t3.visit_id = t4.visit_id
INNER JOIN concept_name t5 ON t1.concept_id = t5.concept_id AND t5.voided = 0
AND t5.concept_name_type = 'FULLY_SPECIFIED'
WHERE t5.name IN ('NBA-New born status')
AND t1.voided = 0 AND
(DATE(t1.obs_datetime) BETWEEN '#startDate#' AND '#endDate#')) AS InfantBirthStatus
ON InfantBirthWeights.encounter_id = InfantBirthStatus.encounter_id) AS T1
GROUP BY T1.Weight_Category
-- ----------------------------------------------
UNION ALL SELECT 'Normal (>= 2.5 kg)',0,0,0,0,0,0,0
UNION ALL SELECT 'Low (1.5 to < 2.5 kg)',0,0,0,0,0,0,0
UNION ALL SELECT 'Very low (< 1.5 kg)',0,0,0,0,0,0,0
)final
GROUP BY final.BirthWeight
ORDER BY CASE final.BirthWeight
WHEN 'Normal (>= 2.5 kg)' THEN 1
WHEN 'Low (1.5 to < 2.5 kg)' THEN 2
ELSE 3 END;
