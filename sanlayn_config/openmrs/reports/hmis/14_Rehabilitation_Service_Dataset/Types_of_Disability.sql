select
raw_data.gender,
raw_data.question,
SUM(IF((raw_data.answer = 'RHS - Physical disability' and raw_data.concept_id !=0), 1, 0))  as 'RHS - Physical disability',
SUM(IF((raw_data.answer = 'RHS - Vision related disability' and raw_data.concept_id !=0), 1, 0))  as 'RHS - Vision related disability',
SUM(IF((raw_data.answer = 'RHS - Hearing disability' and raw_data.concept_id !=0), 1, 0))  as 'RHS - Hearing disability',
SUM(IF((raw_data.answer = 'RHS - Vision and hearing impaired' and raw_data.concept_id !=0), 1, 0))  as 'RHS - Vision and hearing impaired',
SUM(IF((raw_data.answer = 'RHS - Speech/language related impairment' and raw_data.concept_id !=0), 1, 0))  as 'RHS - Speech/language related impairment',
SUM(IF((raw_data.answer = 'RHS - Mental & psychological impairment' and raw_data.concept_id !=0), 1, 0))  as 'RHS - Mental & psychological impairment',
SUM(IF((raw_data.answer = 'RHS - Intellectual disability' and raw_data.concept_id !=0), 1, 0))  as 'RHS - Intellectual disability',
SUM(IF((raw_data.answer = 'RHS - Heriditary hemophilia' and raw_data.concept_id !=0), 1, 0))  as 'RHS - Heriditary hemophilia',
SUM(IF((raw_data.answer = 'RHS - Autism disability' and raw_data.concept_id !=0), 1, 0))  as 'RHS - Autism disability',
SUM(IF((raw_data.answer = 'RHS - Multiple disability' and raw_data.concept_id !=0), 1, 0))  as 'RHS - Multiple disability'
from 
(SELECT   
 oAdtType.question_full_name AS question,
 oAdtType.answer_full_name AS answer,
 oAdtType.concept_id as concept_id,
 p.gender as gender
 -- count(*) AS counter

  FROM 
(
person p 
JOIN visit v ON p.person_id = v.patient_id  
JOIN encounter e ON v.visit_id = e.visit_id
JOIN nonVoidedQuestionAnswerObs oAdtType ON e.encounter_id = oAdtType.encounter_id
)  
WHERE
! p.voided AND ! v.voided AND ! e.voided
AND DATE(oAdtType.obs_datetime) BETWEEN DATE('#startDate#') AND DATE('#endDate#') 
AND oAdtType.question_full_name IN ('RHS - Types of Disability')


UNION ALL SELECT 'RHS - Types of Disability','',0,'F'
UNION ALL SELECT 'RHS - Types of Disability','',0,'M'
UNION ALL SELECT 'RHS - Types of Disability','',0,'O'

)
raw_data
group by raw_data.gender