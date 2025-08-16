SELECT   
raw_data.question_full_name AS question,
sum(if(raw_data.answer_full_name = 'RHS - Critical thinking related',1,0)) as 'RHS - Critical thinking related',
sum(if(raw_data.answer_full_name = 'RHS - Vision related',1,0)) as 'RHS - Vision related',
sum(if(raw_data.answer_full_name = 'RHS - Hearing related',1,0)) as 'RHS - Hearing related',
sum(if(raw_data.answer_full_name = 'RHS - Communication related',1,0)) as 'RHS - Communication related',
sum(if(raw_data.answer_full_name = 'RHS - Comprehension and interpretation related',1,0)) as 'RHS - Comprehension and interpretation related',
sum(if(raw_data.answer_full_name = 'RHS - Enviroment related',1,0)) as 'RHS - Enviroment related'

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
AND DATE(oAdtType.obs_datetime) BETWEEN  DATE('#startDate#') AND DATE('#endDate#') 
AND oAdtType.question_full_name IN ('RHS - Support equipment need','RHS - Support equipment receive')

group by  oAdtType.question_full_name

union all select 'RHS - Support equipment need',''
union all select 'RHS - Support equipment receive',''
) raw_data

group by  raw_data.question_full_name

