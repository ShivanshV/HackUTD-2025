import styles from './Header.module.css'

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <h1 className={styles.logo}>TOYOTA</h1>
        <p className={styles.subtitle}>AI Vehicle Assistant</p>
      </div>
    </header>
  )
}

