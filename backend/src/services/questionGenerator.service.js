export const getQuestionsForCategory = (category) => {
  const categoryMap = {
    wallet: [
      {
        question: 'Approximately how much cash is inside the wallet?',
        answerType: 'numeric',
        placeholder: 'e.g. around 200-300 rupees',
        hint: 'Number (or approximate number) of currency'
      },
      {
        question: 'Is there any ID, card, or name visible? If yes what name or details?',
        answerType: 'keyword',
        placeholder: 'e.g. Yes, Rahul Sharma / No ID found',
        hint: 'Keywords from cards or IDs'
      }
    ],
    mobile_phone: [
      {
        question: 'What color is the phone and does it have a case? Describe it.',
        answerType: 'keyword',
        placeholder: 'e.g. Black phone with blue case',
        hint: 'Physical description'
      },
      {
        question: 'Is there a name, number, or contact visible on the lock screen?',
        answerType: 'keyword',
        placeholder: 'e.g. Emergency contact: 9876XXXXXX',
        hint: 'Text on lock screen'
      }
    ],
    laptop: [
      {
        question: 'What stickers or marks are on the laptop lid? Describe them.',
        answerType: 'descriptive',
        placeholder: 'e.g. One India flag sticker, no other marks',
        hint: 'Detailed physical description'
      },
      {
        question: 'What brand and model is the laptop?',
        answerType: 'keyword',
        placeholder: 'e.g. Dell Inspiron 15, model number visible',
        hint: 'Brand and model'
      }
    ],
    keys: [
      {
        question: 'How many keys are on the ring and what types are they?',
        answerType: 'descriptive',
        placeholder: 'e.g. 3 keys: 1 car key, 2 house keys',
        hint: 'Number and type of keys'
      },
      {
        question: 'Describe the keychain or any tag attached to the keys.',
        answerType: 'keyword',
        placeholder: 'e.g. Small red ball keychain',
        hint: 'Keychain description'
      }
    ],
    id_card: [
      {
        question: 'What is the name printed on the ID card?',
        answerType: 'exact',
        placeholder: 'e.g. Priya Mehta',
        hint: 'Exact name on ID'
      },
      {
        question: 'What institution or organization issued the ID card?',
        answerType: 'keyword',
        placeholder: 'e.g. Bangalore University',
        hint: 'Institution name'
      }
    ],
    bags: [
      {
        question: 'What color is the inside lining of the bag?',
        answerType: 'keyword',
        placeholder: 'e.g. Red lining',
        hint: 'Inside color'
      },
      {
        question: 'List the main items found inside the bag.',
        answerType: 'keyword',
        placeholder: 'e.g. Umbrella, water bottle, and a notebook',
        hint: 'Contents of the bag'
      }
    ],
    earbuds: [
      {
        question: 'What brand and model are the earbuds?',
        answerType: 'keyword',
        placeholder: 'e.g. Apple AirPods Pro',
        hint: 'Brand and model'
      },
      {
        question: 'What color is the earbuds case?',
        answerType: 'keyword',
        placeholder: 'e.g. White case',
        hint: 'Case color'
      }
    ],
    books: [
      {
        question: 'What is the title and author name written on the book?',
        answerType: 'exact',
        placeholder: 'e.g. The Alchemist by Paulo Coelho',
        hint: 'Exact title and author'
      },
      {
        question: 'Is there a name written inside the cover? If yes what name?',
        answerType: 'keyword',
        placeholder: 'e.g. Yes, Rohan',
        hint: 'Name inside cover'
      }
    ],
    documents: [
      {
        question: 'What name is printed on the documents?',
        answerType: 'exact',
        placeholder: 'e.g. Amit Kumar',
        hint: 'Exact name'
      },
      {
        question: 'What type of documents are they?',
        answerType: 'keyword',
        placeholder: 'e.g. Property papers / Tax returns',
        hint: 'Document type'
      }
    ],
    jewelry: [
      {
        question: 'Describe any engraving, text, or design on the jewelry.',
        answerType: 'descriptive',
        placeholder: 'e.g. Engraved with the date 12/04/2020',
        hint: 'Engravings or specific designs'
      },
      {
        question: 'What metal or material does it appear to be made of?',
        answerType: 'keyword',
        placeholder: 'e.g. Gold / Silver with a blue stone',
        hint: 'Material'
      }
    ],
    clothing: [
      {
        question: 'What brand label is inside the clothing?',
        answerType: 'keyword',
        placeholder: 'e.g. Zara / Levi\'s',
        hint: 'Brand name'
      },
      {
        question: 'What size is printed on the tag?',
        answerType: 'exact',
        placeholder: 'e.g. Medium / 32',
        hint: 'Exact size'
      }
    ],
    other: [
      {
        question: 'Describe the item in as much detail as possible.',
        answerType: 'descriptive',
        placeholder: 'e.g. A blue umbrella with a wooden handle',
        hint: 'Detailed description'
      },
      {
        question: 'Are there any numbers, names, or unique marks on the item?',
        answerType: 'keyword',
        placeholder: 'e.g. A small scratch on the bottom right',
        hint: 'Unique identifying marks'
      }
    ]
  };

  // Fallback to 'other' if category is not found or not provided
  const qs = categoryMap[category] || categoryMap['other'];
  
  // Clone to avoid mutation issues
  return JSON.parse(JSON.stringify(qs));
};

export const validateAnswersForCategory = (category, answers) => {
  if (!Array.isArray(answers) || answers.length !== 2) {
    return { valid: false, errors: ['Exactly 2 answers are required.'] };
  }

  const questions = getQuestionsForCategory(category);
  const errors = [];

  answers.forEach((ans, idx) => {
    if (typeof ans !== 'string' || ans.trim() === '') {
      errors.push(`Answer for question ${idx + 1} cannot be empty.`);
    } else {
      // Basic type validation for numeric type
      if (questions[idx].answerType === 'numeric') {
        const num = parseFloat(ans.replace(/[^\d.-]/g, ''));
        if (isNaN(num)) {
          errors.push(`Answer for question ${idx + 1} must contain a valid number.`);
        }
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
};
