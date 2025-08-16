
select 

age ,
 SUM( final_data.`First FCHV`) as 'First FCHV',
 SUM( final_data.`First Health Post`) as 'First Health Post',
 SUM( final_data.`Re-visit FCHV`) as 'Re-visit FCHV',
 SUM( final_data.`Re-visit Health Post`) as 'Re-visit Health Post',
 SUM( final_data.`Third FCHV`) as 'Third FCHV',
 SUM( final_data.`Third Health Post`) as 'Third Health Post'

from
(
Select  
 (
    CASE 
        WHEN age >=6 && age <=11 THEN '6-11'
        WHEN age >=12 && age <=17 THEN '12-17'
        WHEN age >=18 && age <=23 THEN '18-23'
        ELSE 'Other'
    END) AS age,
SUM(IF((visit = 'New' and fchv = 'TRUE'), 1, 0)) AS 'First FCHV',
SUM(IF((visit = 'New' and fchv = 'FALSE'), 1, 0)) AS 'First Health Post',
SUM(IF((visit = 'Re-visit' and fchv = 'TRUE'), 1, 0)) AS 'Re-visit FCHV',
SUM(IF((visit = 'Re-visit' and fchv = 'FALSE'), 1, 0)) AS 'Re-visit Health Post',
SUM(IF((visit = 'Nutrition-More Than 1 Visit In a Month' and fchv = 'TRUE'), 1, 0)) AS 'Third FCHV',
SUM(IF((visit = 'Nutrition-More Than 1 Visit In a Month' and fchv = 'FALSE'), 1, 0)) AS 'Third Health Post' 
from 
(SELECT 


 DISTINCT
 TIMESTAMPDIFF(MONTH, p.birthdate, v.date_started) AS age,
 oAdtType.answer_full_name AS visit,
  oAnsdtType.answer_full_name AS fchv FROM 
(
person p 
JOIN visit v ON p.person_id = v.patient_id
JOIN encounter e ON v.visit_id = e.visit_id
JOIN nonVoidedQuestionAnswerObs oAdtType ON e.encounter_id = oAdtType.encounter_id
)
 left join nonVoidedQuestionAnswerObs oAnsdtType 
 on  oAnsdtType.question_full_name IN ('Nutrition-Bal vita provided by fchv')
 and  e.encounter_id = oAnsdtType.encounter_id 
WHERE
! p.voided AND ! v.voided AND ! e.voided
AND DATE(oAdtType.obs_datetime) BETWEEN DATE('#startDate#') AND DATE('#endDate#')
AND TIMESTAMPDIFF(MONTH, p.birthdate, v.date_started) < 23
AND oAdtType.question_full_name IN ('Nutrition-Visit type') 

Union Select '7',0,0
Union Select '13',0,0
Union Select '20',0,0
Union Select '25',0,0
) full_data 

group by full_data.age
order by full_data.age
) final_data

group by age
order by FIELD(age,'6-11','12-17','18-23','Other')
