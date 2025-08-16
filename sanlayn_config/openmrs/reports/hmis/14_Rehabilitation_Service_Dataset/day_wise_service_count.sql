select
'Day wise service count' as title,
ifnull((if(count =1,1,0)),0) as '1',
ifnull(SUM(if((count >=2 and count <=7 ),1,0)),0)  as '2-7',
ifnull(SUM(if((count >=8 and count <=15 ),1,0)),0)  as '8-15',
ifnull(SUM(if((count >=16 and count <=30 ),1,0)),0)  as '16-30',
ifnull(SUM(if((count >30),1,0)),0)  as '2-7'
from
(
select  
count(raw_data.person_id) as count
from
(
SELECT 
  p.person_id, 
  p.gender,
DATE(oAdtType.obs_datetime),
pi.identifier 

FROM
 (
 person p 
 left join patient_identifier pi on pi.patient_id = p.person_id
JOIN visit v ON p.person_id = v.patient_id  
JOIN encounter e ON v.visit_id = e.visit_id
JOIN nonVoidedQuestionAnswerObs oAdtType ON e.encounter_id = oAdtType.encounter_id
)  
WHERE
! p.voided AND ! v.voided AND ! e.voided
AND DATE(oAdtType.obs_datetime) BETWEEN DATE('#startDate#') AND DATE('#endDate#') 
AND oAdtType.question_full_name IN ('RHS - Visit') 
group by p.person_id,DATE(oAdtType.obs_datetime)
 
 ) raw_data 
 
 group by raw_data.person_id
 
  
 )final_data