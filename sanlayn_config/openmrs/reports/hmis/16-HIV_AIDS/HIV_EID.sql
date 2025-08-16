
select 
count(*) as 'Total',
ifnull(SUM(if((exposed='Under 24 hour' and result= 'Positive' ),1,0)),0) as 'Positive under 24 hour',
ifnull(SUM(if((exposed='Within 2 months' and result= 'Positive' ),1,0)),0) as 'Positive in 0-2 month',
ifnull(SUM(if(((exposed='2 to 9 months' or exposed='9 to 18 months') and result= 'Positive' ),1,0)),0) as 'Positive in 2-18 month',
ifnull(SUM(if((exposed is not null and result= 'Positive' ),1,0)),0) as 'Positive in 0-18 month'
 from
(SELECT  
p.person_id, 
pi.identifier, 
oAdtType1.answer_full_name AS 'exposed',
oAdtType2.answer_full_name AS 'result'

  FROM 
(
person p 
left join patient_identifier pi on pi.patient_id = p.person_id
JOIN visit v ON p.person_id = v.patient_id  
JOIN encounter e ON v.visit_id = e.visit_id
JOIN nonVoidedQuestionObs oAdtType ON e.encounter_id = oAdtType.encounter_id
left join nonVoidedQuestionAnswerObs oAdtType1 ON oAdtType1.question_full_name = 'ART-Early infant diagnosis' and e.encounter_id = oAdtType1.encounter_id
left join nonVoidedQuestionAnswerObs oAdtType2 ON oAdtType2.question_full_name = 'HIVTC Intake-PCR test result' and e.encounter_id = oAdtType2.encounter_id 
)  
WHERE
! p.voided AND ! v.voided AND ! e.voided
AND DATE(oAdtType.obs_datetime) BETWEEN DATE('#startDate#') AND DATE('#endDate#') 
AND oAdtType.question_full_name IN ('HIV Treatment and Care Intake Template')
) raw_data