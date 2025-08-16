select
raw_data.question,
SUM(IF((raw_data.answer = 'RHS - OPD' and raw_data.concept_id !=0), 1, 0))  as 'RHS - OPD',
SUM(IF((raw_data.answer = 'RHS - IPD' and raw_data.concept_id !=0), 1, 0))  as 'RHS - IPD',
SUM(IF((raw_data.answer = 'RHS - IMNCI' and raw_data.concept_id !=0), 1, 0))  as 'RHS - IMNCI',
SUM(IF((raw_data.answer = 'RHS - NUTRITION' and raw_data.concept_id !=0), 1, 0))  as 'RHS - Nutrition',
SUM(IF((raw_data.answer = 'RHS - Immunization' and raw_data.concept_id !=0), 1, 0))  as 'RHS - Immunization',
SUM(IF((raw_data.answer = 'RHS - Safe motherhood' and raw_data.concept_id !=0), 1, 0))  as 'RHS - Safe motherhood',
SUM(IF((raw_data.answer = 'RHS - PEN' and raw_data.concept_id !=0), 1, 0))  as 'RHS - PEN',
SUM(IF((raw_data.answer = 'RHS - PHC/ORC' and raw_data.concept_id !=0), 1, 0))  as 'RHS - PHC/ORC',
SUM(IF((raw_data.answer = 'RHS - Refer others' and raw_data.concept_id !=0), 1, 0))  as 'RHS - Refer others'
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
AND DATE(oAdtType.obs_datetime) BETWEEN DATE('#startDate#') AND DATE('#endDate#') 
AND oAdtType.question_full_name IN ('RHS - Internal Refer in','RHS - Internal Refer out')
union all select 'RHS - Internal Refer in','',''
union all select 'RHS - Internal Refer out','',''
)

raw_data
group by raw_data.question
