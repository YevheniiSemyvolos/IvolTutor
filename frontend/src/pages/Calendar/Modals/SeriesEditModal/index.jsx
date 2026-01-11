import React from 'react';
import styles from './SeriesEditModal.module.css';

const SeriesEditModal = ({ isOpen, onClose, onSingleEdit, onSeriesEdit }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h2 className={styles.title}>Редагування заняття</h2>
        <p className={styles.description}>
          Це заняття є частиною серії щотижневих занять. 
          Як ви хочете застосувати зміни?
        </p>
        
        <div className={styles.buttons}>
          <button 
            className={styles.singleButton}
            onClick={onSingleEdit}
          >
            Тільки це заняття
          </button>
          <button 
            className={styles.seriesButton}
            onClick={onSeriesEdit}
          >
            Всі наступні заняття
          </button>
        </div>
        
        <button className={styles.cancelButton} onClick={onClose}>
          Скасувати
        </button>
      </div>
    </div>
  );
};

export default SeriesEditModal;
