// Verification scoring logic
const removeStopwords = (text) => {
  const stopwords = ['a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'for', 'if', 'in', 'into', 'is', 'it', 'no', 'not', 'of', 'on', 'or', 'such', 'that', 'the', 'their', 'then', 'there', 'these', 'they', 'this', 'to', 'was', 'will', 'with', 'yes', 'around', 'about', 'some'];
  return text.split(/[\s,]+/).filter(w => !stopwords.includes(w) && w.length > 1);
};

export const scoreOwnerAnswers = (foundItem, ownerAnswers) => {
  const vQuestions = foundItem.verificationQuestions;
  if (!vQuestions || vQuestions.length !== 2) {
    throw new Error('Found item does not have valid verification questions.');
  }

  const feedback = [];
  let totalScore = 0;

  ownerAnswers.forEach((ownerAns) => {
    const qIndex = ownerAns.questionIndex;
    const vq = vQuestions[qIndex];
    if (!vq) return;

    const correctAnsStr = vq.answer.toLowerCase().trim();
    const ownerAnsStr = ownerAns.answer.toLowerCase().trim();
    const type = vq.answerType;

    let score = 0;

    const cnormExact = correctAnsStr.replace(/[^\w\s]/g, '');
    const onormExact = ownerAnsStr.replace(/[^\w\s]/g, '');

    // ALWAYS check for an exact match first, regardless of answerType
    if (cnormExact === onormExact && cnormExact.length > 0) {
      score = 100;
    } else if (type === 'exact') {
      score = 0;
    } else if (!type || type === 'generic') {
      const cnorm = cnormExact;
      const onorm = onormExact;
      
      if (cnorm.length > 3 && (onorm.includes(cnorm) || cnorm.includes(onorm))) {
        score = 100;
      } else {
        const cWords = cnorm.split(/\s+/).filter(w => w.length > 2);
        const oWords = onorm.split(/\s+/).filter(w => w.length > 2);
        
        let matches = 0;
        oWords.forEach(w => {
           if (cWords.includes(w)) matches++;
        });
        
        if (cWords.length === 0) {
           score = (cnorm === onorm) ? 100 : 0;
        } else {
           const ratio = matches / cWords.length;
           if (ratio >= 0.5) score = 100;
           else if (ratio > 0) score = 50;
           else score = 0;
        }
      }
    }
    else if (type === 'numeric') {
      const cNum = parseFloat(correctAnsStr.replace(/[^\d.-]/g, ''));
      const oNum = parseFloat(ownerAnsStr.replace(/[^\d.-]/g, ''));
      
      if (!isNaN(cNum) && !isNaN(oNum)) {
        const diff = Math.abs(cNum - oNum);
        if (diff <= cNum * 0.20) {
          score = 100;
        } else if (diff <= cNum * 0.40) {
          score = 50;
        }
      }
    } 
    else if (type === 'keyword' || type === 'descriptive') {
      const cKeywords = removeStopwords(cnormExact);
      const oKeywords = removeStopwords(onormExact);
      
      if (cKeywords.length === 0) {
        // If the answer was entirely stopwords or single letters, we already checked exact match above.
        // If we reach here, it means it wasn't an exact match, so partial string matching:
        if (onormExact.includes(cnormExact) || cnormExact.includes(onormExact)) {
          score = 100;
        } else {
          score = 0;
        }
      } else {
        let matches = 0;
        oKeywords.forEach(kw => {
          if (cKeywords.includes(kw)) matches++;
        });
        
        const ratio = matches / cKeywords.length;
        
        if (ratio >= 0.6) score = 100;
        else if (ratio >= 0.3) score = 50;
        else score = 0;
      }
    }

    totalScore += score;
    feedback.push({
      questionIndex: qIndex,
      passed: score >= 50,
      hint: vq.hint
    });
  });

  const finalScore = totalScore / 2;
  const approved = finalScore >= 70;
  const canRetry = finalScore >= 40 && finalScore < 70;

  return {
    approved,
    score: finalScore,
    canRetry,
    feedback
  };
};
