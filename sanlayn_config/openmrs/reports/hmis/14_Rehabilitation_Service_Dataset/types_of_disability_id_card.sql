
SELECT 
    raw_data.question,
    raw_data.gender,
    SUM(IF((raw_data.answer = 'RHS - A-Red (Completely disabled)'
            AND raw_data.concept_id != 0),
        1,
        0)) AS 'RHS - A-Red (Completely disabled)',
    SUM(IF((raw_data.answer = 'RHS - B-Blue (Extremely handicapped disability)'
            AND raw_data.concept_id != 0),
        1,
        0)) AS 'RHS - B-Blue (Extremely handicapped disability)',
    SUM(IF((raw_data.answer = 'RHS - C-Yellow (Moderate disability)'
            AND raw_data.concept_id != 0),
        1,
        0)) AS 'RHS - C-Yellow (Moderate disability)',
    SUM(IF((raw_data.answer = 'RHS - D-White (General disability)'
            AND raw_data.concept_id != 0),
        1,
        0)) AS 'RHS - D-White (General disability)'
FROM
    (SELECT 
        oAdtType.question_full_name AS question,
            oAdtType.answer_full_name AS answer,
            oAdtType.concept_id AS concept_id,
            p.gender
    FROM
        (person p
    JOIN visit v ON p.person_id = v.patient_id
    JOIN encounter e ON v.visit_id = e.visit_id
    JOIN nonVoidedQuestionAnswerObs oAdtType ON e.encounter_id = oAdtType.encounter_id)
    WHERE
        ! p.voided AND ! v.voided AND ! e.voided
            AND DATE(oAdtType.obs_datetime) BETWEEN  DATE('#startDate#') AND DATE('#endDate#')
            AND oAdtType.answer_full_name IN ('RHS - A-Red (Completely disabled)' , 'RHS - B-Blue (Extremely handicapped disability)', 'RHS - C-Yellow (Moderate disability)', 'RHS - D-White (General disability)')
  union all select 'RHS - Types of Disability ID card','','0','F'
  union all select 'RHS - Types of Disability ID card','','0','M'    
  union all select 'RHS - Types of Disability ID card','','0','O'    
            ) raw_data
GROUP BY raw_data.question,raw_data.gender
