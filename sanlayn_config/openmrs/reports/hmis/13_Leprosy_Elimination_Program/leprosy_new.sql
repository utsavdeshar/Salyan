-- for last month cases
-- SELECT 
-- 'Last month cases' as cases,
-- SUM(if((types = 'Multi Bacillary' and gender = 'M'),1,0)) as 'MB-Male',
-- SUM(if((types = 'Multi Bacillary' and gender = 'F'),1,0)) as 'MB-Female',
-- SUM(if((types = 'Pauci Bacillary' and gender = 'M'),1,0)) as 'PB-Male',
-- SUM(if((types = 'Pauci Bacillary' and gender = 'F'),1,0)) as 'PB-Female' 
-- FROM
-- (

--  SELECT 
--  oAdtType.answer_full_name as cases,
--  oAdtType1.answer_full_name as types,
--  p.person_id,
--  p.gender
--   FROM 
-- (
-- person p 
-- JOIN visit v ON p.person_id = v.patient_id  
-- JOIN encounter e ON v.visit_id = e.visit_id
-- JOIN nonVoidedQuestionAnswerObs oAdtType ON e.encounter_id = oAdtType.encounter_id
-- left join nonVoidedQuestionAnswerObs oAdtType1 ON e.encounter_id = oAdtType1.encounter_id and oAdtType1.question_full_name IN ('Leprosy, Leprosy Type')
-- )  
-- WHERE
-- ! p.voided AND ! v.voided AND ! e.voided
-- AND DATE(oAdtType.obs_datetime) BETWEEN  DATE( DATE('2022-11-01')- INTERVAL 1 MONTH) AND  DATE( DATE('2022-11-30')- INTERVAL 1 MONTH)
-- AND oAdtType.question_full_name IN ('Leprosy, Case Type')

-- Union all select 'New Patients','','','' 
-- ) raw_data

-- union

-- for total cases visit type wise
SELECT 
raw_data.cases,
SUM(if((types = 'Multi Bacillary' and gender = 'M'),1,0)) as 'MB-Male',
SUM(if((types = 'Multi Bacillary' and gender = 'F'),1,0)) as 'MB-Female',
SUM(if((types = 'Pauci Bacillary' and gender = 'M'),1,0)) as 'PB-Male',
SUM(if((types = 'Pauci Bacillary' and gender = 'F'),1,0)) as 'PB-Female' 
FROM
(

 SELECT 
 oAdtType.answer_full_name as cases,
 oAdtType1.answer_full_name as types,
 p.person_id,
 p.gender
  FROM 
(
person p 
JOIN visit v ON p.person_id = v.patient_id  
JOIN encounter e ON v.visit_id = e.visit_id
JOIN nonVoidedQuestionAnswerObs oAdtType ON e.encounter_id = oAdtType.encounter_id
left join nonVoidedQuestionAnswerObs oAdtType1 ON e.encounter_id = oAdtType1.encounter_id and oAdtType1.question_full_name IN ('Leprosy-Leprosy type')
)  
WHERE
! p.voided AND ! v.voided AND ! e.voided
AND DATE(oAdtType.obs_datetime) BETWEEN  DATE('2022-11-01') AND DATE('2022-11-30') 
AND oAdtType.question_full_name IN ('Leprosy-Case type')

Union all select 'New Patients','','',''
Union all select 'Relapse','','',''
Union all select 'Re-starter','','',''
Union all select 'Transfer in','','',''
Union all select 'Classification Change','','','' 
) raw_data

group by raw_data.cases

 union
 select 

'total cases' as cases,
SUM(`MB-Male`) as 'MB-Male',
SUM(`MB-Female`) as 'MB-Male',
SUM(`PB-Male`) as 'MB-Male',
SUM(`PB-Female`) as 'MB-Male'
 from

(
SELECT 
'Last month cases' as cases,
SUM(if((types = 'Multi Bacillary' and gender = 'M'),1,0)) as 'MB-Male',
SUM(if((types = 'Multi Bacillary' and gender = 'F'),1,0)) as 'MB-Female',
SUM(if((types = 'Pauci Bacillary' and gender = 'M'),1,0)) as 'PB-Male',
SUM(if((types = 'Pauci Bacillary' and gender = 'F'),1,0)) as 'PB-Female' 
FROM
(

 SELECT 
 oAdtType.answer_full_name as cases,
 oAdtType1.answer_full_name as types,
 p.person_id,
 p.gender
  FROM 
(
person p 
JOIN visit v ON p.person_id = v.patient_id  
JOIN encounter e ON v.visit_id = e.visit_id
JOIN nonVoidedQuestionAnswerObs oAdtType ON e.encounter_id = oAdtType.encounter_id
left join nonVoidedQuestionAnswerObs oAdtType1 ON e.encounter_id = oAdtType1.encounter_id and oAdtType1.question_full_name IN ('Leprosy-Leprosy type')
)  
WHERE
! p.voided AND ! v.voided AND ! e.voided
AND DATE(oAdtType.obs_datetime) BETWEEN  DATE( DATE('2022-11-01')- INTERVAL 1 MONTH) AND  DATE( DATE('2022-11-30')- INTERVAL 1 MONTH)
AND oAdtType.question_full_name IN ('Leprosy-Case type')

Union all select 'New Patients','','','' 
) raw_data


-- for total cases
union
SELECT 
raw_data.cases,
SUM(if((types = 'Multi Bacillary' and gender = 'M'),1,0)) as 'MB-Male',
SUM(if((types = 'Multi Bacillary' and gender = 'F'),1,0)) as 'MB-Female',
SUM(if((types = 'Pauci Bacillary' and gender = 'M'),1,0)) as 'PB-Male',
SUM(if((types = 'Pauci Bacillary' and gender = 'F'),1,0)) as 'PB-Female' 
FROM
(

 SELECT 
 oAdtType.answer_full_name as cases,
 oAdtType1.answer_full_name as types,
 p.person_id,
 p.gender
  FROM 
(
person p 
JOIN visit v ON p.person_id = v.patient_id  
JOIN encounter e ON v.visit_id = e.visit_id
JOIN nonVoidedQuestionAnswerObs oAdtType ON e.encounter_id = oAdtType.encounter_id
left join nonVoidedQuestionAnswerObs oAdtType1 ON e.encounter_id = oAdtType1.encounter_id and oAdtType1.question_full_name IN ('Leprosy-Leprosy type')
)  
WHERE
! p.voided AND ! v.voided AND ! e.voided
AND DATE(oAdtType.obs_datetime) BETWEEN  DATE('2022-11-01') AND DATE('2022-11-30') 
AND oAdtType.question_full_name IN ('Leprosy-Case type')

Union all select 'New Patients','','',''
Union all select 'Relapse','','',''
Union all select 'Re-starter','','',''
Union all select 'Transfer in','','',''
Union all select 'Classification Change','','','' 
) raw_data
 

)data_1
 union
 
 SELECT 
raw_data.cases,
SUM(if((types = 'Multi Bacillary' and gender = 'M'),1,0)) as 'MB-Male',
SUM(if((types = 'Multi Bacillary' and gender = 'F'),1,0)) as 'MB-Female',
SUM(if((types = 'Pauci Bacillary' and gender = 'M'),1,0)) as 'PB-Male',
SUM(if((types = 'Pauci Bacillary' and gender = 'F'),1,0)) as 'PB-Female' 
FROM
(

 SELECT 
 oAdtType.answer_full_name as cases,
 oAdtType1.answer_full_name as types,
 p.person_id,
 p.gender
  FROM 
(
person p 
JOIN visit v ON p.person_id = v.patient_id  
JOIN encounter e ON v.visit_id = e.visit_id
JOIN nonVoidedQuestionAnswerObs oAdtType ON e.encounter_id = oAdtType.encounter_id
left join nonVoidedQuestionAnswerObs oAdtType1 ON e.encounter_id = oAdtType1.encounter_id and oAdtType1.question_full_name IN ('Leprosy-Leprosy type')
)  
WHERE
! p.voided AND ! v.voided AND ! e.voided
AND DATE(oAdtType.obs_datetime) BETWEEN  DATE('2022-11-01') AND DATE('2022-11-30') 
AND oAdtType.question_full_name IN ('Leprosy-Patient deduction type')

Union all select 'Release from Treatment – RFT','','',''
Union all select 'Transfer out to','','',''
Union all select 'Leprosy-Defaulter','','',''
Union all select 'Other Deduction - OD','','',''
) raw_data

group by raw_data.cases

 union 
 SELECT 
'0-14 years New Patient' as cases,
SUM(if((types = 'Multi Bacillary' and gender = 'M'),1,0)) as 'MB-Male',
SUM(if((types = 'Multi Bacillary' and gender = 'F'),1,0)) as 'MB-Female',
SUM(if((types = 'Pauci Bacillary' and gender = 'M'),1,0)) as 'PB-Male',
SUM(if((types = 'Pauci Bacillary' and gender = 'F'),1,0)) as 'PB-Female' 
FROM
(

 SELECT 
 oAdtType.answer_full_name as cases,
 oAdtType1.answer_full_name as types,
 p.person_id,
 p.gender
  FROM 
(
person p 
JOIN visit v ON p.person_id = v.patient_id  
JOIN encounter e ON v.visit_id = e.visit_id
JOIN nonVoidedQuestionAnswerObs oAdtType ON e.encounter_id = oAdtType.encounter_id
left join nonVoidedQuestionAnswerObs oAdtType1 ON e.encounter_id = oAdtType1.encounter_id and oAdtType1.question_full_name IN ('Leprosy-Leprosy type')
)  
WHERE
! p.voided AND ! v.voided AND ! e.voided
AND DATE(oAdtType.obs_datetime) BETWEEN  DATE('2022-11-01') AND DATE('2022-11-30') 
AND oAdtType.question_full_name IN ('Leprosy-Case type')
AND  oAdtType.answer_full_name ='New Patients'
AND TIMESTAMPDIFF(YEAR, p.birthdate, v.date_started)  <=14

Union all select 'New Patients','','','' 
) raw_data

group by raw_data.cases

union

SELECT 
raw_data.cases,
SUM(if((types = 'Multi Bacillary' and gender = 'M'),1,0)) as 'MB-Male',
SUM(if((types = 'Multi Bacillary' and gender = 'F'),1,0)) as 'MB-Female',
SUM(if((types = 'Pauci Bacillary' and gender = 'M'),1,0)) as 'PB-Male',
SUM(if((types = 'Pauci Bacillary' and gender = 'F'),1,0)) as 'PB-Female' 
FROM
(

 SELECT 
 oAdtType.answer_full_name as cases,
 oAdtType1.answer_full_name as types,
 p.person_id,
 p.gender
  FROM 
(
person p 
JOIN visit v ON p.person_id = v.patient_id  
JOIN encounter e ON v.visit_id = e.visit_id
JOIN nonVoidedQuestionAnswerObs oAdtType ON e.encounter_id = oAdtType.encounter_id
left join nonVoidedQuestionAnswerObs oAdtType1 ON e.encounter_id = oAdtType1.encounter_id and oAdtType1.question_full_name IN ('Leprosy-Leprosy type')
)  
WHERE
! p.voided AND ! v.voided AND ! e.voided
AND DATE(oAdtType.obs_datetime) BETWEEN  DATE('2022-11-01') AND DATE('2022-11-30') 
AND oAdtType.question_full_name IN ('Lepra reaction')

Union all select 'Lepra reaction - Type 1','','',''
Union all select 'Lepra reaction - Type 2','','',''
Union all select 'Lepra reaction - Neuritiesr','','','' 
) raw_data

group by raw_data.cases

 
 