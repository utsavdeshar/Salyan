SELECT  fi.caste_ethnicity AS 'Caste/Ethnicity',
		fi_female AS 'Full Immunization-Female',
		fi_male AS 'Full Immunization-Male'
      
FROM
(SELECT
	caste_list.answer_concept_name AS caste_ethnicity,
	SUM(IF(person.gender = 'F', 1, 0)) AS fi_female,
    SUM(IF(person.gender = 'M', 1, 0)) AS fi_male

FROM visit
INNER JOIN person ON visit.patient_id = person.person_id
	AND DATE(visit.date_stopped) BETWEEN '#startDate#' AND '#endDate#'
INNER JOIN person_attribute ON person_attribute.person_id = person.person_id
INNER JOIN person_attribute_type ON person_attribute.person_attribute_type_id = person_attribute_type.person_attribute_type_id AND person_attribute_type.name = 'Caste'
INNER JOIN encounter ON visit.visit_id = encounter.visit_id
INNER JOIN obs_view ON encounter.encounter_id = obs_view.encounter_id
INNER JOIN concept_name on obs_view.value_coded = concept_name.concept_id
	AND obs_view.concept_full_name IN ('Vaccine-Measles or rubella') and concept_name.name='Number-2'
    AND obs_view.voided is FALSE
RIGHT OUTER JOIN (SELECT answer_concept_name, answer_concept_id FROM concept_answer_view WHERE question_concept_name = 'Caste' ) AS caste_list ON caste_list.answer_concept_id = person_attribute.value
GROUP BY caste_list.answer_concept_name) AS fi
