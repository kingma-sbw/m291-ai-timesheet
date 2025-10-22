<template>
  <div id="app">
    <header class="app-header">
      <h1>Timesheet Verwaltung</h1>
      <nav>
        <router-link to="/" class="nav-link">Schülerliste</router-link>
      </nav>
    </header>
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
:root {
  --white: #ffffff;
  --bg: #f5f5f5;
  --text: #333333;

  --primary: #667eea;
  --primary-2: #764ba2;
  --primary-hover: #5a6fd8;
  --focus-shadow: rgba(102, 126, 234, 0.1);

  --success: #48bb78;
  --success-hover: #38a169;

  --danger: #f56565;
  --danger-hover: #e53e3e;

  --card-bg: #ffffff;
  --muted: #4a5568;
  --border: #cbd5e0;

  --error-bg: #fed7d7;
  --error-text: #c53030;

  --success-bg: #c6f6d5;
  --success-text: #276749;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background-color: var(--bg);
  color: var(--text);
}

#app {
  min-height: 100vh;
}

.app-header {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-2) 100%);
  color: var(--white);
  padding: 1rem 2rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.app-header h1 {
  margin-bottom: 0.5rem;
}

.nav-link {
  color: var(--white);
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-link:hover {
  background-color: rgba(255,255,255,0.2);
}

.app-main {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.card {
  background: var(--card-bg);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn-primary {
  background-color: var(--primary);
  color: var(--white);
}

.btn-primary:hover {
  background-color: var(--primary-hover);
}

.btn-success {
  background-color: var(--success);
  color: var(--white);
}

.btn-success:hover {
  background-color: var(--success-hover);
}

.btn-danger {
  background-color: var(--danger);
  color: var(--white);
}

.btn-danger:hover {
  background-color: var(--danger-hover);
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: var(--muted);
}

.form-input,
.form-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 1rem;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--focus-shadow);
}

.loading {
  text-align: center;
  padding: 2rem;
  color: var(--primary);
}

.error {
  background-color: var(--error-bg);
  color: var(--error-text);
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.success {
  background-color: var(--success-bg);
  color: var(--success-text);
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}
</style>