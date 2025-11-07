'use client';

import { useState } from 'react';
import { useAtom } from 'jotai';
import { showTutorialAtom, tutorialCompletedAtom } from '@/stores/gameAtoms';
import styles from './Tutorial.module.css';

export default function Tutorial() {
  const [showTutorial, setShowTutorial] = useAtom(showTutorialAtom);
  const [, setTutorialCompleted] = useAtom(tutorialCompletedAtom);
  const [currentPage, setCurrentPage] = useState(0);

  if (!showTutorial) return null;

  const pages = [
    {
      title: 'Welcome to My Town!',
      content: (
        <div className={styles.pageContent}>
          <p className={styles.intro}>
            Welcome to your new survival adventure! This is a multiplayer survival game where you'll need to manage your resources and stay alive.
          </p>
          <p>
            You'll need to keep an eye on your survival stats and gather resources to survive. Let's learn the basics!
          </p>
        </div>
      ),
    },
    {
      title: 'Movement Controls',
      content: (
        <div className={styles.pageContent}>
          <div className={styles.controlSection}>
            <h4>Basic Movement</h4>
            <div className={styles.controlItem}>
              <span className={styles.key}>W</span>
              <span>Move Forward</span>
            </div>
            <div className={styles.controlItem}>
              <span className={styles.key}>A</span>
              <span>Move Left</span>
            </div>
            <div className={styles.controlItem}>
              <span className={styles.key}>S</span>
              <span>Move Backward</span>
            </div>
            <div className={styles.controlItem}>
              <span className={styles.key}>D</span>
              <span>Move Right</span>
            </div>
          </div>
          <div className={styles.controlSection}>
            <h4>Camera</h4>
            <div className={styles.controlItem}>
              <span className={styles.key}>Mouse</span>
              <span>Look Around</span>
            </div>
            <div className={styles.controlItem}>
              <span className={styles.key}>Click</span>
              <span>Lock Pointer (required for camera control)</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Survival Stats',
      content: (
        <div className={styles.pageContent}>
          <p className={styles.intro}>
            You have four survival stats that you need to manage:
          </p>
          <div className={styles.statExplanation}>
            <div className={styles.statItem}>
              <span className={styles.statName}>Hunger</span>
              <p>Decreases over time. Eat food to restore it.</p>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statName}>Thirst</span>
              <p>Decreases over time. Drink water to restore it.</p>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statName}>Energy</span>
              <p>Decreases when you move. Rest to restore it.</p>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statName}>Health</span>
              <p>Your overall health. If hunger, thirst, or energy reach 0, your health will decrease!</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Action Controls',
      content: (
        <div className={styles.pageContent}>
          <p className={styles.intro}>
            Use these keys to gather resources and survive:
          </p>
          <div className={styles.controlSection}>
            <div className={styles.controlItem}>
              <span className={styles.key}>E</span>
              <span>Drink Water - Restores thirst</span>
            </div>
            <div className={styles.controlItem}>
              <span className={styles.key}>F</span>
              <span>Eat Food - Restores hunger</span>
            </div>
            <div className={styles.controlItem}>
              <span className={styles.key}>R</span>
              <span>Rest - Restores energy</span>
            </div>
          </div>
          <p className={styles.tip}>
            Tip: You can also use the buttons on the right side of the screen to perform these actions!
          </p>
        </div>
      ),
    },
    {
      title: "You're Ready!",
      content: (
        <div className={styles.pageContent}>
          <p className={styles.intro}>
            You now know the basics! Here's a quick summary:
          </p>
          <ul className={styles.summary}>
            <li>Use WASD to move around</li>
            <li>Click to lock your mouse for camera control</li>
            <li>Keep your survival stats above 0</li>
            <li>Use E, F, and R to gather resources</li>
            <li>Watch out for other players online</li>
          </ul>
          <p className={styles.tip}>
            You can reopen this tutorial anytime from the controls help panel on the right side of the screen.
          </p>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleClose = () => {
    setShowTutorial(false);
    setTutorialCompleted(true);
    localStorage.setItem('tutorialCompleted', 'true');
    setCurrentPage(0);
  };

  const handleSkip = () => {
    handleClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.tutorialBox}>
        <div className={styles.header}>
          <h2>{pages[currentPage].title}</h2>
          <button className={styles.closeBtn} onClick={handleClose}>
            ×
          </button>
        </div>

        <div className={styles.content}>
          {pages[currentPage].content}
        </div>

        <div className={styles.footer}>
          <div className={styles.pagination}>
            {pages.map((_, index) => (
              <span
                key={index}
                className={`${styles.dot} ${index === currentPage ? styles.activeDot : ''}`}
              />
            ))}
          </div>

          <div className={styles.buttons}>
            {currentPage > 0 && (
              <button className={styles.btn} onClick={handlePrevious}>
                Previous
              </button>
            )}
            {currentPage < pages.length - 1 && (
              <button className={styles.btnSecondary} onClick={handleSkip}>
                Skip
              </button>
            )}
            <button className={styles.btnPrimary} onClick={handleNext}>
              {currentPage < pages.length - 1 ? 'Next' : 'Get Started!'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
