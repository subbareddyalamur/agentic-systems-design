/* ============================================
   Quiz System
   Client-side quiz with localStorage progress tracking
   ============================================ */

const QuizSystem = (() => {
  const STORAGE_KEY = 'masai_quiz_progress';

  function getProgress() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch { return {}; }
  }

  function saveProgress(topicId, score, total) {
    const progress = getProgress();
    progress[topicId] = { score, total, passed: score >= Math.ceil(total * 0.66), timestamp: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    updateSidebarProgress();
  }

  function isTopicPassed(topicId) {
    const progress = getProgress();
    return progress[topicId]?.passed || false;
  }

  function updateSidebarProgress() {
    const progress = getProgress();
    document.querySelectorAll('.sidebar .topic-list li a').forEach(link => {
      const topicId = link.getAttribute('href')?.replace('#', '');
      const check = link.querySelector('.check');
      if (check && topicId && progress[topicId]?.passed) {
        check.classList.add('done');
        check.textContent = '✓';
      }
    });

    // Update progress text
    const allTopics = document.querySelectorAll('.sidebar .topic-list li a');
    const total = allTopics.length;
    let completed = 0;
    allTopics.forEach(link => {
      const topicId = link.getAttribute('href')?.replace('#', '');
      if (topicId && progress[topicId]?.passed) completed++;
    });

    const progressEl = document.querySelector('.sidebar-progress');
    if (progressEl) {
      progressEl.textContent = `${completed} / ${total} topics completed`;
    }

    const progressBar = document.querySelector('.sidebar .progress-bar .fill');
    if (progressBar && total > 0) {
      progressBar.style.width = `${(completed / total) * 100}%`;
    }
  }

  function initQuizzes() {
    document.querySelectorAll('.quiz-wrapper').forEach(quiz => {
      const topicId = quiz.dataset.topicId;
      const questions = quiz.querySelectorAll('.quiz-question');
      const submitBtn = quiz.querySelector('.quiz-submit');
      const resultEl = quiz.querySelector('.quiz-result');
      const answers = {};

      questions.forEach((q, qIndex) => {
        const options = q.querySelectorAll('.quiz-option');
        options.forEach(opt => {
          opt.addEventListener('click', () => {
            // Deselect siblings
            options.forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            answers[qIndex] = opt.dataset.value;
          });
        });
      });

      if (submitBtn) {
        submitBtn.addEventListener('click', () => {
          let score = 0;
          const total = questions.length;

          questions.forEach((q, qIndex) => {
            const correctAnswer = q.dataset.correct;
            const options = q.querySelectorAll('.quiz-option');
            const feedback = q.querySelector('.quiz-feedback');

            options.forEach(opt => {
              opt.style.pointerEvents = 'none';
              if (opt.dataset.value === correctAnswer) {
                opt.classList.add('correct');
              } else if (opt.classList.contains('selected') && opt.dataset.value !== correctAnswer) {
                opt.classList.add('incorrect');
              }
            });

            if (answers[qIndex] === correctAnswer) {
              score++;
              if (feedback) {
                feedback.className = 'quiz-feedback show correct-fb';
                feedback.textContent = '✓ Correct!';
              }
            } else {
              if (feedback) {
                feedback.className = 'quiz-feedback show incorrect-fb';
                feedback.textContent = '✗ ' + (q.dataset.explanation || 'Incorrect');
              }
            }
          });

          submitBtn.style.display = 'none';

          if (resultEl) {
            const passed = score >= Math.ceil(total * 0.66);
            resultEl.className = `quiz-result show ${passed ? 'pass' : 'fail'}`;
            resultEl.textContent = passed
              ? `✓ Passed! ${score}/${total} correct`
              : `✗ ${score}/${total} correct. Review the material and try again.`;
          }

          // Add retry button
          const retryBtn = document.createElement('button');
          retryBtn.className = 'quiz-submit';
          retryBtn.textContent = 'Try Again';
          retryBtn.style.marginTop = '10px';
          retryBtn.addEventListener('click', () => {
            resetQuiz(quiz, submitBtn, resultEl, retryBtn);
          });
          quiz.appendChild(retryBtn);

          saveProgress(topicId, score, total);
        });
      }
    });

    updateSidebarProgress();
  }

  function resetQuiz(quiz, submitBtn, resultEl, retryBtn) {
    quiz.querySelectorAll('.quiz-option').forEach(opt => {
      opt.classList.remove('selected', 'correct', 'incorrect');
      opt.style.pointerEvents = '';
    });
    quiz.querySelectorAll('.quiz-feedback').forEach(fb => {
      fb.className = 'quiz-feedback';
      fb.textContent = '';
    });
    if (resultEl) {
      resultEl.className = 'quiz-result';
      resultEl.textContent = '';
    }
    submitBtn.style.display = '';
    if (retryBtn) retryBtn.remove();
  }

  return { init: initQuizzes, isTopicPassed, getProgress, updateSidebarProgress };
})();

document.addEventListener('DOMContentLoaded', () => QuizSystem.init());
