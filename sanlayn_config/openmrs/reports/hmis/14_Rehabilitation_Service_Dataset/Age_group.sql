Select
raw_data.question,
raw_data.gender,
SUM(if((age < 1 and answer != ''),1,0)) as '<1',
SUM(if((age >= 1 and age <=5),1,0)) as '1-5',
SUM(if((age >= 6 and age <=17),1,0)) as '6-17',
SUM(if((age >= 18 and age <=59),1,0)) as '18-59',
SUM(if((age > 59),1,0)) as '>59'
from

(
SELECT   
 oAdtType.question_full_name AS question,
 oAdtType.answer_full_name AS answer,
 oAdtType.concept_id as concept_id,
TIMESTAMPDIFF(YEAR, p.birthdate, v.date_started)  AS age,
p.gender
 
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
AND oAdtType.question_full_name IN ('RHS - Visit')

group by p.person_id
union all select 'RHS - Visit','','','','M'
union all select 'RHS - Visit','','','','F'
union all select 'RHS - Visit','','','','O'
)
raw_data
group by 
raw_data.gender