SELECT 'RHS - Visit' as question, 
SUM(IF((raw_rhs_data.answer = 'RHS - New'),1,0)) as 'RHIS-New',
SUM(IF((raw_rhs_data.answer = 'RHS - Follow up'),1,0)) as 'RHS-Followup',
SUM(IF((raw_rhs_data.answer = 'RHS - Foreigner'),1,0)) as 'RHS-Foreigner'

FROM
(SELECT 
Distinct p.person_id,
oAdtType.question_full_name as question,
 oAdtType.answer_full_name as answer
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
AND oAdtType.question_full_name IN ('RHS - Visit')
) as raw_rhs_data 
group by raw_rhs_data.question;