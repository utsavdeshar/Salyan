select  raw_data.m_type AS 'Type of Malaria', 
raw_data.M_classification as 'classification',
SUM(IF(raw_data.gender = 'F' &&  TIMESTAMPDIFF(YEAR, raw_data.DOB, raw_data.Date) < 5, 1, 0))  AS 'Female, <5 years',
SUM(IF(raw_data.gender = 'M' &&  TIMESTAMPDIFF(YEAR, raw_data.DOB, raw_data.Date) < 5, 1, 0))  AS 'Male, <5 years',
SUM(IF(raw_data.gender = 'F' &&  TIMESTAMPDIFF(YEAR, raw_data.DOB, raw_data.Date) >= 5, 1, 0))  AS 'Female, >5 years',
SUM(IF(raw_data.gender = 'M' &&  TIMESTAMPDIFF(YEAR, raw_data.DOB, raw_data.Date) >= 5, 1, 0))  AS 'Male, >5 years'
From 
(select distinct  malaria_types_list.answer_concept_name as 'm_type',final.ID,final.Gender,final.DOB,
 ifnull(final.Classification,classification_list.classification_name) as 'M_classification',final.Date
from (select p.person_id ID,p.gender as Gender, p.birthdate as DOB,
cov.value_concept_full_name as Type,
 cov1.value_concept_full_name as Classification,
date(cov.obs_datetime) as Date
from coded_obs_view cov
Inner join coded_obs_view as cov1
on cov.encounter_id=cov1.encounter_id
AND cov1.concept_full_name = 'Malaria-Classification'
Inner join person p
ON cov.person_id=p.person_id
where cov.concept_full_name = 'Malaria, Malaria Type'
AND  cov1.value_concept_full_name is not null
AND date(cov.obs_datetime) between '#startDate#' AND '#endDate#') as final 
RIGHT OUTER JOIN (SELECT answer_concept_name
                      FROM concept_answer_view
                      WHERE question_concept_name = 'Malaria, Malaria Type') AS malaria_types_list
    ON final.Type = malaria_types_list.answer_concept_name
   cross join  (select distinct value_concept_full_name as 'classification_name' from coded_obs_view cn where cn.concept_full_name = 'Malaria-Classification' and cn.voided = 0 ) AS classification_list
  ) as raw_data
    Group BY raw_data.m_type,raw_data.M_classification
    -- ORDER BY FIELD(raw_data.m_type,'Plasmodium vivax','Malaria - Relapse Plasmodium Vivax','Plasmodium falciparum','Plasmodium Mixed','Malaria - Others (Ovale,Malarie,Knowlwsi, etc.)'), FIELD(raw_data.M_classification,'Indigenous','Imported')
