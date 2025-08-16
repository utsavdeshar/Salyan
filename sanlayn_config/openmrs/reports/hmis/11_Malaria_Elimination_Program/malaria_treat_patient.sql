select
answer.answer_concept_name as 'Total malaria patient',
SUM(IF(Final.gender = 'F' &&  TIMESTAMPDIFF(YEAR, Final.DOB, Final.Date) < 5, 1, 0))  AS 'Female, <5 years',
SUM(IF(Final.gender = 'M' &&  TIMESTAMPDIFF(YEAR, Final.DOB, Final.Date) < 5, 1, 0))  AS 'Male, <5 years',
SUM(IF(Final.gender = 'F' &&  TIMESTAMPDIFF(YEAR, Final.DOB, Final.Date) >= 5, 1, 0))  AS 'Female, >5 years',
SUM(IF(Final.gender = 'M' &&  TIMESTAMPDIFF(YEAR, Final.DOB, Final.Date) >= 5, 1, 0))  AS 'Male, >5 years'
FROM 
(select p.person_id ID,p.gender as Gender, p.birthdate as DOB,
cov.value_concept_full_name as Type,
date(cov.obs_datetime) as Date
from coded_obs_view cov
Inner join person p
ON cov.person_id=p.person_id
where cov.concept_full_name = 'Malaria, Finding'
AND cov.value_concept_full_name in ('Confirmed Severe','Confirmed Uncomplicated')
AND date(cov.obs_datetime) between '#startDate#' AND '#endDate#') as Final
RIGHT JOIN (SELECT answer_concept_name
                      FROM concept_answer_view
                      WHERE question_concept_name = 'Malaria, Finding' 
                      AND answer_concept_name in ('Confirmed Severe','Confirmed Uncomplicated') ) as answer 
                      on Final.Type=answer.answer_concept_name
Group by answer.answer_concept_name
ORDER BY FIELD(answer.answer_concept_name,'Confirmed Uncomplicated', 'Confirmed Severe')