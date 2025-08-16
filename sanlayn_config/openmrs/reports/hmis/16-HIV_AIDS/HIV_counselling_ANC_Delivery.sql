Select 
IFNULL(SUM(if(counseling = 'True',1,0)),0) as 'Total Counsel',
IFNULL(SUM(if(result = 'Positive',1,0)),0) as 'Total Positive',
IFNULL(SUM(if(test = 'True',1,0)),0) as 'Total Tested',
IFNULL(SUM(if((ART = 'True' and Delivery is null),1,0)),0) as 'ART Before Delivery',
IFNULL(SUM(if((ART = 'True' and Delivery is not null),1,0)),0) as 'ART After Delivery'

from
(
SELECT  
p.person_id, 
pi.identifier,
oAdtType3.answer_full_name AS 'counseling',
oAdtType1.answer_full_name AS 'test',
oAdtType2.answer_full_name AS 'result',
oAdtType4.answer_full_name AS 'ART',
oAdtType5.answer_full_name AS 'Delivery'

  FROM 
(
person p 
left join patient_identifier pi on pi.patient_id = p.person_id
JOIN visit v ON p.person_id = v.patient_id  
JOIN encounter e ON v.visit_id = e.visit_id
JOIN nonVoidedQuestionObs oAdtType ON e.encounter_id = oAdtType.encounter_id
left join nonVoidedQuestionAnswerObs oAdtType1 ON oAdtType1.question_full_name = 'ANC-HIV testing' and e.encounter_id = oAdtType1.encounter_id
left join nonVoidedQuestionAnswerObs oAdtType2 ON oAdtType2.question_full_name = 'ANC-HIV test result' and e.encounter_id = oAdtType2.encounter_id
left join nonVoidedQuestionAnswerObs oAdtType3 ON oAdtType3.question_full_name = 'ANC-HIV counseling' and e.encounter_id = oAdtType3.encounter_id
left join nonVoidedQuestionAnswerObs oAdtType4 ON oAdtType4.question_full_name = 'ANC-ART started' and e.encounter_id = oAdtType4.encounter_id
left join nonVoidedQuestionAnswerObs oAdtType5 ON oAdtType5.question_full_name = 'Delivery-Delivery service done by' and e.encounter_id = oAdtType5.encounter_id
)  
WHERE
! p.voided AND ! v.voided AND ! e.voided
AND DATE(oAdtType.obs_datetime) BETWEEN DATE('#startDate#') AND DATE('#endDate#') 
AND oAdtType.question_full_name IN ('ANC note')
) raw_data