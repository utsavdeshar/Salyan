select
raw_data.question,
SUM(IF((raw_data.answer = 'RHS - Central / Province Hospital' and raw_data.concept_id !=0), 1, 0))  as 'RHS - Central / Province Hospital',
SUM(IF((raw_data.answer = 'RHS - Secondary Hospital' and raw_data.concept_id !=0), 1, 0))  as 'RHS - Secondary Hospital',
SUM(IF((raw_data.answer = 'RHS - PHC' and raw_data.concept_id !=0), 1, 0))  as 'RHS - PHC',
SUM(IF((raw_data.answer = 'RHS - Health post' and raw_data.concept_id !=0), 1, 0))  as 'RHS - Health post',
SUM(IF((raw_data.answer = 'RHS - Urban health center' and raw_data.concept_id !=0), 1, 0))  as 'RHS - Urban health center',
SUM(IF((raw_data.answer = 'RHS - Community health clinic' and raw_data.concept_id !=0), 1, 0))  as 'RHS - Community health clinic',
SUM(IF((raw_data.answer = 'RHS - FCHV' and raw_data.concept_id !=0), 1, 0))  as 'RHS - FCHV',
SUM(IF((raw_data.answer = 'RHS - Refer rehabitation center' and raw_data.concept_id !=0), 1, 0))  as 'RHS - Refer rehabitation center',
SUM(IF((raw_data.answer = 'RHS - Other organization for disability' and raw_data.concept_id !=0), 1, 0))  as 'Other organization for disability',
SUM(IF((raw_data.answer = 'RHS - Other service reciver' and raw_data.concept_id !=0), 1, 0))  as 'RHS - Other service reciver',
SUM(IF((raw_data.answer = 'RHS - External refer other' and raw_data.concept_id !=0), 1, 0))  as 'RHS - External refer other'
from
(SELECT
oAdtType.question_full_name AS question,
 oAdtType.answer_full_name AS answer,
 oAdtType.concept_id as concept_id
 
 FROM
 (
 person p 
JOIN visit v ON p.person_id = v.patient_id  
JOIN encounter e ON v.visit_id = e.visit_id
JOIN nonVoidedQuestionAnswerObs oAdtType ON e.encounter_id = oAdtType.encounter_id
)  
WHERE
! p.voided AND ! v.voided AND ! e.voided
AND DATE(oAdtType.obs_datetime) BETWEEN  DATE('#startDate#') AND DATE('#endDate#') 
AND oAdtType.question_full_name IN ('RHS - External refer in', 'RHS - External refer out')

union all select 'RHS - External refer in','',''
union all select 'RHS - External refer out','',''
)

raw_data
group by raw_data.question