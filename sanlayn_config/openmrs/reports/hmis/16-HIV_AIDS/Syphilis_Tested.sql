Select 
IFNULL(SUM(if(tested = 'True',1,0)),0) as 'Total Tested',
IFNULL(SUM(if(result = 'Positive',1,0)),0) as 'Total Positive',
IFNULL(SUM(if(treated = 'True',1,0)),0) as 'Total Treated'

from
(
SELECT   
p.person_id, 
oAdtType.answer_full_name AS 'tested',
oAdtType1.answer_full_name AS 'result',
oAdtType2.answer_full_name AS 'treated'

  FROM 
(
person p 
JOIN visit v ON p.person_id = v.patient_id  
JOIN encounter e ON v.visit_id = e.visit_id
JOIN nonVoidedQuestionAnswerObs oAdtType ON e.encounter_id = oAdtType.encounter_id
left join nonVoidedQuestionAnswerObs oAdtType1 ON oAdtType1.question_full_name = 'ANC-Second result' and e.encounter_id = oAdtType1.encounter_id
left join nonVoidedQuestionAnswerObs oAdtType2 ON oAdtType2.question_full_name = 'ANC-Syphilis tereated' and e.encounter_id = oAdtType2.encounter_id
)  
WHERE
! p.voided AND ! v.voided AND ! e.voided
AND DATE(oAdtType.obs_datetime) BETWEEN DATE('#startDate#') AND DATE('#endDate#') 
AND oAdtType.question_full_name IN ('ANC-Syphilis tested')
) raw_data