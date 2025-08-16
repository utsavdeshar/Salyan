Select 
ifnull(sum(`1`),0)  as '1',
ifnull(sum(`2-15`),0)  as '2-15' ,
ifnull(sum(`16-39`),0)  as '16-39' ,
ifnull(sum(`40-69`),0)  as '40-69' ,
ifnull(sum(`>69`),0)  as '>69', 
ifnull(sum(`1`+`2-15`+`16-39`+`40-69`+`>69`),0)  as Total 
from
(
SELECT  p.person_id,
  count(p.person_id) as personIdCount,
  ( Case when count(p.person_id)=1 Then count(p.person_id)
     else 0 
 end) as '1',
 (Case when count(p.person_id)>=2 and count(p.person_id)<=15 Then count(p.person_id)
    else 0 
 end)  as '2-15',
  (Case when count(p.person_id)>=16 and count(p.person_id)<=39 Then count(p.person_id)
     else 0 
 end)  as '16-39',
 (Case when count(p.person_id)>=40 and count(p.person_id)<=69 Then count(p.person_id)
     else 0 
 end)  as '40-69',
 (Case when count(p.person_id)>69 Then count(p.person_id)
     else 0 
 end)  as '>69'

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
AND oAdtType.question_full_name IN ('RHS - Visit') group by p.person_id
) as raw_data;