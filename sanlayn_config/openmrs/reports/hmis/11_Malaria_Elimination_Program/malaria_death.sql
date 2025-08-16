select 
malaria_types_list.answer_concept_name as Type,
SUM(IF(Final.gender = 'F' && Final.Death IS NOT NULL &&  TIMESTAMPDIFF(YEAR, Final.DOB, Final.Date) < 5, 1, 0))  AS 'Female, <5 years',
SUM(IF(Final.gender = 'M' && Final.Death IS NOT NULL &&   TIMESTAMPDIFF(YEAR, Final.DOB, Final.Date) < 5, 1, 0))  AS 'Male, <5 years',
SUM(IF(Final.gender = 'F' && Final.Death IS NOT NULL &&   TIMESTAMPDIFF(YEAR, Final.DOB, Final.Date) >= 5, 1, 0))  AS 'Female, >5 years',
SUM(IF(Final.gender = 'M' && Final.Death IS NOT NULL &&   TIMESTAMPDIFF(YEAR, Final.DOB, Final.Date) >= 5, 1, 0))  AS 'Male, >5 years'
FROM
(select p.person_id ID,p.gender as Gender, p.birthdate as DOB,
cov.value_concept_full_name as Type,
date(cov.obs_datetime) as Date,
o.value_datetime as Death
from coded_obs_view cov
Inner join person p
ON cov.person_id=p.person_id
LEFT  JOIN obs o
on cov.encounter_id=o.encounter_id
INNER JOIN concept_name cn
on o.concept_id=cn.concept_id
AND cn.concept_name_type='FULLY_SPECIFIED'
AND cn.name='Malaria, Death Date'
where cov.concept_full_name = 'Malaria, Malaria Type'
AND date(cov.obs_datetime) between '#startDate#' AND '#endDate#') as Final
RIGHT OUTER JOIN (SELECT answer_concept_name
                      FROM concept_answer_view
                      WHERE question_concept_name = 'Malaria, Malaria Type' AND answer_concept_name != 'Malaria - Relapse Plasmodium Vivax') AS malaria_types_list
    ON Final.Type = malaria_types_list.answer_concept_name
Group BY malaria_types_list.answer_concept_name
 ORDER BY FIELD(malaria_types_list.answer_concept_name,'Plasmodium vivax','Plasmodium falciparum','Plasmodium Mixed','Malaria - Others (Ovale,Malarie,Knowlwsi, etc.)')