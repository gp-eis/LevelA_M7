(() => {
  const STORAGE_KEY = 'athletePeopleLanguage';
  const supportedLanguages = new Set(['en', 'ko']);

  const messages = {
    en: {
      'page.weekSelectorTitle': 'Choose a Week — Athlete',
      'home.chooseWeek': 'Choose a Week',
      'home.prompt': 'Pick a week to learn, read, and play together!',
      'home.goToGpEis': '🏫 Go to GP EIS',
      'home.weekChoices': 'Choose a week',
      'common.comingSoon': 'Coming soon',
      'week.1.label': 'Week 1',
      'week.2.label': 'Week 2',
      'week.3.label': 'Week 3',
      'week.4.label': 'Week 4',
      'week.1.topic': 'What sport do you play?',
      'week.2.topic': 'What do you practice?',
      'week.3.topic': 'Where are we?',
      'week.4.topic': 'When are the Olympic Games?',
      'week.1.title': 'Week 1 — Athlete',
      'week.2.title': 'Week 2 — What do you practice? — Athlete',
      'week.3.title': 'Week 3 — Where are we? — Athlete',
      'week.4.title': 'Week 4 — When are the Olympic Games? — Athlete',
      'week.1.heading': 'Week 1 — Athlete!',
      'week.2.heading': 'Week 2 — Athlete!',
      'week.3.heading': 'Week 3 — Athlete!',
      'week.4.heading': 'Week 4 — Athlete!',
      'week.1.choices': 'Week 1 learning choices',
      'week.2.choices': 'Week 2 learning choices',
      'week.3.choices': 'Week 3 learning choices',
      'week.4.choices': 'Week 4 learning choices',
      'category.literacy': 'Literacy',
      'category.reading': 'Reading',
      'category.phonics': 'Phonics',
      'category.games': 'Games',
      'nav.previous': 'Previous choice',
      'nav.next': 'Next choice',
      'nav.carouselPosition': 'Carousel position',
      'nav.showLiteracy': 'Show Literacy',
      'nav.showReading': 'Show Reading',
      'nav.showPhonics': 'Show Phonics',
      'nav.showGames': 'Show Games',
      'nav.allWeeks': '⬅️ All Weeks',
      'image.literacy': 'GP Friend reading a letter book',
      'image.reading': 'GP Friend reading a sports story',
      'image.phonics': 'Koala GP Friend holding a letter',
      'image.phonicsA': 'Koala GP Friend holding the letter A',
      'image.games': 'Beaver GP Friend holding a game controller'
    },
    ko: {
      'page.weekSelectorTitle': '주차 선택 — Athlete',
      'home.chooseWeek': '주차를 선택해요',
      'home.prompt': '함께 배우고, 읽고, 신나게 놀아 봐요!',
      'home.goToGpEis': '🏫 GP EIS로 이동',
      'home.weekChoices': '학습할 주차 선택',
      'common.comingSoon': '곧 만나요',
      'week.1.label': '1주차',
      'week.2.label': '2주차',
      'week.3.label': '3주차',
      'week.4.label': '4주차',
      'week.1.topic': '어떤 운동을 하나요?',
      'week.2.topic': '무엇을 연습하나요?',
      'week.3.topic': '우리는 어디에 있나요?',
      'week.4.topic': '올림픽 경기는 언제 열리나요?',
      'week.1.title': '1주차 — Athlete',
      'week.2.title': '2주차 — 무엇을 연습하나요? — Athlete',
      'week.3.title': '3주차 — 우리는 어디에 있나요? — Athlete',
      'week.4.title': '4주차 — 올림픽 경기는 언제 열리나요? — Athlete',
      'week.1.heading': '1주차 — Athlete!',
      'week.2.heading': '2주차 — Athlete!',
      'week.3.heading': '3주차 — Athlete!',
      'week.4.heading': '4주차 — Athlete!',
      'week.1.choices': '1주차 학습 선택',
      'week.2.choices': '2주차 학습 선택',
      'week.3.choices': '3주차 학습 선택',
      'week.4.choices': '4주차 학습 선택',
      'category.literacy': '문해 학습',
      'category.reading': '읽기',
      'category.phonics': '파닉스',
      'category.games': '게임',
      'nav.previous': '이전 항목',
      'nav.next': '다음 항목',
      'nav.carouselPosition': '카드 위치',
      'nav.showLiteracy': '문해 학습 보기',
      'nav.showReading': '읽기 보기',
      'nav.showPhonics': '파닉스 보기',
      'nav.showGames': '게임 보기',
      'nav.allWeeks': '⬅️ 모든 주차',
      'image.literacy': '글자책을 읽는 GP 프렌즈',
      'image.reading': '운동 이야기를 읽는 GP 프렌즈',
      'image.phonics': '글자를 들고 있는 코알라 GP 프렌즈',
      'image.phonicsA': '알파벳 A를 들고 있는 코알라 GP 프렌즈',
      'image.games': '게임 컨트롤러를 들고 있는 비버 GP 프렌즈'
    }
  };

  // Only shared interface wording belongs here. English lesson targets,
  // vocabulary, questions, and answer sentences intentionally stay English.
  const interfaceCopyKo = {
    'Start Activity': '활동 시작',
    'Start the Activity': '활동 시작',
    'Try Again': '다시 해 보기',
    'Play Again': '다시 하기',
    'Do It Again': '다시 해 보기',
    'Next Page': '다음 페이지',
    'Previous Page': '이전 페이지',
    'Back': '뒤로',
    'Close': '닫기',
    'Continue': '계속하기',
    'Activity': '활동',
    'Flashcards': '플래시카드',
    'Conversation': '대화',
    'All Weeks': '모든 주차',
    'All Games': '모든 게임',
    'Phonics Lesson': '파닉스 수업',
    'Phonics Games': '파닉스 게임',
    'Back to Wheel': '룰렛으로 돌아가기',
    'Back to Games': '게임으로 돌아가기',
    'Back to Lesson': '수업으로 돌아가기',
    'Back to Week 1': '1주차로 돌아가기',
    'Back to Week 2': '2주차로 돌아가기',
    'Back to Week 3': '3주차로 돌아가기',
    'Back to Week 4': '4주차로 돌아가기',
    'Page navigation': '페이지 이동',
    'Week tools': '주차 학습 도구',
    'Coming soon': '준비 중',
    'Listen': '듣기',
    'Listen Again': '다시 듣기',
    'Listen to the question': '질문 듣기',
    'Listen to the directions.': '설명을 들어 보세요.',
    'Listen to the question.': '질문을 들어 보세요.',
    'Listen to the activity instructions': '활동 설명 듣기',
    'Listen to the congratulations message': '축하 메시지 듣기',
    'Read Aloud': '소리 내어 읽기',
    'Check Answer': '정답 확인',
    'Choose an answer.': '정답을 골라 보세요.',
    'Choose the right answer.': '알맞은 답을 골라 보세요.',
    'Click the right answer.': '알맞은 답을 눌러 보세요.',
    'Click the picture.': '그림을 눌러 보세요.',
    'Click a picture.': '그림을 하나 눌러 보세요.',
    'Click the card to flip it!': '카드를 눌러 뒤집어 보세요!',
    'Click a card to begin!': '카드를 눌러 시작해요!',
    'Press Start Activity when you are ready.': '준비가 되면 활동 시작 버튼을 누르세요.',
    'Press Start Activity and listen.': '활동 시작 버튼을 누르고 잘 들어 보세요.',
    'Get ready!': '준비하세요!',
    'Get ready…': '준비하세요…',
    'Drag the picture to the blank.': '그림을 빈칸으로 끌어다 놓으세요.',
    'Drag a letter to the blank.': '글자를 빈칸으로 끌어다 놓으세요.',
    'Drag a picture here': '그림을 여기로 끌어오세요',
    'Match the picture to the sentence.': '문장에 맞는 그림을 찾아보세요.',
    'Pick the picture that matches the sentence.': '문장과 어울리는 그림을 골라 보세요.',
    'Listen carefully, then choose the right answer!': '잘 듣고 알맞은 답을 골라 보세요!',
    'Listen to the sentence. Tap the matching picture!': '문장을 듣고 알맞은 그림을 눌러 보세요!',
    'Listen to the sentence, then pick the picture that matches!': '문장을 듣고 어울리는 그림을 골라 보세요!',
    'Listen to the question, then pick the best answer!': '질문을 듣고 가장 알맞은 답을 골라 보세요!',
    'Listen, then choose athlete A, B, or C.': '잘 듣고 A, B, C 선수 중 한 명을 골라 보세요.',
    'Spin the wheel!': '룰렛을 돌려 보세요!',
    'Spin slowly, press stop, then flip your picture card!': '룰렛을 돌리고 멈춤을 누른 다음 그림 카드를 뒤집어 보세요!',
    'SPIN!': '돌리기!',
    'STOP!': '멈추기!',
    'Watch Video': '동영상 보기',
    'Back to Reading': '읽기로 돌아가기',
    'Close celebration': '축하 화면 닫기',
    'Close the celebration': '축하 화면 닫기',
    'Your browser does not support HTML video.': '이 브라우저에서는 동영상을 재생할 수 없습니다.',
    'Great job!': '참 잘했어요!',
    'Good job!': '잘했어요!',
    'Correct!': '정답이에요!',
    'Try again.': '다시 해 보세요.',
    'Try again!': '다시 해 보세요!',
    'Almost! Try again.': '거의 다 왔어요! 다시 해 보세요.',
    'Not quite. Try again!': '조금 아쉬워요. 다시 해 보세요!',
    'Your turn!': '이제 여러분 차례예요!',
    'Loading…': '불러오는 중…',
    'Loading...': '불러오는 중...'
  };

  const originalText = new WeakMap();
  const originalAttributes = new WeakMap();
  let currentLanguage = 'en';
  let applyingTranslation = false;
  let translationObserver = null;

  const splitDecoration = (text) => {
    const normalized = text.trim().replace(/\s+/g, ' ');
    const leading = normalized.match(/^[\p{Extended_Pictographic}\uFE0F\u200D\u2190-\u2BFF]+\s*/u)?.[0] || '';
    const remainder = normalized.slice(leading.length);
    const trailing = remainder.match(/\s*[\p{Extended_Pictographic}\uFE0F\u200D\u2190-\u2BFF]+$/u)?.[0] || '';
    return {
      prefix: leading,
      suffix: trailing,
      words: remainder.slice(0, remainder.length - trailing.length).trim()
    };
  };

  const findInterfaceTranslation = (words) => {
    if (interfaceCopyKo[words]) return interfaceCopyKo[words];

    let match = words.match(/^Page (\d+) of (\d+)$/i);
    if (match) return `${match[2]}페이지 중 ${match[1]}페이지`;

    match = words.match(/^Week ([1-4]) Home$/i);
    if (match) return `${match[1]}주차 홈`;

    match = words.match(/^Week ([1-4]) Games$/i);
    if (match) return `${match[1]}주차 게임`;

    match = words.match(/^Play the Week ([1-4]) literacy video$/i);
    if (match) return `${match[1]}주차 문해 동영상 재생`;

    match = words.match(/^Literacy Week ([1-4]) video$/i);
    if (match) return `${match[1]}주차 문해 동영상`;

    match = words.match(/^Go to Page (\d+)$/i);
    if (match) return `${match[1]}페이지로 이동`;

    match = words.match(/^Listen to answer:\s*(.+)$/i);
    if (match) return `답 듣기: ${match[1]}`;

    match = words.match(/^Listen to:\s*(.+)$/i);
    if (match) return `듣기: ${match[1]}`;

    match = words.match(/^Listen to (.+)$/i);
    if (match) return `${match[1]} 듣기`;

    match = words.match(/^Choose the cyclist who is (first|second|third|fourth|last)$/i);
    if (match) {
      const positions = { first:'첫 번째', second:'두 번째', third:'세 번째', fourth:'네 번째', last:'마지막' };
      return `${positions[match[1].toLowerCase()]} 자전거 선수를 고르세요`;
    }

    match = words.match(/^(First|Second|Third|Fourth|Last) cyclist$/i);
    if (match) {
      const positions = { first:'첫 번째', second:'두 번째', third:'세 번째', fourth:'네 번째', last:'마지막' };
      return `${positions[match[1].toLowerCase()]} 자전거 선수`;
    }

    match = words.match(/^Choose the (.+) pose\.$/i);
    if (match) return `${match[1]} 동작을 골라 보세요.`;

    match = words.match(/^Choose the (.+) flag\.$/i);
    if (match) return `${match[1]} 깃발을 골라 보세요.`;

    match = words.match(/^Great job!\s*(.+)$/i);
    if (match) return `참 잘했어요! ${match[1]}`;

    match = words.match(/^Try again[.!]\s*(.+)$/i);
    if (match) return `다시 해 보세요. ${match[1]}`;

    return '';
  };

  const translateTextNode = (node, language) => {
    if (!node.nodeValue?.trim()) return;
    const parent = node.parentElement;
    if (!parent || parent.closest('script, style, template, [data-i18n]')) return;

    if (language === 'en') {
      const original = originalText.get(node);
      if (original !== undefined) node.nodeValue = original;
      return;
    }

    const { prefix, suffix, words } = splitDecoration(node.nodeValue);
    const translated = findInterfaceTranslation(words);
    if (!translated) return;
    if (!originalText.has(node)) originalText.set(node, node.nodeValue);
    const leading = node.nodeValue.match(/^\s*/)?.[0] || '';
    const trailing = node.nodeValue.match(/\s*$/)?.[0] || '';
    node.nodeValue = `${leading}${prefix}${translated}${suffix}${trailing}`;
  };

  const translateInterfaceCopy = (language, root = document.body) => {
    if (!root) return;
    applyingTranslation = true;
    try {
      const textWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let textNode = textWalker.nextNode();
      while (textNode) {
        translateTextNode(textNode, language);
        textNode = textWalker.nextNode();
      }

      root.querySelectorAll?.('[aria-label], [title], [placeholder]').forEach((element) => {
        ['aria-label', 'title', 'placeholder'].forEach((attribute) => {
          const currentValue = element.getAttribute(attribute);
          if (!currentValue) return;
          let saved = originalAttributes.get(element);
          if (language === 'en') {
            const original = saved?.[attribute];
            if (original !== undefined) element.setAttribute(attribute, original);
            return;
          }
          const { prefix, suffix, words } = splitDecoration(currentValue);
          const translated = findInterfaceTranslation(words);
          if (!translated) return;
          if (!saved) {
            saved = {};
            originalAttributes.set(element, saved);
          }
          if (saved[attribute] === undefined) saved[attribute] = currentValue;
          element.setAttribute(attribute, `${prefix}${translated}${suffix}`);
        });
      });
    } finally {
      applyingTranslation = false;
    }
  };

  const watchDynamicInterfaceCopy = () => {
    if (translationObserver || !document.body) return;
    translationObserver = new MutationObserver((records) => {
      if (applyingTranslation || currentLanguage !== 'ko') return;
      records.forEach((record) => {
        if (record.type === 'characterData') {
          applyingTranslation = true;
          try { translateTextNode(record.target, 'ko'); } finally { applyingTranslation = false; }
          return;
        }
        record.addedNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            applyingTranslation = true;
            try { translateTextNode(node, 'ko'); } finally { applyingTranslation = false; }
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            translateInterfaceCopy('ko', node);
          }
        });
      });
    });
    translationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  };

  const readSavedLanguage = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return supportedLanguages.has(saved) ? saved : 'en';
    } catch (_error) {
      return 'en';
    }
  };

  const saveLanguage = (language) => {
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch (_error) {
      // The language still changes for this page when storage is unavailable.
    }
  };

  const makeLanguageSwitcher = () => {
    if (document.querySelector('.language-switcher')) return;

    const switcher = document.createElement('div');
    switcher.className = 'language-switcher';
    switcher.setAttribute('role', 'group');
    switcher.innerHTML = `
      <button class="language-option" type="button" data-language="en">
        <span class="language-option__flag" aria-hidden="true">🇺🇸</span>
        <span class="language-option__code">EN</span>
      </button>
      <button class="language-option" type="button" data-language="ko">
        <span class="language-option__flag" aria-hidden="true">🇰🇷</span>
        <span class="language-option__code">한국어</span>
      </button>`;
    document.body.appendChild(switcher);

    switcher.addEventListener('click', (event) => {
      const button = event.target.closest('[data-language]');
      if (!button) return;
      applyLanguage(button.dataset.language, true);
    });
  };

  const translateAttribute = (selector, attribute, language) => {
    document.querySelectorAll(selector).forEach((element) => {
      const key = element.dataset[attribute];
      const translated = messages[language][key];
      if (!translated) return;
      const htmlAttribute = attribute === 'i18nAriaLabel' ? 'aria-label' : 'alt';
      element.setAttribute(htmlAttribute, translated);
    });
  };

  function applyLanguage(language, remember = false) {
    const selectedLanguage = supportedLanguages.has(language) ? language : 'en';
    const dictionary = messages[selectedLanguage];

    currentLanguage = selectedLanguage;
    applyingTranslation = true;

    try {
      document.documentElement.lang = selectedLanguage === 'ko' ? 'ko-KR' : 'en-US';
      document.documentElement.dataset.language = selectedLanguage;

      document.querySelectorAll('[data-i18n]').forEach((element) => {
        const translated = dictionary[element.dataset.i18n];
        if (translated) element.textContent = translated;
      });
      translateAttribute('[data-i18n-aria-label]', 'i18nAriaLabel', selectedLanguage);
      translateAttribute('[data-i18n-alt]', 'i18nAlt', selectedLanguage);
    } finally {
      applyingTranslation = false;
    }

    translateInterfaceCopy(selectedLanguage);

    document.querySelectorAll('.language-option').forEach((button) => {
      const isSelected = button.dataset.language === selectedLanguage;
      const isEnglishButton = button.dataset.language === 'en';
      const label = selectedLanguage === 'ko'
        ? (isEnglishButton ? '미국 영어로 변경' : '한국어 사용 중')
        : (isEnglishButton ? 'American English selected' : 'Switch to Korean');
      button.classList.toggle('is-active', isSelected);
      button.setAttribute('aria-pressed', String(isSelected));
      button.setAttribute('aria-label', label);
      button.title = label;
    });

    const switcher = document.querySelector('.language-switcher');
    if (switcher) {
      switcher.setAttribute('aria-label', selectedLanguage === 'ko' ? '언어 선택' : 'Choose language');
    }

    if (remember) saveLanguage(selectedLanguage);
    window.dispatchEvent(new CustomEvent('athletelanguagechange', {
      detail: { language: selectedLanguage }
    }));
  }

  const initializeLanguage = () => {
    if (document.body.matches('.weekly-selection-page, .week-home')) makeLanguageSwitcher();
    applyLanguage(readSavedLanguage());
    watchDynamicInterfaceCopy();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeLanguage, { once: true });
  } else {
    initializeLanguage();
  }

  window.athletePeopleLanguage = {
    get: readSavedLanguage,
    set: (language) => applyLanguage(language, true)
  };
})();
