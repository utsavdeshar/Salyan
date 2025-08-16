SELECT   
 raw_data.question_full_name AS question,
sum(if(raw_data.answer_full_name = 'RHS - Inbirth',1,0)) as 'RHS - Inbirth',
sum(if(raw_data.answer_full_name = 'RHS - Accident',1,0)) as 'RHS - Accident',
sum(if(raw_data.answer_full_name = 'RHS - Violence',1,0)) as 'RHS - Violence',
sum(if(raw_data.answer_full_name = 'RHS - Non communicable disease',1,0)) as 'RHS - Non communicable disease',
sum(if(raw_data.answer_full_name = 'RHS - Communicable disease',1,0)) as 'RHS - Communicable disease',
sum(if(raw_data.answer_full_name = 'RHS - Osteoporosis',1,0)) as 'RHS - Osteoporosis',
sum(if(raw_data.answer_full_name = 'RHS - Others',1,0)) as 'RHS - Others',
sum(if(raw_data.answer_full_name = 'RHS - Unknown',1,0)) as 'RHS - Unknown'
from
(select
oAdtType.question_full_name,
oAdtType.answer_full_name
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
AND oAdtType.question_full_name IN ('RHS - Causes')
)raw_data

group by raw_data.question_full_name