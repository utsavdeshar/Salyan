 SELECT  'RHS - Diagnosis' as question, 
SUM(IF((raw_rhs_data.answer = 'RHS - Certain infectious or parasitic diseases (1A00-1H0Z)'),1,0)) as 'Certain infectious or parasitic diseases (1A00-1H0Z)',
SUM(IF((raw_rhs_data.answer = 'RHS - Neoplasms (2A00-2F9Z)'),1,0)) as 'Neoplasms (2A00-2F9Z)',
SUM(IF((raw_rhs_data.answer = 'Diseases of the blood or blood-forming organs (3A00-3C0Z)'),1,0)) as 'Diseases of the blood or blood-forming organs (3A00-3C0Z)',
SUM(IF((raw_rhs_data.answer = 'RHS - Diseases of the immune system (4A00-4B4Z)'),1,0)) as 'RHS - Diseases of the immune system (4A00-4B4Z)',
SUM(IF((raw_rhs_data.answer = 'RHS - Endocrine, nutritional or metabolic diseases (5A00-5D46)'),1,0)) as 'RHS - Endocrine, nutritional or metabolic diseases (5A00-5D46))',
SUM(IF((raw_rhs_data.answer = 'RHS - Mental, behavioural or neurodevelopmental disorders (6A00-6E8Z)'),1,0)) as 'RHS - Mental, behavioural or neurodevelopmental disorders (6A00-6E8Z)',
SUM(IF((raw_rhs_data.answer = 'RHS - Sleep-wake disorders (7A00-7B2Z)'),1,0)) as 'RHS - Sleep-wake disorders (7A00-7B2Z)',
SUM(IF((raw_rhs_data.answer = 'RHS - Diseases of the nervous system (8A00-8E7Z)'),1,0)) as 'RHS - Diseases of the nervous system (8A00-8E7Z)',
SUM(IF((raw_rhs_data.answer = 'RHS - Diseases of the visual system (9A00-9E1Z)'),1,0)) as 'RHS - Diseases of the visual system (9A00-9E1Z)',
SUM(IF((raw_rhs_data.answer = 'RHS - Diseases of the ear or mastoid process (AA00-AC0Z)'),1,0)) as 'RHS - Diseases of the ear or mastoid process (AA00-AC0Z)',
SUM(IF((raw_rhs_data.answer = 'RHS - Diseases of the circulatory system (BA00-BE2Z)'),1,0)) as 'RHS - Diseases of the circulatory system (BA00-BE2Z)',
SUM(IF((raw_rhs_data.answer = 'RHS - Diseases of the respiratory system (CA00-CB7Z)'),1,0)) as 'RHS - Diseases of the respiratory system (CA00-CB7Z)',
SUM(IF((raw_rhs_data.answer = 'RHS - Diseases of the digestive system (DA00-DE2Z)'),1,0)) as 'RHS - Diseases of the digestive system (DA00-DE2Z)',
SUM(IF((raw_rhs_data.answer = 'RHS - Diseases of the skin (EA00-EM0Z)'),1,0)) as 'RHS - Diseases of the skin (EA00-EM0Z))',
SUM(IF((raw_rhs_data.answer = 'RHS - Diseases of the musculoskeletal system or connective tissue (FA00-FC0Z)'),1,0)) as 'RHS - Diseases of the musculoskeletal system or connective tissue (FA00-FC0Z)',
SUM(IF((raw_rhs_data.answer = 'RHS - Diseases of the genitourinary system (GA00-GC8Z)'),1,0)) as 'RHS - Diseases of the genitourinary system (GA00-GC8Z)',
SUM(IF((raw_rhs_data.answer = 'RHS - Conditions related to sexual health (HA00-HA8Z)'),1,0)) as 'RHS - Conditions related to sexual health (HA00-HA8Z)',
SUM(IF((raw_rhs_data.answer = 'RHS - Pregnancy, childbirth or the puerperium (JA00-JB6Z)'),1,0)) as 'RHS - Pregnancy, childbirth or the puerperium (JA00-JB6Z)',
SUM(IF((raw_rhs_data.answer = 'RHS - Certain conditions originating in the perinatal peroid (KA00-KD5Z)'),1,0)) as 'RHS - Certain conditions originating in the perinatal peroid (KA00-KD5Z)',
SUM(IF((raw_rhs_data.answer = 'RHS - Developmental anomalies (LA00-LD9Z)'),1,0)) as 'RHS - Developmental anomalies (LA00-LD9Z)',
SUM(IF((raw_rhs_data.answer = 'RHS - Symptoms, signs or clinical findings, not elsewhere classified (MA00-MH2Y)'),1,0)) as 'RHS - Symptoms, signs or clinical findings, not elsewhere classified (MA00-MH2Y)',
SUM(IF((raw_rhs_data.answer = 'RHS - Injury, poisoning or certain other consequences of external causes (NA00-NF2Z)'),1,0)) as 'RHS - Injury, poisoning or certain other consequences of external causes (NA00-NF2Z)',
SUM(IF((raw_rhs_data.answer = 'RHS - External causes of morbidity or mortality (PA00-PL2Z)'),1,0)) as 'RHS - External causes of morbidity or mortality (PA00-PL2Z)',
SUM(IF((raw_rhs_data.answer = 'RHS - Factors influencing health status or contact with health services (QA00-QF4Z)'),1,0)) as 'RHS - Factors influencing health status or contact with health services (QA00-QF4Z)',
SUM(IF((raw_rhs_data.answer = 'RHS - Codes for special purposes (RA00-RA26)'),1,0)) as 'RHS - Codes for special purposes (RA00-RA26)',
SUM(IF((raw_rhs_data.answer = 'RHS - Supplementary Chapter Traditional Medicine Conditions - Module I (SA00-SJ3Z)'),1,0)) as 'RHS - Supplementary Chapter Traditional Medicine Conditions - Module I (SA00-SJ3Z)'






FROM
 (
 
 SELECT oAdtType.question_full_name as question,
 oAdtType.answer_full_name as answer,
 count(oAdtType.answer_full_name) as count
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
AND oAdtType.question_full_name IN ('RHS - Diagnosis')) as raw_rhs_data;