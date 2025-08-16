SELECT
final.`Age Group` AS 'Age Group',
final.`Sex` AS 'Sex',
-- (CASE
-- WHEN final.`Age Group` = '< 6 month' AND final.`Sex` = 'F' THEN im1.female_less_than_six
-- WHEN final.`Age Group` = '< 6 month' AND final.`Sex` = 'M' THEN im1.male_less_than_six
-- WHEN final.`Age Group` = '6-59 month' AND final.`Sex` = 'F' THEN im1.female_more_than_six
-- WHEN final.`Age Group` = '6-59 month' AND final.`Sex` = 'M' THEN im1.male_more_than_six
-- ELSE 0
-- END) AS 
`Children at End of Last Month SAM`,
`Children at End of Last Month MAM`, 
SUM(final.`New Admission SAM`) AS 'New Admission SAM', 
SUM(final.`New Admission MAM`) AS 'New Admission MAM', 
SUM(final.`Re-admission SAM`) AS 'Re-admission SAM',
SUM(final.`Re-admission MAM`) AS 'Re-admission MAM',
SUM(final.`Transfer In SAM`) AS 'Transfer In SAM',
SUM(final.`Transfer In MAM`) AS 'Transfer In MAM',
SUM(final.`Discharge - Recovered SAM`) AS 'Discharge - Recovered SAM',
SUM(final.`Discharge - Recovered MAM`) AS 'Discharge - Recovered MAM',
SUM(final.`Discharge - Death SAM`) AS 'Discharge - Death SAM',
SUM(final.`Discharge - Death MAM`) AS 'Discharge - Death MAM', 
SUM(final.`Discharge - Not Improved SAM`) AS 'Discharge - Not Improved SAM',
SUM(final.`Discharge - Not Improved MAM`) AS 'Discharge - Not Improved MAM',
SUM(final.`Discharge - Refer to Hospital SAM`) AS 'Discharge - Refer to Hospital SAM',
SUM(final.`Discharge - Refer to Hospital MAM`) AS 'Discharge - Refer to Hospital MAM',
SUM(final.`Transfer Out SAM`) AS 'Transfer Out SAM',
SUM(final.`Transfer Out MAM`) AS 'Transfer Out MAM' ,
SUM(final.`Discharge-Defaulter SAM`) AS 'Discharge-Defaulter SAM',
SUM(final.`Discharge-Defaulter MAM`) AS 'Discharge-Defaulter MAM' ,
(CASE
WHEN final.`Age Group` = '< 6 month' AND final.`Sex` = 'F' THEN im1.female_less_than_six
WHEN final.`Age Group` = '< 6 month' AND final.`Sex` = 'M' THEN im1.male_less_than_six
WHEN final.`Age Group` = '6-59 month' AND final.`Sex` = 'F' THEN im1.female_more_than_six
WHEN final.`Age Group` = '6-59 month' AND final.`Sex` = 'M' THEN im1.male_more_than_six
ELSE 0
END) 
+  SUM(final.`New Admission SAM`) + 
  SUM(final.`Re-admission SAM`) +  
  SUM(final.`Transfer In SAM`) + 
  SUM(final.`Discharge - Recovered SAM`) -  
  SUM(final.`Discharge - Death SAM`) -  
  SUM(final.`Discharge - Not Improved SAM`) -  
  SUM(final.`Discharge - Refer to Hospital SAM`) - 
  SUM(final.`Discharge-Defaulter SAM`) - 
  SUM(final.`Transfer Out SAM`)  AS 'Children at End of This Month SAM',
  (CASE
WHEN final.`Age Group` = '< 6 month' AND final.`Sex` = 'F' THEN im1.female_less_than_six
WHEN final.`Age Group` = '< 6 month' AND final.`Sex` = 'M' THEN im1.male_less_than_six
WHEN final.`Age Group` = '6-59 month' AND final.`Sex` = 'F' THEN im1.female_more_than_six
WHEN final.`Age Group` = '6-59 month' AND final.`Sex` = 'M' THEN im1.male_more_than_six
ELSE 0
END) 
+   
  SUM(final.`New Admission MAM`) + 
  SUM(final.`Re-admission MAM`) +  
  SUM(final.`Transfer In MAM`) -   
  SUM(final.`Discharge - Recovered MAM`) -  
  SUM(final.`Discharge - Death MAM`) -    
  SUM(final.`Discharge - Not Improved MAM`) -  
  SUM(final.`Discharge - Refer to Hospital MAM`) - 
  SUM(final.`Discharge-Defaulter MAM`) - 
  SUM(final.`Transfer Out MAM`) AS 'Children at End of This Month MAM'
FROM
(SELECT
withoutDefaulters.*
-- defaultersCount.Count AS 'Discharge - Defaulter'
FROM
(SELECT
IF(age < 6, '< 6 month', '6-59 month') AS 'Age Group',
gender AS 'Sex',
0 AS 'Children at End of Last Month SAM',
0 AS 'Children at End of Last Month MAM',
SUM(IF((adtType = 'NEW' and oAnsdtType = 'SAM'), 1, 0)) AS 'New Admission SAM', 
SUM(IF((adtType = 'NEW' and oAnsdtType = 'MAM'), 1, 0)) AS 'New Admission MAM', 
SUM(IF((adtType = 'IMAM-Defaulter' and oAnsdtType = 'MAM'), 1, 0)) AS 'Re-admission MAM',
SUM(IF((adtType = 'IMAM-Defaulter' and oAnsdtType = 'SAM'), 1, 0)) AS 'Re-admission SAM',
SUM(IF((adtType = 'Transfer in' and oAnsdtType = 'SAM'), 1, 0)) AS 'Transfer In SAM',
SUM(IF((adtType = 'Transfer in' and oAnsdtType = 'MAM'), 1, 0)) AS 'Transfer In MAM',
SUM(IF((adtType = 'Recovered'  and oAnsdtType = 'SAM'), 1, 0)) AS 'Discharge - Recovered SAM',
SUM(IF((adtType = 'Recovered'  and oAnsdtType = 'MAM'), 1, 0)) AS 'Discharge - Recovered MAM',
SUM(IF((adtType = 'Death'   and oAnsdtType = 'SAM'), 1, 0)) AS 'Discharge - Death SAM',
SUM(IF((adtType = 'Death'   and oAnsdtType = 'MAM'), 1, 0)) AS 'Discharge - Death MAM',
SUM(IF((adtType = 'Not improved' and oAnsdtType = 'SAM'), 1, 0)) AS 'Discharge - Not Improved SAM',
SUM(IF((adtType = 'Not improved' and oAnsdtType = 'MAM'), 1, 0)) AS 'Discharge - Not Improved MAM',
SUM(IF((adtType = 'IMAM-Refer to hospital' and oAnsdtType = 'SAM'), 1, 0)) AS 'Discharge - Refer to Hospital SAM',
SUM(IF((adtType = 'IMAM-Refer to hospital' and oAnsdtType = 'MAM'), 1, 0)) AS 'Discharge - Refer to Hospital MAM',
SUM(IF((adtType = 'Transfer out to' and oAnsdtType = 'SAM'), 1, 0)) AS 'Transfer Out SAM',
SUM(IF((adtType = 'Transfer out to' and oAnsdtType = 'MAM'), 1, 0)) AS 'Transfer Out MAM',
SUM(IF((adtType = 'Not applicable' and oAnsdtType = 'SAM'), 1, 0)) AS 'Discharge-Defaulter SAM',
SUM(IF((adtType = 'Not applicable' and oAnsdtType = 'MAM'), 1, 0)) AS 'Discharge-Defaulter MAM',
0 AS 'Children at End of This Month'
FROM
(


SELECT
 DISTINCT
TIMESTAMPDIFF(MONTH, p.birthdate, v.date_started) AS age,
oAdtType.answer_full_name AS adtType,
oAnsdtType.answer_full_name AS oAnsdtType,
p.gender AS gender,
IF(oAdtType.obs_datetime >= DATE('#startDate#'), p.person_id, NULL) thisMonthPatient,
IF(oAdtType.obs_datetime < DATE('#startDate#'), p.person_id, NULL) lastMonthPatient


FROM
(
person p

JOIN visit v ON p.person_id = v.patient_id
JOIN encounter e ON v.visit_id = e.visit_id
JOIN nonVoidedQuestionAnswerObs oAdtType ON e.encounter_id = oAdtType.encounter_id
)
left join nonVoidedQuestionAnswerObs oAnsdtType on  oAnsdtType.question_full_name IN ('IMAM-Indicator') and  e.encounter_id = oAnsdtType.encounter_id


WHERE
! p.voided AND ! v.voided AND ! e.voided
AND DATE(oAdtType.obs_datetime) BETWEEN DATE('#startDate#') AND DATE('#endDate#')
AND TIMESTAMPDIFF(MONTH, p.birthdate, v.date_started) < 60
AND oAdtType.question_full_name IN ('IMAM-Admission type' , 'IMAM-Status at discharge')



) IMAM
GROUP BY `Age Group` , `Sex`
UNION ALL SELECT '< 6 month', 'F', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
UNION ALL SELECT '< 6 month', 'M', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
UNION ALL SELECT '< 6 month', 'O', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
UNION ALL SELECT '6-59 month', 'F', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
UNION ALL SELECT '6-59 month', 'M', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
UNION ALL SELECT '6-59 month', 'O', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
) AS withoutDefaulters
 ) final
LEFT JOIN imam im1 on 1=1
GROUP BY final.`Age Group` , final.`Sex`
ORDER BY final.`Age Group` DESC;
