SELECT   
 raw_data.question_full_name AS question,
sum(if(raw_data.answer_full_name = 'RHS - Physiotherapy Service',1,0)) as 'RHS - Physiotherapy Service',
sum(if(raw_data.answer_full_name = 'RHS - Speech & hearing service',1,0)) as 'RHS - Speech & hearing service',
sum(if(raw_data.answer_full_name = 'RHS - Occupational therapy',1,0)) as 'RHS - Occupational therapy',
sum(if(raw_data.answer_full_name = 'RHS - Support equipment service',1,0)) as 'RHS - Support equipment service',
sum(if(raw_data.answer_full_name = 'RHS - P.M. and R',1,0)) as 'RHS - P.M. and R',
sum(if(raw_data.answer_full_name = 'RHS - Other clinician service',1,0)) as 'RHS - Other clinician service',
sum(if(raw_data.answer_full_name = 'RHS - Psycho-social service',1,0)) as 'RHS - Psycho-social service',
sum(if(raw_data.answer_full_name = 'RHS - Other service',1,0)) as 'RHS - Other service'

FROM 
(
select 
oAdtType.question_full_name,
oAdtType.answer_full_name
from
(
person p 
JOIN visit v ON p.person_id = v.patient_id  
JOIN encounter e ON v.visit_id = e.visit_id
JOIN nonVoidedQuestionAnswerObs oAdtType ON e.encounter_id = oAdtType.encounter_id
)  
WHERE
! p.voided AND ! v.voided AND ! e.voided
AND DATE(oAdtType.obs_datetime) BETWEEN DATE('#startDate#') AND DATE('#endDate#') 
AND oAdtType.question_full_name IN ('RHS - Type of services')
group by  oAdtType.question_full_name

union all select 'RHS - Type of services',''
)
raw_data
group by raw_data.question_full_name
