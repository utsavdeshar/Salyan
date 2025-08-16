SELECT 
  COUNT(CASE WHEN question_full_name = 'Discharge-Transportation incentive' AND answer_full_name = 'True' THEN 1 END) AS 'Transportation incentive',
  COUNT(CASE WHEN question_full_name = 'Discharge-ANC incentive' AND answer_full_name = 'True' THEN 1 END) AS 'ANC incentive'
FROM nonVoidedQuestionAnswerObs
WHERE question_full_name IN ('Discharge-Transportation incentive', 'Discharge-ANC incentive')
  AND answer_full_name = 'True'
  AND DATE(obs_datetime) BETWEEN '#startDate#' AND '#endDate#';
