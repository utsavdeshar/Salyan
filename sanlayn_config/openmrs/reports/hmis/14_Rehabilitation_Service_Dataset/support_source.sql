
SELECT 
    raw_data.question,
    SUM(IF((raw_data.answer = 'RHS - Self purchase'
            AND raw_data.concept_id != 0),
        1,
        0)) AS 'RHS - Self purchase',
    SUM(IF((raw_data.answer = 'Hospital'
            AND raw_data.concept_id != 0),
        1,
        0)) AS 'Hospital',
    SUM(IF((raw_data.answer = 'RHS - Other government office'
            AND raw_data.concept_id != 0),
        1,
        0)) AS 'RHS - Other government office',
    SUM(IF((raw_data.answer = 'RHS - Rehabitation center'
            AND raw_data.concept_id != 0),
        1,
        0)) AS 'RHS - Rehabitation center',
    SUM(IF((raw_data.answer = 'RHS - Other organization'
            AND raw_data.concept_id != 0),
        1,
        0)) AS 'RHS - Other organization'
FROM
    (SELECT 
        oAdtType.question_full_name AS question,
            oAdtType.answer_full_name AS answer,
            oAdtType.concept_id AS concept_id
    FROM
        (person p
    JOIN visit v ON p.person_id = v.patient_id
    JOIN encounter e ON v.visit_id = e.visit_id
    JOIN nonVoidedQuestionAnswerObs oAdtType ON e.encounter_id = oAdtType.encounter_id and oAdtType.question_full_name = 'RHS - Support equipment receive source'
    )
    WHERE
        ! p.voided AND ! v.voided AND ! e.voided
            AND DATE(oAdtType.obs_datetime) BETWEEN   DATE('#startDate#') AND DATE('#endDate#')
            AND oAdtType.answer_full_name IN ('RHS - Self purchase' , 'Hospital', 'RHS - Other government office', 'RHS - Rehabitation center','RHS - Other organization')
  union all select 'RHS - Support equipment receive source','','0' 
            ) raw_data
GROUP BY raw_data.question
