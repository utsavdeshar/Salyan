
SELECT 
    first_answers.answer_name AS 'ICD name',
    first_answers.icd11_code AS 'ICD CODE', 
    IFNULL(SUM(CASE
                WHEN
                    second_concept.gender = 'F'
                        AND second_concept.person_id IS NOT NULL
                THEN
                    1
                ELSE 0
            END),
            0) AS 'FEMALE PATIENT',
    IFNULL(SUM(CASE
                WHEN
                    second_concept.gender = 'M'
                        AND second_concept.person_id IS NOT NULL
                THEN
                    1
                ELSE 0
            END),
            0) AS 'MALE PATIENT'
FROM
    (SELECT 
        concept_full_name AS answer_name, icd11_code
    FROM
        diagnosis_concept_view_new
    WHERE
        icd11_code REGEXP concat_ws("|",
		"^GB60",
		"^GB61",
		"^GB40",
		"^GB41",
		"^MB4D",
		"^MG26",
		"DA42$",
		"^PA75",
		"^MD81.4",
		"^DB93.1",
		"^NE2Z",
		"^NE60",
		"^PA7Z",
		"^1C82",
		"^PA7Z",
        "XE9H6","XE44L","PA9Z"
        )
        ) first_answers 
        LEFT OUTER JOIN
    (SELECT DISTINCT
        (p.person_id),
            dcv.concept_full_name,
            icd11_code,
             v.visit_id AS visit_id,
            p.gender AS gender
    FROM
        person p
    INNER JOIN visit v ON p.person_id = v.patient_id
        AND v.voided = 0
    INNER JOIN encounter e ON v.visit_id = e.visit_id AND e.voided = 0
    INNER JOIN obs o ON e.encounter_id = o.encounter_id
        AND o.voided = 0
        AND DATE(o.obs_datetime) BETWEEN '#startDate#' AND '#endDate#'
    INNER JOIN concept_name cn ON o.concept_id = cn.concept_id
        AND cn.concept_name_type = 'FULLY_SPECIFIED'
        AND cn.name IN ('Coded Diagnosis')
        AND o.voided = 0
        AND cn.voided = 0
     JOIN diagnosis_concept_view_new dcv ON dcv.concept_id = o.value_coded
        AND dcv.icd11_code    REGEXP concat_ws("|",
		"^GB60",
		"^GB61",
		"^GB40",
		"^GB41",
		"^MB4D",
		"^MG26",
		"DA42$",
		"^PA75",
		"^MD81.4",
		"^DB93.1",
		"^NE2Z",
		"^NE60",
		"^PA7Z",
		"^1C82",
		"^PA7Z",
        "XE9H6","XE44L","PA9Z"
        )
    WHERE
        p.voided = 0) first_concept ON first_concept.icd11_code = first_answers.icd11_code
        and first_answers.answer_name = first_concept.concept_full_name
        LEFT OUTER JOIN
    (SELECT DISTINCT  (person.person_id) AS person_id,
            visit.visit_id AS visit_id,
            person.gender AS gender
   FROM person 
     JOIN visit  ON person_id = visit.patient_id 
     JOIN visit_type vt ON visit.visit_type_id = vt.visit_type_id AND vt.name != 'IPD'
    WHERE
        cast(visit.date_started AS DATE) BETWEEN DATE('#startDate#') AND DATE('#endDate#')
        
        ) second_concept ON first_concept.person_id = second_concept.person_id
        AND first_concept.visit_id = second_concept.visit_id
 GROUP BY substr(first_answers.icd11_code,1,4)
 ORDER BY FIELD(substr(first_answers.icd11_code,1,4),"GB60","GB61","GB40","GB41","MB4D","MG26","DA42","PA75","MD81","DB93","NE2Z","NE60","PA7Z","1C82","PA7Z","XE9H","XE44","PA9Z")
