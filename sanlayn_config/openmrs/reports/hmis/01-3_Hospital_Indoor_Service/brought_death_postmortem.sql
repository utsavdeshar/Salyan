SELECT 
    first_answers.question_name AS death_information,
    gender.gender AS gender,
    COUNT(DISTINCT (a.ip)) AS count_deaths
FROM
    ((SELECT 
        answer_concept_fully_specified_name.concept_id AS answer,
            answer_concept_fully_specified_name.name AS answer_name,
             question_concept_name.concept_id AS question,
            question_concept_name.NAME AS question_name
    FROM
        concept c
    INNER JOIN concept_datatype cd ON c.datatype_id = cd.concept_datatype_id
    INNER JOIN concept_name question_concept_name ON c.concept_id = question_concept_name.concept_id
        AND question_concept_name.concept_name_type = 'FULLY_SPECIFIED'
        AND question_concept_name.voided IS FALSE
    INNER JOIN global_property gp ON gp.property IN ('concept.true' , 'concept.false')
    INNER JOIN concept_name answer_concept_fully_specified_name ON answer_concept_fully_specified_name.concept_id = gp.property_value
        AND answer_concept_fully_specified_name.concept_name_type = 'FULLY_SPECIFIED'
        AND answer_concept_fully_specified_name.voided
        IS FALSE
    WHERE
        question_concept_name.name IN ('Death note-Brought dead','Death note-Postmortem done')
            AND cd.name = 'Boolean'
    ORDER BY answer_name DESC) first_answers
    INNER JOIN (SELECT 'M' AS gender UNION SELECT 'F' AS gender) gender
    LEFT OUTER JOIN (SELECT 
        distinct(pi.identifier) AS ip,
		p.gender as gender,
		cn1.name AS question,
		cn2.name AS answer
   FROM
        obs o
    INNER JOIN concept_name cn1 ON o.concept_id = cn1.concept_id
        AND cn1.concept_name_type = 'FULLY_SPECIFIED'
        AND cn1.name IN('Death note-Brought dead','Death note-Postmortem done') 
         AND o.voided = 0
AND cn1.voided = 0
    INNER JOIN concept_name cn2 ON o.value_coded = cn2.concept_id
        AND cn2.concept_name_type = 'FULLY_SPECIFIED'
    INNER JOIN encounter e ON o.encounter_id = e.encounter_id
    INNER JOIN visit v ON v.visit_id = e.visit_id
    INNER JOIN person p ON o.person_id = p.person_id
        AND p.voided = 0
    INNER JOIN patient_identifier pi ON pi.patient_id = p.person_id
        AND pi.voided = '0'
    WHERE
          cn2.name = 'True'
        AND DATE(e.encounter_datetime) BETWEEN DATE('#startDate#') AND DATE('#endDate#')
        ) a ON a.gender = gender.gender
        AND a.question = first_answers.question_name AND a.answer = first_answers.answer_name)
GROUP BY first_answers.question , gender.gender
ORDER BY first_answers.question , gender.gender;
